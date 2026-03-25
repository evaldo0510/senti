import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "motion/react";
import { Send, ArrowLeft, Video, Phone, MoreVertical, FileText, Check, CheckCheck, X } from "lucide-react";
import { chatService } from "../services/chatService";
import { auth } from "../services/firebase";
import { userService } from "../services/userService";
import { Appointment, DirectMessage, UserProfile } from "../types";
import { salvarDadosAnalytics } from "../services/analyticsService";

export default function Atendimento() {
  const navigate = useNavigate();
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const [mensagem, setMensagem] = useState("");
  const [chat, setChat] = useState<DirectMessage[]>([]);
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [otherUser, setOtherUser] = useState<UserProfile | null>(null);
  const [typingStatus, setTypingStatus] = useState<{ [key: string]: boolean }>({});
  const [isCallActive, setIsCallActive] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const jitsiApiRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!appointmentId) return;

    // Fetch appointment details
    const fetchAppointment = async () => {
      try {
        const app = await userService.getAppointment(appointmentId);
        if (app) {
          setAppointment(app);
          
          if (auth.currentUser) {
            const otherUserId = auth.currentUser.uid === app.patientId ? app.therapistId : app.patientId;
            const otherProfile = await userService.getUser(otherUserId);
            if (otherProfile) {
              setOtherUser(otherProfile);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching appointment:", error);
      }
    };
    fetchAppointment();
  }, [appointmentId]);

  useEffect(() => {
    if (!appointmentId) return;

    // Listen for messages - only start when appointment (and its sharedSecret) is available
    // or if we want to support unencrypted messages too.
    const unsubscribe = chatService.listenMessagesByAppointment(appointmentId, appointment?.sharedSecret, (messages) => {
      setChat(messages);
      // Mark messages as read when they arrive
      if (auth.currentUser) {
        chatService.markMessagesAsRead(appointmentId, auth.currentUser.uid);
      }
    });

    // Listen for typing status
    const unsubscribeTyping = chatService.listenTypingStatus(appointmentId, (status) => {
      setTypingStatus(status);
    });

    return () => {
      unsubscribe();
      unsubscribeTyping();
    };
  }, [appointmentId, appointment?.sharedSecret]);

  useEffect(() => {
    scrollToBottom();
  }, [chat]);

  const enviar = async () => {
    if (!mensagem.trim() || !appointmentId || !auth.currentUser || !appointment) return;
    
    const receiverId = auth.currentUser.uid === appointment.patientId 
      ? appointment.therapistId 
      : appointment.patientId;

    try {
      await chatService.sendMessage(appointmentId, auth.currentUser.uid, receiverId, mensagem, appointment.sharedSecret);
      // Stop typing immediately on send
      handleTyping(false);
      
      salvarDadosAnalytics({
        usuario: auth.currentUser?.displayName || "Usuário",
        humor: 5,
        risco: "moderado",
        atendimento: "sim",
        tipo: "terapeuta"
      });
      setMensagem("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleTyping = (isTyping: boolean) => {
    if (!appointmentId || !auth.currentUser) return;
    chatService.setTypingStatus(appointmentId, auth.currentUser.uid, isTyping);
  };

  const onInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMensagem(e.target.value);
    
    // Handle typing indicator
    handleTyping(true);
    
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      handleTyping(false);
    }, 3000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      enviar();
    }
  };

  const startCall = () => {
    if (!appointmentId || !appointment || !auth.currentUser) return;
    
    setIsCallActive(true);
    
    // Small delay to ensure the container is rendered
    setTimeout(() => {
      if (!jitsiContainerRef.current) return;

      const domain = "meet.jit.si";
      const roomName = `SENTI-${appointmentId}-${appointment.sharedSecret?.substring(0, 8) || "secure"}`;
      
      const options = {
        roomName: roomName,
        width: "100%",
        height: "100%",
        parentNode: jitsiContainerRef.current,
        userInfo: {
          displayName: auth.currentUser.displayName || (auth.currentUser.uid === appointment.patientId ? "Paciente" : "Terapeuta"),
          email: auth.currentUser.email || ""
        },
        configOverwrite: {
          startWithAudioMuted: false,
          startWithVideoMuted: false,
          enableWelcomePage: false,
          prejoinPageEnabled: false,
          disableDeepLinking: true,
        },
        interfaceConfigOverwrite: {
          TOOLBAR_BUTTONS: [
            'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
            'fodeviceselection', 'hangup', 'profile', 'chat', 'recording',
            'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
            'videoquality', 'filmstrip', 'invite', 'feedback', 'stats', 'shortcuts',
            'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone',
            'security'
          ],
        }
      };

      try {
        // @ts-ignore
        jitsiApiRef.current = new window.JitsiMeetExternalAPI(domain, options);
        
        jitsiApiRef.current.addEventListeners({
          readyToClose: () => {
            endCall();
          },
          videoConferenceTerminated: () => {
            endCall();
          }
        });
      } catch (error) {
        console.error("Error initializing Jitsi:", error);
        setIsCallActive(false);
      }
    }, 100);
  };

  const endCall = () => {
    if (jitsiApiRef.current) {
      jitsiApiRef.current.dispose();
      jitsiApiRef.current = null;
    }
    setIsCallActive(false);
  };

  useEffect(() => {
    return () => {
      if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose();
      }
    };
  }, []);

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100">
      <header className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="relative">
              {otherUser?.fotoUrl ? (
                <img src={otherUser.fotoUrl} alt={otherUser.nome} className="w-10 h-10 rounded-full object-cover border border-emerald-500/20" />
              ) : (
                <div className="w-10 h-10 bg-emerald-900/50 rounded-full flex items-center justify-center text-emerald-400 font-medium border border-emerald-500/20">
                  {appointment?.patientNome?.[0] || "P"}
                </div>
              )}
              {otherUser?.online && (
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900 animate-pulse" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-medium text-slate-200">
                {auth.currentUser?.uid === appointment?.patientId ? appointment?.therapistNome : appointment?.patientNome || "Paciente"}
              </h2>
              <p className="text-xs text-emerald-400 flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${otherUser?.online ? "bg-emerald-500" : "bg-slate-500"}`}></span>
                {otherUser?.online ? "Online agora" : "Offline"}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={startCall}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-300"
            title="Chamada de Vídeo"
          >
            <Video className="w-5 h-5" />
          </button>
          <button 
            onClick={() => {
              const number = auth.currentUser?.uid === appointment?.patientId 
                ? appointment?.therapistPhone 
                : appointment?.patientPhone;
              
              if (number) {
                // Use phone.call if available, otherwise fallback to tel:
                if (typeof (window as any).phone?.call === 'function') {
                  (window as any).phone.call(number);
                } else {
                  window.location.href = `tel:${number}`;
                }
              } else {
                alert("Número de telefone não disponível para este contato.");
              }
            }}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-300"
            title="Ligar"
          >
            <Phone className="w-5 h-5" />
          </button>
          <button 
            onClick={() => navigate(`/registro/${appointmentId}`)}
            className="flex items-center gap-2 px-3 py-1.5 bg-emerald-900/30 hover:bg-emerald-800/50 text-emerald-300 rounded-full text-sm font-medium transition-colors border border-emerald-500/20 ml-2"
          >
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Prontuário</span>
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 relative">
        {isCallActive && (
          <div className="absolute inset-0 z-50 bg-slate-950 flex flex-col">
            <div className="p-2 flex justify-between items-center bg-slate-900 border-b border-white/10">
              <span className="text-sm font-medium text-emerald-400 ml-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                Chamada em curso
              </span>
              <button 
                onClick={endCall}
                className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div ref={jitsiContainerRef} className="flex-1 w-full h-full" />
          </div>
        )}

        {chat.length === 0 && (
          <div className="text-center text-slate-500 py-10 italic">
            Nenhuma mensagem ainda. Inicie a conversa.
          </div>
        )}
        
        {chat.map((m, i) => (
          <motion.div 
            key={m.id || i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${m.senderId === auth.currentUser?.uid ? "justify-end" : "justify-start"}`}
          >
            <div 
              className={`max-w-[80%] p-4 rounded-2xl ${
                m.senderId === auth.currentUser?.uid 
                  ? "bg-emerald-600 text-white rounded-tr-sm" 
                  : "bg-slate-800 text-slate-200 rounded-tl-sm border border-white/5"
              }`}
            >
              <p className="leading-relaxed whitespace-pre-wrap">{m.text}</p>
              <div className="flex items-center justify-end gap-1 mt-1">
                <p className="text-[10px] opacity-50">
                  {m.timestamp?.toDate ? m.timestamp.toDate().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : ""}
                </p>
                {m.senderId === auth.currentUser?.uid && (
                  m.read ? (
                    <CheckCheck className="w-3 h-3 text-blue-400" />
                  ) : (
                    <Check className="w-3 h-3 opacity-50" />
                  )
                )}
              </div>
            </div>
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-slate-900/80 backdrop-blur-md border-t border-white/10">
        {/* Typing Indicator */}
        {Object.entries(typingStatus).some(([uid, isTyping]) => uid !== auth.currentUser?.uid && isTyping) && (
          <div className="flex items-center gap-2 mb-3 ml-2">
            <div className="bg-slate-800 border border-white/5 rounded-2xl rounded-tl-sm px-4 py-2.5 flex items-center gap-1.5 w-fit">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="text-[10px] text-slate-400 font-medium">
              {auth.currentUser?.uid === appointment?.patientId ? appointment?.therapistNome : appointment?.patientNome} está digitando...
            </span>
          </div>
        )}
        <div className="max-w-4xl mx-auto relative flex items-end gap-2">
          <textarea
            value={mensagem}
            onChange={onInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Digite sua mensagem..."
            className="w-full bg-slate-800/50 border border-white/10 rounded-2xl py-3 px-4 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none min-h-[52px] max-h-32"
            rows={1}
          />
          <button 
            onClick={enviar}
            disabled={!mensagem.trim()}
            className="p-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl transition-colors flex-shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
