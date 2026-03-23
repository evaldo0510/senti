import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { falarComIARA, ChatMessage } from "../services/iaraService";
import { encontrarTerapeutas } from "../services/matchService";
import { generateImage } from "../services/geminiService";
import { falarTexto } from "../services/voiceService";
import { ouvirUsuario } from "../services/audioInput";
import { analisarEmocao } from "../services/emocaoService";
import { gerarExercicio } from "../services/pchService";
import { decidirCaminho } from "../services/decisaoService";
import { Send, ArrowLeft, HeartHandshake, AlertTriangle, Volume2, VolumeX, Image as ImageIcon, Mic, Book } from "lucide-react";
import { motion } from "motion/react";

interface Message {
  tipo: "user" | "iara";
  texto: string;
  audio?: string | null;
  imagem?: string | null;
}

export default function ChatIARA() {
  const location = useLocation();
  const navigate = useNavigate();
  const { intensidade, emocao } = location.state || {};

  const [mensagem, setMensagem] = useState("");
  const [chat, setChat] = useState<Message[]>([
    { tipo: "iara", texto: "Eu estou aqui com você... e você não precisa resolver tudo agora." }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [alerta, setAlerta] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isExercising, setIsExercising] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat, alerta, isGeneratingImage]);

  const playAudio = (base64Audio: string) => {
    if (isMuted) return;
    
    if (audioRef.current) {
      audioRef.current.pause();
    }
    
    const audio = new Audio(`data:audio/mp3;base64,${base64Audio}`);
    audioRef.current = audio;
    audio.play().catch(e => console.error("Error playing audio:", e));
  };

  const enviarMensagem = async () => {
    if (!mensagem.trim() || isLoading) return;

    const novaConversa: Message[] = [...chat, { tipo: "user", texto: mensagem }];
    setChat(novaConversa);
    const msgAtual = mensagem;
    setMensagem("");
    setIsLoading(true);

    const riscoAntes = analisarEmocao(msgAtual);

    if (riscoAntes === "alto") {
      setAlerta(true);
      // alert("Você não está sozinho. Vamos buscar ajuda agora."); // Optional alert
    }

    const historico: ChatMessage[] = chat.map(msg => ({
      role: msg.tipo === "user" ? "user" : "model",
      parts: [{ text: msg.texto }]
    }));

    let { resposta, risco } = await falarComIARA(msgAtual, historico, { emocao, intensidade });

    let tipoExercicio = null;
    if (msgAtual.toLowerCase().includes("ansioso") || msgAtual.toLowerCase().includes("ansiedade")) tipoExercicio = "ansiedade";
    if (msgAtual.toLowerCase().includes("crise") || msgAtual.toLowerCase().includes("pânico")) tipoExercicio = "crise";
    if (msgAtual.toLowerCase().includes("pensando demais") || msgAtual.toLowerCase().includes("pensamento")) tipoExercicio = "pensamento";

    const exercicio = gerarExercicio(tipoExercicio);

    if (riscoAntes === "moderado") {
      resposta += "\n\nTalvez conversar com alguém possa te ajudar...";
    } else if (riscoAntes === "alto") {
      resposta = "Eu estou aqui com você...\n\nIsso é importante demais para você enfrentar sozinho.\n\nVamos buscar ajuda agora, juntos.";
    } else if (tipoExercicio) {
      resposta += "\n\nVamos fazer isso juntos...";
    }

    if (resposta.toLowerCase().includes("respira")) {
      if (!isMuted) falarTexto("Inspira... devagar...");
    }

    // Salvar dados (simulado para integração futura com Google Sheets/Looker Studio)
    const salvarDados = async () => {
      try {
        const URL_DO_GOOGLE_SCRIPT = "https://script.google.com/macros/s/AKfycbx-SUA-URL-AQUI/exec";
        if (!URL_DO_GOOGLE_SCRIPT.includes("SUA-URL-AQUI")) {
          await fetch(URL_DO_GOOGLE_SCRIPT, {
            method: "POST",
            mode: "no-cors",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              data: new Date().toLocaleDateString('pt-BR'),
              usuario: "Anônimo",
              humor: intensidade || 5,
              risco: riscoAntes,
              atendimento: "nao",
              tipo: "IARA"
            })
          });
        }
      } catch (e) {
        console.error("Erro ao salvar dados:", e);
      }
    };
    salvarDados();

    if (!isMuted) {
      falarTexto(resposta);
    }

    setChat([...novaConversa, { tipo: "iara", texto: resposta }]);
    setIsLoading(false);

    if (exercicio.length > 0) {
      setIsExercising(true);
      let delay = 0;
      exercicio.forEach((frase) => {
        setTimeout(() => {
          if (!isMuted) falarTexto(frase);
          setChat(prev => [...prev, { tipo: "iara", texto: frase }]);
        }, delay);
        delay += 4000;
      });
      
      setTimeout(() => {
        setIsExercising(false);
      }, delay);
    }

    // Após resposta e exercício
    setTimeout(() => {
      const riscoDepois = analisarEmocao(resposta); // Usando a resposta como proxy do estado, conforme solicitado
      const decisao = decidirCaminho(riscoAntes, riscoDepois);

      if (decisao === "terapeuta" || decisao === "psicologo") {
        const terapeutas = encontrarTerapeutas(mensagem);
        const terapeutaPrincipal = terapeutas[0];
        const outrosContagem = terapeutas.length - 1;
        
        const msg = terapeutaPrincipal 
          ? `Encontrei alguns profissionais que podem te ajudar, como ${terapeutaPrincipal.nome}${outrosContagem > 0 ? ` e mais ${outrosContagem} especialistas` : ""}.` 
          : "Talvez seja importante conversar com alguém agora...";
        
        if (!isMuted) falarTexto(msg);
        setChat(prev => [...prev, { tipo: "iara", texto: msg }]);
        setTimeout(() => navigate(`/profissionais?tipo=${terapeutaPrincipal?.especialidade || decisao}`), 4000);
      } else if (decisao === "emergencia" || decisao === "psiquiatra") {
        navigate("/emergencia");
      }
    }, exercicio.length > 0 ? exercicio.length * 4000 + 2000 : 8000);
  };

  const handleGerarImagem = async () => {
    if (isLoading || isGeneratingImage) return;
    
    setIsGeneratingImage(true);
    
    // Get the last user message or use a default prompt
    const lastUserMessage = chat.slice().reverse().find(m => m.tipo === "user")?.texto || "Paz e tranquilidade";
    
    const imageData = await generateImage(lastUserMessage);
    
    if (imageData) {
      setChat(prev => [...prev, { 
        tipo: "iara", 
        texto: "Criei esta imagem para ajudar você a se acalmar e focar no momento presente...", 
        imagem: imageData 
      }]);
    }
    
    setIsGeneratingImage(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      enviarMensagem();
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (!isMuted && audioRef.current) {
      audioRef.current.pause();
    }
  };

  const handleMicClick = () => {
    if (isListening) return;
    setIsListening(true);
    ouvirUsuario(
      (texto) => setMensagem(texto),
      () => setIsListening(false)
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col h-screen bg-slate-950 text-slate-100"
    >
      <header className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-lg font-medium text-emerald-400">IARA</h2>
            <p className="text-xs text-slate-400">Sua voz interior</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => navigate("/diario")}
            className="flex items-center gap-2 px-3 py-1.5 bg-indigo-900/30 hover:bg-indigo-800/50 text-indigo-300 rounded-full text-sm font-medium transition-colors border border-indigo-500/20"
          >
            <Book className="w-4 h-4" />
            <span className="hidden sm:inline">Diário</span>
          </button>
          <button 
            onClick={toggleMute}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-300"
            title={isMuted ? "Ativar som" : "Desativar som"}
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
          <button 
            onClick={() => navigate("/profissionais")}
            className="flex items-center gap-2 px-3 py-1.5 bg-emerald-900/30 hover:bg-emerald-800/50 text-emerald-300 rounded-full text-sm font-medium transition-colors border border-emerald-500/20"
          >
            <HeartHandshake className="w-4 h-4" />
            <span className="hidden sm:inline">Falar com Terapeuta</span>
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {isExercising && (
          <div className="flex justify-center my-4">
            <div 
              className="w-20 h-20 rounded-full bg-emerald-500 mx-auto"
              style={{ animation: "pulse 4s infinite" }}
            />
          </div>
        )}
        {alerta && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-900/30 border border-red-500/30 p-4 rounded-2xl flex items-start gap-3 text-red-200"
          >
            <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-300 mb-1">Você não está sozinho.</p>
              <p className="text-sm text-red-200/80 mb-3">Por favor, procure ajuda imediata. Existem pessoas prontas para te ouvir agora mesmo.</p>
              <a href="tel:188" className="inline-block px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm font-medium transition-colors">
                Ligar 188 (CVV)
              </a>
            </div>
          </motion.div>
        )}

        {chat.map((msg, index) => (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            key={index}
            className={`flex ${msg.tipo === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] p-4 rounded-2xl ${
                msg.tipo === "user"
                  ? "bg-emerald-600/20 text-emerald-50 rounded-tr-sm border border-emerald-500/20"
                  : "bg-slate-800/50 text-slate-200 rounded-tl-sm border border-white/5"
              }`}
            >
              <p className="leading-relaxed whitespace-pre-wrap">{msg.texto}</p>
              {msg.imagem && (
                <img 
                  src={msg.imagem} 
                  alt="Imagem gerada pela IARA" 
                  className="mt-3 rounded-xl w-full object-cover shadow-md border border-white/10"
                  referrerPolicy="no-referrer"
                />
              )}
            </div>
          </motion.div>
        ))}
        {(isLoading || isGeneratingImage) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-slate-800/50 p-4 rounded-2xl rounded-tl-sm border border-white/5 flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="w-2 h-2 bg-emerald-500/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-2 h-2 bg-emerald-500/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-slate-900/80 backdrop-blur-md border-t border-white/10">
        <div className="max-w-4xl mx-auto relative flex items-end gap-2">
          <button
            onClick={handleMicClick}
            disabled={isLoading || isListening}
            className={`p-3 rounded-xl transition-colors flex items-center justify-center flex-shrink-0 ${
              isListening 
                ? "bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse" 
                : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200 border border-white/10"
            }`}
            title="Falar"
          >
            <Mic className="w-5 h-5" />
          </button>
          <button
            onClick={handleGerarImagem}
            disabled={isLoading || isGeneratingImage}
            className="p-3 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-800/50 disabled:text-slate-600 text-slate-300 rounded-xl transition-colors flex-shrink-0 border border-white/10"
            title="Gerar imagem calmante"
          >
            <ImageIcon className="w-5 h-5" />
          </button>
          <textarea
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="O que você está sentindo agora?"
            className="w-full bg-slate-800/50 border border-white/10 rounded-2xl py-3 px-4 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none min-h-[52px] max-h-32"
            rows={1}
          />
          <button 
            onClick={enviarMensagem}
            disabled={!mensagem.trim() || isLoading}
            className="p-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl transition-colors flex-shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
