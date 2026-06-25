import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { usePWA } from "../contexts/PWAContext";
import { NotificationService } from "../services/notificationService";
import { 
  HeartPulse, 
  MessageCircle, 
  BookOpen, 
  Calendar, 
  Search, 
  Star, 
  Video, 
  ArrowRight, 
  Bell, 
  User,
  Activity,
  ShieldCheck,
  Zap,
  Sparkles,
  RefreshCw,
  X,
  PlayCircle,
  Sun,
  Moon,
  MessageSquarePlus,
  Lightbulb,
  Smartphone,
  Check,
  Wind,
  Shield,
  Users,
  Brain,
  Crown,
  ChevronDown,
  CheckCircle2,
  Smile,
  Meh,
  Frown,
  TrendingUp,
  Eye
} from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend } from "recharts";
import { userService } from "../services/userService";
import { auth } from "../services/firebase";
import { UserProfile, Appointment, MoodEntry, NewsCardProps } from "../types";
import { cn } from "../lib/utils";
import { useTheme } from "../contexts/ThemeContext";
import { FeedbackModal } from "../components/FeedbackModal";
import { ReviewModal } from "../components/ReviewModal";
import { NewsCard } from "../components/NewsCard";
import StarRating from "../components/StarRating";
import Especialidades from "../components/Especialidades";
import { getPillOfDay, Pill, pillService } from "../services/pillService";
import { addXp, updateStreak, XP_ACTIONS, getLevelByXp, getNextLevel, LEVELS } from "../services/gamificationService";
import { Onboarding } from "../components/Onboarding";
import { AffirmationToast } from "../components/AffirmationToast";
import { generateTherapistAvatar } from "../services/imageService";
import DashboardAnalytics from "../components/Dashboard";
import CrisisResources from "../components/CrisisResources";
import { sentimentService } from "../services/sentimentService";
import { healthService } from "../services/healthService";
import { Dumbbell, Download, ToggleLeft, ToggleRight, FileText } from "lucide-react";

export default function DashboardPaciente() {
  const navigate = useNavigate();
  const { handleInstall, isInstallable, notificationPermission, requestNotificationPermission } = usePWA();
  const { theme, toggleTheme, sensoryMode, toggleSensoryMode } = useTheme();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [nextAppointment, setNextAppointment] = useState<Appointment | null>(null);
  const [appointmentToReview, setAppointmentToReview] = useState<Appointment | null>(null);
  const [appointmentToRemind, setAppointmentToRemind] = useState<Appointment | null>(null);
  const [recentMood, setRecentMood] = useState<MoodEntry | null>(null);
  const [featuredTherapists, setFeaturedTherapists] = useState<UserProfile[]>([]);
  const [news, setNews] = useState<NewsCardProps[]>([]);
  const [visibleNewsCount, setVisibleNewsCount] = useState(3);
  const [loading, setLoading] = useState(true);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [showDeniedModal, setShowDeniedModal] = useState(false);
  const [dailyPill, setDailyPill] = useState<Pill | null>(null);
  const [pillRead, setPillRead] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);

  // Daily Mood Tracker states
  const [selectedMoodValue, setSelectedMoodValue] = useState<number | null>(null);
  const [selectedEmoji, setSelectedEmoji] = useState<string>("");
  const [moodIntensity, setMoodIntensity] = useState<number>(5);
  const [moodNote, setMoodNote] = useState<string>("");
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
  const [moodSaving, setMoodSaving] = useState<boolean>(false);
  const [moodSavedFeedback, setMoodSavedFeedback] = useState<boolean>(false);

  // Emotional history for Recharts
  const [moodHistory, setMoodHistory] = useState<any[]>([]);
  const [chartPeriod, setChartPeriod] = useState<'7' | '30' | 'all'>('7');
  const [activeAnalyticsTab, setActiveAnalyticsTab] = useState<'humor' | 'completo' | 'sentimento' | 'crise'>('humor');
  const [diaryEntries, setDiaryEntries] = useState<any[]>([]);
  const [selectedDiaryEntryForAI, setSelectedDiaryEntryForAI] = useState<any | null>(null);
  const [aiSentimentReport, setAiSentimentReport] = useState<any | null>(null);
  const [loadingAISentiment, setLoadingAISentiment] = useState<boolean>(false);

  // Health sync states
  const [isGoogleFitLinked, setIsGoogleFitLinked] = useState<boolean>(
    localStorage.getItem("health_linked_googlefit") === "true"
  );
  const [isHealthKitLinked, setIsHealthKitLinked] = useState<boolean>(
    localStorage.getItem("health_linked_healthkit") === "true"
  );
  const [healthData, setHealthData] = useState<any[]>([]);
  const [syncingHealth, setSyncingHealth] = useState<boolean>(false);
  
  // Custom sleep/steps input state for today
  const [sleepInput, setSleepInput] = useState<number>(7.5);
  const [stepsInput, setStepsInput] = useState<number>(6000);
  const [showManualHealthInput, setShowManualHealthInput] = useState<boolean>(false);

  // Scheduled Notification State
  const [notificationScheduled, setNotificationScheduled] = useState<boolean>(
    localStorage.getItem("reminder_active") === "true"
  );
  const [notificationTime, setNotificationTime] = useState<string>(
    localStorage.getItem("reminder_time") || "20:00"
  );
  const [savingNotification, setSavingNotification] = useState<boolean>(false);
  const [showNotificationSavedToast, setShowNotificationSavedToast] = useState<boolean>(false);

  const loadMoreNews = () => {
    setVisibleNewsCount(prev => prev + 3);
  };

  useEffect(() => {
    const isNewUser = localStorage.getItem("isNewUser");
    if (!isNewUser) {
      setShowWelcome(true);
      localStorage.setItem("isNewUser", "false");
    }
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleNewsCount < news.length) {
          loadMoreNews();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [news.length, visibleNewsCount]);

  useEffect(() => {
    let unsubAppointments: (() => void) | undefined;
    let unsubMood: (() => void) | undefined;
    let unsubDiary: (() => void) | undefined;

    const loadData = async () => {
      const simUserStr = localStorage.getItem("simulatedUser");
      const simUser = simUserStr ? JSON.parse(simUserStr) : null;
      const user = auth.currentUser || simUser;
      
      try {
        let profile = user ? await userService.getUser(user.uid) : null;
        if (!profile && simUser) {
          const simProfileStr = localStorage.getItem("simulatedProfile");
          if (simProfileStr) {
            try {
              profile = JSON.parse(simProfileStr);
            } catch (e) {
              console.error(e);
            }
          }
        }
        setUserProfile(profile);

        // Get featured therapists
        const therapists = await userService.getFeaturedTherapists(3);
        
        // Check for Ana Silva in the fetched list
        const anaSilva = therapists.find(t => t.nome === "Dra. Ana Silva");
        
        if (!anaSilva) {
          // If not found, we'll add her, but first check if we already have an avatar for her
          const avatar = await generateTherapistAvatar();
          const newAnaSilva: UserProfile = {
            uid: "ana_silva_generated",
            nome: "Dra. Ana Silva",
            email: "ana.silva@senti.app",
            tipo: "terapeuta",
            fotoUrl: avatar || "https://images.unsplash.com/photo-1559839734-2b71f1536780?w=400&auto=format&fit=crop&q=60",
            especialidades: ["Ansiedade", "Depressão", "TCC"],
            rating: 5.0,
            reviewCount: 1,
            online: true,
            biografia: "Especialista em Terapia Cognitivo-Comportamental, focada em ajudar pacientes com ansiedade e depressão a encontrarem paz e equilíbrio.",
            estilo: "acolhedor",
            abordagem: "TCC",
            intensidade: 40,
            createdAt: new Date().toISOString()
          };
          setFeaturedTherapists([newAnaSilva, ...therapists.slice(0, 2)]);
        } else {
          // If she exists but has a dicebear avatar, update it
          if (anaSilva.fotoUrl && anaSilva.fotoUrl.includes('dicebear')) {
            const avatar = await generateTherapistAvatar();
            if (avatar) {
              await userService.updateProfile(anaSilva.uid, { fotoUrl: avatar });
              anaSilva.fotoUrl = avatar;
            }
          }
          setFeaturedTherapists(therapists);
        }

        // Mock news data
        const mockNews: NewsCardProps[] = [
          {
            id: "1",
            title: "Como a meditação ajuda na ansiedade",
            description: "Estudos mostram que 10 minutos de meditação diária podem reduzir significativamente os níveis de cortisol.",
            image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop&q=60",
            category: "Bem-estar",
            readTime: "5 min",
            url: "https://exemplo.com/meditacao",
            therapistName: "Dr. Ricardo Santos",
            therapistId: "therapist_1",
            isOnline: true
          },
          {
            id: "2",
            title: "A importância do sono para a saúde mental",
            description: "Dormir bem é fundamental para a regulação emocional e a consolidação da memória.",
            image: "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=800&auto=format&fit=crop&q=60",
            category: "Saúde",
            readTime: "4 min",
            url: "https://exemplo.com/sono",
            therapistName: "Dra. Ana Oliveira",
            therapistId: "therapist_2",
            isOnline: false
          },
          {
            id: "3",
            title: "Exercícios físicos e depressão",
            description: "A prática regular de atividades físicas libera endorfinas que combatem sintomas depressivos.",
            image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&auto=format&fit=crop&q=60",
            category: "Fitness",
            readTime: "6 min",
            url: "https://exemplo.com/exercicios"
          },
          {
            id: "4",
            title: "Alimentação e humor",
            description: "O que você come pode influenciar diretamente como você se sente. Conheça os alimentos amigos do cérebro.",
            image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&auto=format&fit=crop&q=60",
            category: "Nutrição",
            readTime: "7 min",
            url: "https://exemplo.com/alimentacao"
          },
          {
            id: "5",
            title: "Mindfulness no trabalho",
            description: "Dicas práticas para manter o foco e a calma durante a jornada de trabalho.",
            image: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&auto=format&fit=crop&q=60",
            category: "Produtividade",
            readTime: "5 min",
            url: "https://exemplo.com/mindfulness-trabalho"
          },
          {
            id: "6",
            title: "A arte da resiliência",
            description: "Como desenvolver a capacidade de se recuperar de desafios e traumas.",
            image: "https://images.unsplash.com/photo-1528716321680-815a8cdb8cbe?w=800&auto=format&fit=crop&q=60",
            category: "Psicologia",
            readTime: "8 min",
            url: "https://exemplo.com/resiliencia"
          }
        ];
        setNews(mockNews);

        // Get daily pill
        setDailyPill(getPillOfDay());

        // Gamification: Update streak and add XP for opening app
        if (user && user.uid) {
          await updateStreak(user.uid);
          await addXp(user.uid, XP_ACTIONS.OPEN_APP);
          
          // Refresh profile after updating gamification to show updated score immediately
          let updatedProfile = await userService.getUser(user.uid);
          if (!updatedProfile && simUser) {
            const simProfileStr = localStorage.getItem("simulatedProfile");
            if (simProfileStr) {
              try {
                updatedProfile = JSON.parse(simProfileStr);
              } catch (e) {
                console.error(e);
              }
            }
          }
          if (updatedProfile) {
            setUserProfile(updatedProfile);
          }
        }

        // Get next appointment
        unsubAppointments = userService.getMyAppointments((apps) => {
          const upcoming = apps.find(a => a.status === 'pending' || a.status === 'confirmed');
          setNextAppointment(upcoming || null);

          // Check for reminders (within 24h)
          const now = new Date();
          const soon = new Date(now.getTime() + 24 * 60 * 60 * 1000);
          const toRemind = apps.find(a => 
            (a.status === 'pending' || a.status === 'confirmed') && 
            !a.reminded && 
            new Date(a.date) > now && 
            new Date(a.date) <= soon
          );
          if (toRemind) setAppointmentToRemind(toRemind);

          // Check for reviews (completed and not reviewed)
          const toReview = apps.find(a => a.status === 'completed' && !a.reviewed);
          if (toReview) setAppointmentToReview(toReview);
        }, 'usuario');

        // Get recent mood
        unsubMood = userService.getMoodHistory((history) => {
          setMoodHistory(history);
          if (history.length > 0) {
            setRecentMood(history[0]);
          }
        });

        // Get diary entries
        unsubDiary = userService.getDiaryEntries((entries) => {
          setDiaryEntries(entries);
        });

      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    return () => {
      if (unsubAppointments) unsubAppointments();
      if (unsubMood) unsubMood();
      if (unsubDiary) unsubDiary();
    };
  }, [navigate]);

  // Load health data if linked
  useEffect(() => {
    const provider = isGoogleFitLinked ? "googlefit" : isHealthKitLinked ? "healthkit" : null;
    if (provider) {
      const data = healthService.getSyncedData(provider);
      setHealthData(data);
    } else {
      setHealthData([]);
    }
  }, [isGoogleFitLinked, isHealthKitLinked]);

  // Background check for scheduled notifications
  useEffect(() => {
    if (!notificationScheduled) return;

    const checkNotification = () => {
      const now = new Date();
      const [hours, minutes] = notificationTime.split(":").map(Number);
      
      // If matches time
      if (now.getHours() === hours && now.getMinutes() === minutes) {
        // Check if already notified today to prevent double-firing
        const lastNotified = localStorage.getItem("last_notified_date");
        const todayStr = now.toDateString();
        
        if (lastNotified !== todayStr) {
          localStorage.setItem("last_notified_date", todayStr);
          
          // Trigger Notification
          if (Notification.permission === "granted") {
            new Notification("Sentí - Diário de Bordo", {
              body: "Hora do seu registro emocional! Como foi seu dia hoje? Dedique 2 minutos para registrar no diário.",
              icon: "/icon.png"
            });
          } else {
            console.log("Notificação programada agendada para agora, mas permissão não foi concedida.");
          }
        }
      }
    };

    // Check immediately and then every 30 seconds
    checkNotification();
    const interval = setInterval(checkNotification, 30000);
    return () => clearInterval(interval);
  }, [notificationScheduled, notificationTime]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  const handleAIAnalysis = async (entry: any) => {
    setSelectedDiaryEntryForAI(entry);
    setLoadingAISentiment(true);
    setAiSentimentReport(null);
    try {
      const report = await sentimentService.analyzeWithAI(entry.content);
      setAiSentimentReport(report);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAISentiment(false);
    }
  };

  const handleCloseAIAnalysis = () => {
    setSelectedDiaryEntryForAI(null);
    setAiSentimentReport(null);
  };

  const handleToggleGoogleFit = () => {
    setSyncingHealth(true);
    setTimeout(() => {
      if (isGoogleFitLinked) {
        healthService.unlinkProvider("googlefit");
        setIsGoogleFitLinked(false);
      } else {
        healthService.linkProvider("googlefit");
        setIsGoogleFitLinked(true);
        // Unlink other to keep only one active
        healthService.unlinkProvider("healthkit");
        setIsHealthKitLinked(false);
      }
      setSyncingHealth(false);
    }, 1200);
  };

  const handleToggleHealthKit = () => {
    setSyncingHealth(true);
    setTimeout(() => {
      if (isHealthKitLinked) {
        healthService.unlinkProvider("healthkit");
        setIsHealthKitLinked(false);
      } else {
        healthService.linkProvider("healthkit");
        setIsHealthKitLinked(true);
        // Unlink other
        healthService.unlinkProvider("googlefit");
        setIsGoogleFitLinked(false);
      }
      setSyncingHealth(false);
    }, 1200);
  };

  const handleSaveManualHealth = () => {
    const provider = isGoogleFitLinked ? "googlefit" : isHealthKitLinked ? "healthkit" : null;
    if (!provider) return;
    
    const todayStr = new Date().toISOString().split("T")[0];
    healthService.updateDayData(provider, todayStr, sleepInput, stepsInput);
    
    // Refresh state
    const data = healthService.getSyncedData(provider);
    setHealthData(data);
    setShowManualHealthInput(false);
  };

  const handleSaveNotificationSetting = async () => {
    setSavingNotification(true);
    try {
      if (notificationScheduled) {
        const permission = await NotificationService.requestPermission();
        if (permission === "granted") {
          localStorage.setItem("reminder_active", "true");
          localStorage.setItem("reminder_time", notificationTime);
        } else {
          localStorage.setItem("reminder_active", "false");
          setNotificationScheduled(false);
          alert("Por favor, habilite as notificações no seu navegador para receber os lembretes do diário.");
        }
      } else {
        localStorage.setItem("reminder_active", "false");
      }
      
      setShowNotificationSavedToast(true);
      setTimeout(() => setShowNotificationSavedToast(false), 4000);
    } catch (e) {
      console.error(e);
    } finally {
      setSavingNotification(false);
    }
  };

  const handleExportSentimentPDF = async (period: 'weekly' | 'monthly') => {
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF();

      // Filter entries based on period
      const daysLimit = period === 'weekly' ? 7 : 30;
      const now = new Date();
      const cutoffDate = new Date(now.getTime() - daysLimit * 24 * 60 * 60 * 1000);

      const filteredDiaries = diaryEntries.filter(entry => {
        if (!entry.timestamp) return false;
        return new Date(entry.timestamp) >= cutoffDate;
      });

      const weeklyTrendData = sentimentService.getWeeklySentimentTrend(filteredDiaries);
      const validScores = weeklyTrendData.filter(d => d.score !== null).map(d => d.score as number);
      const avgSentiment = validScores.length > 0 
        ? (validScores.reduce((a, b) => a + b, 0) / validScores.length).toFixed(1)
        : "N/A";

      const correlation = healthService.analyzeCorrelation(filteredDiaries, healthData);

      // Styles
      const emeraldColor = [16, 185, 129];
      const slateColor = [30, 41, 59];
      const grayColor = [100, 116, 139];

      // Header
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(emeraldColor[0], emeraldColor[1], emeraldColor[2]);
      doc.text("Sentí", 20, 20);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
      doc.text(`Relatório de Evolução Emocional & Saúde (${period === 'weekly' ? 'Semanal' : 'Mensal'})`, 20, 26);
      doc.text(`Gerado em: ${now.toLocaleDateString('pt-BR')} às ${now.toLocaleTimeString('pt-BR')}`, 130, 20);

      // Divider
      doc.setDrawColor(226, 232, 240);
      doc.line(20, 32, 190, 32);

      // Patient metadata
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(slateColor[0], slateColor[1], slateColor[2]);
      doc.text(`Paciente: ${userProfile?.nome || "Paciente"}`, 20, 40);
      doc.text(`Período de Análise: Últimos ${daysLimit} dias`, 20, 46);

      // Section 1: Dashboard Stats
      doc.setFillColor(248, 250, 252); // soft grey card bg
      doc.rect(20, 52, 170, 32, "F");

      doc.setFontSize(9);
      doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
      doc.text("ÍNDICE EMOCIONAL MÉDIO", 25, 60);
      doc.text("REGISTROS TEXTUAIS", 85, 60);
      doc.text("CONEXÃO SAÚDE", 140, 60);

      doc.setFontSize(16);
      doc.setTextColor(emeraldColor[0], emeraldColor[1], emeraldColor[2]);
      doc.text(`${avgSentiment} / 10`, 25, 70);

      doc.setTextColor(slateColor[0], slateColor[1], slateColor[2]);
      doc.text(`${filteredDiaries.length} escritos`, 85, 70);

      const healthConnected = isGoogleFitLinked ? "Google Fit" : isHealthKitLinked ? "HealthKit" : "Nenhum";
      doc.setFontSize(12);
      doc.text(healthConnected, 140, 70);

      // Section 2: Health correlations
      let y = 94;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(slateColor[0], slateColor[1], slateColor[2]);
      doc.text("Cruzamento de Dados de Saúde & Bem-Estar", 20, y);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(slateColor[0], slateColor[1], slateColor[2]);
      
      y += 8;
      const splitSleepCorr = doc.splitTextToSize(`• Sono vs Humor: ${correlation.sleepCorrelation}`, 170);
      doc.text(splitSleepCorr, 20, y);
      y += splitSleepCorr.length * 5;

      const splitActCorr = doc.splitTextToSize(`• Exercício vs Humor: ${correlation.activityCorrelation}`, 170);
      doc.text(splitActCorr, 20, y);
      y += splitActCorr.length * 5 + 4;

      // Divider
      doc.setDrawColor(241, 245, 249);
      doc.line(20, y, 190, y);
      y += 8;

      // Section 3: Diary details
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text("Detalhamento Diário", 20, y);
      y += 8;

      if (filteredDiaries.length === 0) {
        doc.setFont("helvetica", "italic");
        doc.setFontSize(10);
        doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
        doc.text("Nenhuma reflexão salva no diário de bordo neste período.", 20, y);
      } else {
        filteredDiaries.forEach((entry, idx) => {
          if (y > 250) {
            doc.addPage();
            y = 20;
          }

          const entryDate = entry.timestamp ? new Date(entry.timestamp).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : "Data N/A";
          const sentiment = sentimentService.analyzeDiarySentiment(entry.content, entry.moodValue);

          doc.setFont("helvetica", "bold");
          doc.setFontSize(10);
          doc.setTextColor(slateColor[0], slateColor[1], slateColor[2]);
          doc.text(`${entryDate} - ${entry.title || "Sem Título"}`, 20, y);

          doc.setFont("helvetica", "italic");
          doc.setTextColor(emeraldColor[0], emeraldColor[1], emeraldColor[2]);
          doc.text(`Tom: ${sentiment.emoji} ${sentiment.label} (${sentiment.dominantEmotion})`, 130, y);

          doc.setFont("helvetica", "normal");
          doc.setTextColor(slateColor[0], slateColor[1], slateColor[2]);
          y += 5;
          const splitContent = doc.splitTextToSize(`"${entry.content}"`, 170);
          doc.text(splitContent, 20, y);
          y += splitContent.length * 5 + 6;

          // Draw item line
          doc.setDrawColor(241, 245, 249);
          doc.line(20, y - 3, 190, y - 3);
        });
      }

      // Footer
      if (y > 265) {
        doc.addPage();
        y = 20;
      }
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
      doc.text("Este documento destina-se apenas para fins informativos e de acompanhamento terapêutico. Sentí App 2026.", 20, 285);

      doc.save(`Senti_Relatorio_Saude_Mental_${period}.pdf`);
    } catch (e) {
      console.error(e);
    }
  };

  const getActiveUser = () => {
    const simUserStr = localStorage.getItem("simulatedUser");
    const simUser = simUserStr ? JSON.parse(simUserStr) : null;
    return auth.currentUser || simUser;
  };

  const handleReadPill = async () => {
    const activeUser = getActiveUser();
    if (!pillRead && activeUser) {
      await addXp(activeUser.uid, XP_ACTIONS.READ_PILL);
      setPillRead(true);
      
      // Update profile view for immediate gamification feedback if simulated
      if (activeUser.uid === 'guest_demo_user') {
        const simProfileStr = localStorage.getItem("simulatedProfile");
        if (simProfileStr) {
          try {
            setUserProfile(JSON.parse(simProfileStr));
          } catch (e) {
            console.error(e);
          }
        }
      }
    }
  };

  const handleSetFavoritePill = async () => {
    const activeUser = getActiveUser();
    if (dailyPill && activeUser) {
      const success = await pillService.setFavoritePill(dailyPill);
      if (success) {
        let profile = await userService.getUser(activeUser.uid);
        if (!profile && activeUser.uid === 'guest_demo_user') {
          const simProfileStr = localStorage.getItem("simulatedProfile");
          if (simProfileStr) {
            try {
              profile = JSON.parse(simProfileStr);
            } catch (e) {
              console.error(e);
            }
          }
        }
        setUserProfile(profile);
      }
    }
  };

  const currentLevel = userProfile?.xp ? getLevelByXp(userProfile.xp) : LEVELS[0];
  const nextLevel = userProfile?.xp ? getNextLevel(userProfile.xp) : LEVELS[1];
  const progress = (userProfile?.xp && nextLevel) 
    ? ((userProfile.xp - currentLevel.minXp) / (nextLevel.minXp - currentLevel.minXp)) * 100 
    : 100;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center transition-colors">
        <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  const dicasDoDia = [
    "Respire fundo: Inspire por 4s, segure por 2s, expire por 6s.",
    "Acolha suas emoções: Não lute contra o que sente, apenas observe.",
    "Pausa consciente: Tire 5 minutos hoje apenas para não fazer nada.",
    "Hidratação: Beber água também ajuda a regular o sistema nervoso."
  ];
  const dicaHoje = dicasDoDia[new Date().getDate() % dicasDoDia.length];

  const quickActions = [
    { id: 'chat', label: 'IARA', icon: MessageCircle, path: '/chat', color: 'bg-emerald-500' },
    { id: 'diario', label: 'Diário', icon: BookOpen, path: '/diario', color: 'bg-indigo-500' },
    { id: 'respiracao', label: 'Respirar', icon: Wind, path: '/respiracao', color: 'bg-sky-500' },
    { id: 'sos', label: 'SOS', icon: Shield, path: '/emergencia', color: 'bg-rose-500' },
    { id: 'profissionais', label: 'Terapeutas', icon: Users, path: '/profissionais', color: 'bg-violet-500' },
    { id: 'reset', label: 'ReSet', icon: RefreshCw, path: '/reset', color: 'bg-amber-500' },
    { id: 'live', label: 'Live', icon: Video, path: '/live-iara', color: 'bg-emerald-600' },
    { id: 'triagem', label: 'Triagem', icon: Activity, path: '/triagem', color: 'bg-slate-500' },
    { id: 'perfil', label: 'Perfil', icon: User, path: '/perfil', color: 'bg-blue-500' },
  ];

  const moods = [
    { emoji: "😊", label: "Bem", value: 8 },
    { emoji: "😐", label: "Ok", value: 5 },
    { emoji: "😔", label: "Triste", value: 3 },
    { emoji: "😠", label: "Irritado", value: 2 },
    { emoji: "😴", label: "Cansado", value: 4 },
    { emoji: "🤩", label: "Radiante", value: 10 },
    { emoji: "😰", label: "Ansioso", value: 2 },
  ];

  const handleQuickMood = async (value: number) => {
    const activeUser = getActiveUser();
    if (activeUser) {
      await userService.saveMood(value, 5, "Registro rápido via dashboard");
      // Refresh mood history
      const history = await new Promise<MoodEntry[]>((resolve) => {
        const unsub = userService.getMoodHistory((h) => {
          unsub();
          resolve(h);
        });
      });
      if (history.length > 0) setRecentMood(history[0]);
      await addXp(activeUser.uid, XP_ACTIONS.LOG_MOOD);

      // Update local profile view if simulated
      if (activeUser.uid === 'guest_demo_user') {
        const simProfileStr = localStorage.getItem("simulatedProfile");
        if (simProfileStr) {
          try {
            setUserProfile(JSON.parse(simProfileStr));
          } catch (e) {
            console.error(e);
          }
        }
      }
    }
  };

  const handleDetailedMoodSubmit = async () => {
    if (selectedMoodValue === null) return;
    
    setMoodSaving(true);
    try {
      const activeUser = getActiveUser();
      if (activeUser) {
        const finalNote = moodNote.trim() || `Sinto-me ${selectedEmoji} com intensidade ${moodIntensity}/10`;
        await userService.saveMood(selectedMoodValue, moodIntensity, finalNote, selectedTriggers);
        
        // Refresh gamification points
        await addXp(activeUser.uid, XP_ACTIONS.LOG_MOOD);
        
        // Update local profile view if simulated
        if (activeUser.uid === 'guest_demo_user') {
          const simProfileStr = localStorage.getItem("simulatedProfile");
          if (simProfileStr) {
            try {
              setUserProfile(JSON.parse(simProfileStr));
            } catch (e) {
              console.error(e);
            }
          }
        }
        
        // Reset and show feedback
        setMoodSavedFeedback(true);
        setSelectedMoodValue(null);
        setSelectedEmoji("");
        setMoodNote("");
        setMoodIntensity(5);
        setSelectedTriggers([]);
        
        setTimeout(() => {
          setMoodSavedFeedback(false);
        }, 4000);
      }
    } catch (e) {
      console.error("Erro ao registrar humor detalhado:", e);
    } finally {
      setMoodSaving(false);
    }
  };

  const getChartData = () => {
    const sorted = [...moodHistory].reverse();
    const now = new Date();
    const filtered = sorted.filter(entry => {
      if (!entry.timestamp) return false;
      const entryDate = new Date(entry.timestamp);
      if (chartPeriod === '7') {
        const diffTime = Math.abs(now.getTime() - entryDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 7;
      }
      if (chartPeriod === '30') {
        const diffTime = Math.abs(now.getTime() - entryDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 30;
      }
      return true;
    });

    return filtered.map(entry => {
      const d = new Date(entry.timestamp);
      return {
        data: d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        dataCompleta: d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
        humor: entry.value,
        intensidade: entry.intensity || 5,
        note: entry.note || 'Sem notes'
      };
    });
  };

  const getTriggersChartData = () => {
    const counts: { [key: string]: number } = {};
    const labelMap: { [key: string]: string } = {
      trabalho: "Trabalho (💼)",
      familia: "Família (🏠)",
      saude: "Saúde (❤️)",
      financas: "Finanças (💵)",
      relacionamento: "Relacionamento (💑)",
      amigos: "Amigos (👥)",
      sono: "Sono (🌙)",
      estudos: "Estudos (📚)"
    };

    moodHistory.forEach(entry => {
      if (entry.triggers && Array.isArray(entry.triggers)) {
        entry.triggers.forEach((trigger: string) => {
          const mappedName = labelMap[trigger] || trigger;
          counts[mappedName] = (counts[mappedName] || 0) + 1;
        });
      }
    });

    const COLORS = ['#6366f1', '#10b981', '#ef4444', '#f59e0b', '#ec4899', '#3b82f6', '#8b5cf6', '#14b8a6'];

    return Object.entries(counts).map(([name, value], index) => ({
      name,
      value,
      color: COLORS[index % COLORS.length]
    })).sort((a, b) => b.value - a.value);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-32 transition-colors">
      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
      <Onboarding />
      <AffirmationToast />

      <AnimatePresence>
        {showWelcome && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[3rem] p-10 shadow-2xl border border-slate-200 dark:border-white/5 text-center space-y-8"
            >
              <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-500/20 rounded-[2rem] flex items-center justify-center mx-auto shadow-inner">
                <Sparkles className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
              </div>
              
              <div className="space-y-4">
                <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100 leading-tight">
                  Bem-vindo ao seu pronto atendimento emocional
                </h2>
                <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
                  Estamos muito felizes em ter você aqui. O <span className="font-bold text-emerald-600 dark:text-emerald-400">Sentí</span> é o seu espaço seguro para cuidar da mente e do coração.
                </p>
              </div>

              <div className="space-y-3">
                <button 
                  onClick={() => {
                    setShowWelcome(false);
                    navigate("/chat");
                  }}
                  className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-lg transition-all shadow-xl shadow-emerald-600/20 flex items-center justify-center gap-3 active:scale-95"
                >
                  Falar com a IARA
                  <MessageCircle className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setShowWelcome(false)}
                  className="w-full py-5 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 rounded-2xl font-bold text-base hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
                >
                  Explorar o App
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {appointmentToReview && (
        <ReviewModal 
          isOpen={!!appointmentToReview} 
          onClose={() => setAppointmentToReview(null)} 
          appointmentId={appointmentToReview.id}
          therapistId={appointmentToReview.therapistId}
          therapistName={appointmentToReview.therapistNome}
        />
      )}

      {/* Header */}
      <header id="onboarding-welcome" className="px-4 py-4 sm:px-6 sm:py-6 flex justify-between items-center sticky top-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md z-20 border-b border-slate-200 dark:border-white/5">
        <div className="flex items-center gap-2 sm:gap-3 cursor-pointer select-none active:scale-95 transition-transform" onClick={() => navigate("/")}>
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center border border-emerald-200 dark:border-emerald-500/20">
            <HeartPulse className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-medium text-slate-800 dark:text-slate-200 truncate">
              {getGreeting()}, <span className="text-emerald-600 dark:text-emerald-400">{userProfile?.nome?.split(' ')[0] || "Paciente"}</span>
            </h1>
            <p className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase tracking-widest">Sentí • Pronto Atendimento</p>
          </div>
        </div>
        <div className="flex gap-1.5 sm:gap-2">
          <button 
            onClick={() => navigate("/assinatura")}
            aria-label="Assinatura"
            className={cn(
              "p-2.5 rounded-full border transition-all min-w-[44px] min-h-[44px] flex items-center justify-center relative group",
              userProfile?.isPremium 
                ? "bg-amber-500/10 border-amber-500/20 text-amber-500" 
                : "bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400 hover:bg-amber-500/10 hover:border-amber-500/20 hover:text-amber-500"
            )}
          >
            <Crown className={cn("w-4 h-4", userProfile?.isPremium && "fill-current")} />
            {!userProfile?.isPremium && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
            )}
          </button>
          <button 
            onClick={toggleSensoryMode}
            aria-label="Alternar Modo Noturno/Leitura"
            title="Modo Noturno/Leitura (Filtro Antissobrecarga)"
            className={cn(
              "p-2.5 rounded-full border transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer",
              sensoryMode 
                ? "bg-amber-500/20 border-amber-500/40 text-amber-600 dark:text-amber-400" 
                : "bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-white/5 text-slate-650 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
            )}
          >
            <Eye className="w-4 h-4" />
          </button>
          <button 
            onClick={toggleTheme}
            aria-label="Alternar tema"
            className="p-2.5 bg-slate-100 dark:bg-slate-900 rounded-full border border-slate-200 dark:border-white/5 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>
          <button 
            onClick={() => setIsFeedbackOpen(true)}
            aria-label="Enviar feedback"
            className="p-2.5 bg-slate-100 dark:bg-slate-900 rounded-full border border-slate-200 dark:border-white/5 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <MessageSquarePlus className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          </button>
          <button 
            onClick={() => navigate("/perfil")}
            aria-label="Ver perfil"
            className="p-2.5 bg-slate-100 dark:bg-slate-900 rounded-full border border-slate-200 dark:border-white/5 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <User className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          </button>
        </div>
      </header>

      <main className="p-4 sm:p-6 max-w-2xl mx-auto space-y-6 sm:space-y-8">
        {/* Banner de Gerenciamento de Permissão de Notificações */}
        {NotificationService.isPendingOrDenied() && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "rounded-[2rem] p-6 border shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-5 transition-all",
              notificationPermission === "denied"
                ? "bg-rose-500/5 border-rose-500/25 dark:bg-rose-950/10 dark:border-rose-500/10 text-rose-700 dark:text-rose-450"
                : "bg-emerald-500/5 border-emerald-500/25 dark:bg-emerald-950/10 dark:border-emerald-500/10 text-emerald-700 dark:text-emerald-450"
            )}
            id="notification-permission-manager"
          >
            <div className="space-y-1.5 max-w-md">
              <div className="flex items-center gap-2">
                <Bell className={cn("w-5 h-5 shrink-0", notificationPermission === "default" && "animate-bounce text-emerald-500")} />
                <h4 className="text-[10px] sm:text-xs font-bold uppercase tracking-widest">
                  {notificationPermission === "denied" ? "Notificações Bloqueadas" : "Lembretes e Suporte Diário"}
                </h4>
              </div>
              <h3 className="text-base font-bold font-serif italic text-slate-800 dark:text-slate-100">
                {notificationPermission === "denied" 
                  ? "Ative as notificações no navegador" 
                  : "Receba pílulas de sabedoria e apoio diário"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {notificationPermission === "denied"
                  ? "As notificações foram bloqueadas no navegador. Clique no botão ao lado para desbloquear rapidamente e receber orientações do Sentí."
                  : "Mantenha-se engajado em sua jornada de bem-estar. Ative os alertas para receber avisos gentis de respiração consciente, novas pílulas diárias e mensagens de evolução pessoal."}
              </p>
            </div>
            
            <button
              onClick={async () => {
                if (notificationPermission === "denied") {
                  setShowDeniedModal(true);
                } else {
                  await requestNotificationPermission();
                }
              }}
              className={cn(
                "px-5 py-3.5 active:scale-95 text-white rounded-2xl font-bold text-xs uppercase tracking-widest transition-all self-start sm:self-center whitespace-nowrap shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-2 min-h-[44px]",
                notificationPermission === "denied"
                  ? "bg-rose-600 hover:bg-rose-500 hover:shadow-rose-500/10"
                  : "bg-emerald-600 hover:bg-emerald-500 hover:shadow-emerald-500/10"
              )}
            >
              <Bell className="w-4 h-4 shrink-0" />
              Ativar notificações
            </button>
          </motion.div>
        )}

        {/* Dica do Dia Card */}
        {(() => {
          const tip = (() => {
            const defaultTip = {
              title: "Ancoragem no Presente (5-4-3-2-1)",
              category: "Mindfulness",
              text: "Olhe ao redor e identifique: 5 coisas que pode ver, 4 que pode tocar, 3 que pode ouvir, 2 que pode cheirar e 1 que pode provar. É excelente para acalmar mentes agitadas.",
              icon: Lightbulb
            };

            if (!moodHistory || moodHistory.length === 0) {
              return defaultTip;
            }

            const validEntries = moodHistory.slice(0, 5);
            const avgMood = validEntries.reduce((sum, item) => sum + item.value, 0) / validEntries.length;
            
            let hasAnxietyTrigger = false;
            let hasSleepTrigger = false;
            let hasWorkTrigger = false;

            validEntries.forEach(entry => {
              if (entry.triggers && Array.isArray(entry.triggers)) {
                if (entry.triggers.includes("sono")) hasSleepTrigger = true;
                if (entry.triggers.includes("trabalho")) hasWorkTrigger = true;
                if (entry.triggers.includes("ansiedade")) hasAnxietyTrigger = true;
              }
            });

            if (avgMood < 5) {
              return {
                title: "Ativação Comportamental de 5 Minutos",
                category: "Cognitivo-Comportamental",
                text: "Quando o desânimo bater, mova-se. Faça uma pequena arrumação em uma gaveta ou dê uma volta rápida pelo cômodo. Quebrar a inércia física ajuda a reconfigurar o ânimo.",
                icon: Activity
              };
            } else if (hasAnxietyTrigger || hasWorkTrigger) {
              return {
                title: "Técnica de Respiração Quadrada (4-4-4-4)",
                category: "Regulação do Estresse",
                text: "Inspire pelo nariz por 4 segundos, segure o ar por 4 segundos, expire suavemente pela boca por 4 segundos e permaneça com os pulmões vazios por mais 4 segundos. Repita 3 vezes para acalmar o sistema nervoso.",
                icon: Wind
              };
            } else if (hasSleepTrigger) {
              return {
                title: "Higiene do Sono: Desconexão Gradual",
                category: "Qualidade de Vida",
                text: "Desligue as telas (celular e TV) pelo menos 30 minutos antes de dormir. Reduzir a luz azul sinaliza ao cérebro para produzir melatonina, garantindo um sono restaurador.",
                icon: Moon
              };
            } else if (avgMood >= 7.5) {
              return {
                title: "Multiplique sua Alegria: Pote da Gratidão",
                category: "Psicologia Positiva",
                text: "Escreva ou pense em 3 coisas simples que deram certo hoje, não importa o quão pequenas. Celebrar intencionalmente suas vitórias treina seu cérebro para focar no bem-estar.",
                icon: Sparkles
              };
            }

            return defaultTip;
          })();

          const TipIcon = tip.icon;

          return (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent border border-indigo-500/15 rounded-[2.5rem] p-6 shadow-lg shadow-indigo-500/5 space-y-3"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <TipIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-500">Dica do Dia</h4>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold">{tip.category}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
                  {tip.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed">
                  {tip.text}
                </p>
              </div>
            </motion.div>
          );
        })()}

        {/* Interactive Daily Mood Tracker */}
        <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/45 dark:shadow-none space-y-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Smile className="w-5 h-5 text-emerald-500" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 uppercase tracking-tight">Como você está hoje?</h3>
            </div>
            <p className="text-xs text-slate-500 font-medium">Selecione um emoji para registrar seu estado emocional no diário do seu perfil</p>
          </div>

          {moodSavedFeedback && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400 text-xs font-semibold"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Registro de humor gravado com sucesso! Ganhou +10 XP. Seu gráfico de tendências foi recalculado.</span>
            </motion.div>
          )}

          <div className="flex overflow-x-auto gap-2.5 pb-2 no-scrollbar -mx-2 px-2">
            {moods.map((m) => {
              const isSelected = selectedEmoji === m.emoji;
              return (
                <motion.button
                  key={m.label}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setSelectedEmoji(m.emoji);
                    setSelectedMoodValue(m.value);
                  }}
                  className={cn(
                    "flex-shrink-0 flex flex-col items-center gap-1.5 p-3 rounded-2xl border transition-all cursor-pointer w-20 min-h-[74px]",
                    isSelected 
                      ? "bg-emerald-500/10 border-emerald-500/35 shadow-inner" 
                      : "bg-slate-50 dark:bg-slate-950 border-slate-200/60 dark:border-white/5 hover:border-slate-350 dark:hover:border-white/10"
                  )}
                >
                  <span className="text-3xl filter drop-shadow-sm">{m.emoji}</span>
                  <span className={cn(
                    "text-[9px] font-bold uppercase tracking-wider",
                    isSelected ? "text-emerald-500" : "text-slate-550 dark:text-slate-500"
                  )}>{m.label}</span>
                </motion.button>
              );
            })}
          </div>

          <AnimatePresence>
            {selectedMoodValue !== null && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden space-y-4 pt-4 border-t border-slate-100 dark:border-white/5"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      <span>Sintonia/Nível de Humor:</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-black">{selectedMoodValue}/10</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={selectedMoodValue}
                      onChange={(e) => setSelectedMoodValue(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-slate-100 dark:bg-white/5 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                    <div className="flex justify-between text-[8px] text-slate-400 font-bold uppercase">
                      <span>Crítico</span>
                      <span>Neutro</span>
                      <span>Excelente</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      <span>Intensidade do Sentimento:</span>
                      <span className="text-blue-500 dark:text-blue-400 font-black">{moodIntensity}/10</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={moodIntensity}
                      onChange={(e) => setMoodIntensity(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-slate-100 dark:bg-white/5 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                    <div className="flex justify-between text-[8px] text-slate-400 font-bold uppercase">
                      <span>Brando</span>
                      <span>Moderado</span>
                      <span>Profundo</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Nota rápida sobre seu dia (Opcional):</label>
                  <textarea
                    rows={2}
                    value={moodNote}
                    onChange={(e) => setMoodNote(e.target.value)}
                    placeholder="Escreva brevemente o que motivou esse sentimento ou o seu foco mental hoje..."
                    className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/5 rounded-xl text-xs text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-emerald-500/45 transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Identifique os Gatilhos (Opcional):</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: "trabalho", label: "💼 Trabalho" },
                      { id: "familia", label: "🏠 Família" },
                      { id: "saude", label: "❤️ Saúde" },
                      { id: "financas", label: "💵 Finanças" },
                      { id: "relacionamento", label: "💑 Relacionamento" },
                      { id: "amigos", label: "👥 Amigos" },
                      { id: "sono", label: "🌙 Sono" },
                      { id: "estudos", label: "📚 Estudos" }
                    ].map((trigger) => {
                      const isSelected = selectedTriggers.includes(trigger.id);
                      return (
                        <button
                          key={trigger.id}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setSelectedTriggers(prev => prev.filter(t => t !== trigger.id));
                            } else {
                              setSelectedTriggers(prev => [...prev, trigger.id]);
                            }
                          }}
                          className={cn(
                            "px-3 py-1.5 rounded-full border text-[11px] font-bold cursor-pointer transition-all active:scale-95",
                            isSelected 
                              ? "bg-indigo-600 dark:bg-indigo-500 text-white border-indigo-600 dark:border-indigo-500 shadow-md shadow-indigo-500/10"
                              : "bg-slate-55 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/5 hover:border-slate-350 dark:hover:border-white/10"
                          )}
                        >
                          {trigger.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-2.5">
                  <button
                    onClick={handleDetailedMoodSubmit}
                    disabled={moodSaving}
                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-md shadow-emerald-600/10 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {moodSaving ? "Registrando..." : "Confirmar e Gravar"}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedMoodValue(null);
                      setSelectedEmoji("");
                      setMoodNote("");
                      setSelectedTriggers([]);
                    }}
                    className="px-4 py-3 bg-slate-100 dark:bg-white/5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 rounded-xl font-bold text-xs uppercase tracking-widest transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Recharts Emotional Trend Card */}
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/40 dark:shadow-none space-y-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-start md:items-center gap-4 border-b border-slate-100 dark:border-white/5 pb-4">
            <div className="space-y-0.5">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-500" />
                Histórico e Estatísticas
              </h3>
              <p className="text-xs text-slate-500 font-medium">Visualização em tempo real das suas oscilações emocionais e atividade</p>
            </div>
            
            <div className="flex flex-wrap bg-slate-100 dark:bg-slate-950 p-1 rounded-2xl border border-slate-200 dark:border-white/5 select-none self-start sm:self-center gap-1">
              <button
                onClick={() => setActiveAnalyticsTab('humor')}
                className={cn(
                  "px-3 py-1.5 text-[9px] font-bold uppercase rounded-xl transition-all cursor-pointer",
                  activeAnalyticsTab === 'humor' 
                    ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm border border-slate-200/50 dark:border-white/5" 
                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                )}
              >
                Histórico Simples
              </button>
              <button
                onClick={() => setActiveAnalyticsTab('sentimento')}
                className={cn(
                  "px-3 py-1.5 text-[9px] font-bold uppercase rounded-xl transition-all cursor-pointer",
                  activeAnalyticsTab === 'sentimento' 
                    ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm border border-slate-200/50 dark:border-white/5" 
                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                )}
              >
                Sentimento
              </button>
              <button
                onClick={() => setActiveAnalyticsTab('completo')}
                className={cn(
                  "px-3 py-1.5 text-[9px] font-bold uppercase rounded-xl transition-all cursor-pointer",
                  activeAnalyticsTab === 'completo' 
                    ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm border border-slate-200/50 dark:border-white/5" 
                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                )}
              >
                Estatísticas
              </button>
              <button
                onClick={() => setActiveAnalyticsTab('crise')}
                className={cn(
                  "px-3 py-1.5 text-[9px] font-bold uppercase rounded-xl transition-all cursor-pointer",
                  activeAnalyticsTab === 'crise' 
                    ? "bg-red-600 text-white shadow-sm font-extrabold" 
                    : "text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-extrabold"
                )}
              >
                Canais de Apoio (SOS)
              </button>
            </div>
          </div>

          {activeAnalyticsTab === 'completo' ? (
            <div className="pt-2">
              <DashboardAnalytics />
            </div>
          ) : activeAnalyticsTab === 'crise' ? (
            <div className="pt-2">
              <CrisisResources />
            </div>
          ) : activeAnalyticsTab === 'sentimento' ? (
            <div className="space-y-6 pt-4">
              {(() => {
                const weeklyTrendData = sentimentService.getWeeklySentimentTrend(diaryEntries);
                const joinedTrendData = weeklyTrendData.map(d => {
                  const healthDay = healthData.find(h => h.date === d.date);
                  return {
                    ...d,
                    sleep: healthDay ? healthDay.sleep : 0,
                    steps: healthDay ? healthDay.steps : 0
                  };
                });
                
                const hasTrendData = weeklyTrendData.some(d => d.score !== null);
                const correlation = healthService.analyzeCorrelation(diaryEntries, healthData);

                return (
                  <>
                    {/* 1. Integração com HealthKit / Google Fit */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2.5rem] p-6 space-y-4 shadow-xl shadow-slate-100 dark:shadow-none">
                      <div className="flex items-center gap-2">
                        <Dumbbell className="w-5 h-5 text-emerald-500 shrink-0" />
                        <div>
                          <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">Integração com Sensores de Saúde</h3>
                          <p className="text-[11px] text-slate-500">Conecte seus dados físicos para cruzar com seu estado de espírito</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                          onClick={handleToggleGoogleFit}
                          disabled={syncingHealth}
                          className={cn(
                            "p-4 rounded-3xl border text-left transition-all active:scale-95 flex items-center justify-between cursor-pointer min-h-[56px]",
                            isGoogleFitLinked
                              ? "bg-emerald-500/10 border-emerald-500/35 text-emerald-600 dark:text-emerald-400"
                              : "bg-slate-50 dark:bg-slate-950 border-slate-150 dark:border-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-100"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xl">🤖</span>
                            <div>
                              <span className="text-xs font-bold block">Google Fit</span>
                              <span className="text-[10px] text-slate-400">{isGoogleFitLinked ? "Conectado" : "Desconectado"}</span>
                            </div>
                          </div>
                          {isGoogleFitLinked ? <ToggleRight className="w-6 h-6 text-emerald-500" /> : <ToggleLeft className="w-6 h-6 text-slate-400" />}
                        </button>

                        <button
                          onClick={handleToggleHealthKit}
                          disabled={syncingHealth}
                          className={cn(
                            "p-4 rounded-3xl border text-left transition-all active:scale-95 flex items-center justify-between cursor-pointer min-h-[56px]",
                            isHealthKitLinked
                              ? "bg-emerald-500/10 border-emerald-500/35 text-emerald-600 dark:text-emerald-400"
                              : "bg-slate-50 dark:bg-slate-950 border-slate-150 dark:border-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-100"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xl">🍎</span>
                            <div>
                              <span className="text-xs font-bold block">Apple HealthKit</span>
                              <span className="text-[10px] text-slate-400">{isHealthKitLinked ? "Conectado" : "Desconectado"}</span>
                            </div>
                          </div>
                          {isHealthKitLinked ? <ToggleRight className="w-6 h-6 text-emerald-500" /> : <ToggleLeft className="w-6 h-6 text-slate-400" />}
                        </button>
                      </div>

                      {(isGoogleFitLinked || isHealthKitLinked) && (
                        <div className="pt-2 border-t border-slate-100 dark:border-white/5 space-y-3">
                          <div className="flex justify-between items-center">
                            <p className="text-[10px] font-bold text-slate-500 uppercase">Métricas de Hoje</p>
                            <button
                              onClick={() => setShowManualHealthInput(!showManualHealthInput)}
                              className="text-[10px] text-indigo-500 hover:text-indigo-600 font-bold cursor-pointer"
                            >
                              {showManualHealthInput ? "Fechar Ajustes" : "Simular / Ajustar Métricas de Hoje"}
                            </button>
                          </div>

                          {showManualHealthInput ? (
                            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-150 dark:border-white/5 space-y-3">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                  <label className="text-[10px] text-slate-500 font-bold block">Horas de Sono</label>
                                  <input
                                    type="number"
                                    step="0.5"
                                    min="2"
                                    max="15"
                                    value={sleepInput}
                                    onChange={(e) => setSleepInput(parseFloat(e.target.value) || 0)}
                                    className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-xl text-xs focus:outline-none"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] text-slate-500 font-bold block">Passos Caminhados</label>
                                  <input
                                    type="number"
                                    step="500"
                                    min="0"
                                    max="30000"
                                    value={stepsInput}
                                    onChange={(e) => setStepsInput(parseInt(e.target.value) || 0)}
                                    className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-xl text-xs focus:outline-none"
                                  />
                                </div>
                              </div>
                              <button
                                onClick={handleSaveManualHealth}
                                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all active:scale-95 cursor-pointer"
                              >
                                Gravar Métricas de Hoje
                              </button>
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 gap-3">
                              <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-150 dark:border-white/5 flex items-center justify-between">
                                <span className="text-xs font-semibold text-slate-555">🌙 Horas de Sono</span>
                                <span className="text-xs font-bold text-indigo-500">{healthData[healthData.length - 1]?.sleep || "7.2"}h</span>
                              </div>
                              <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-150 dark:border-white/5 flex items-center justify-between">
                                <span className="text-xs font-semibold text-slate-555">🏃 Passos</span>
                                <span className="text-xs font-bold text-emerald-500">{healthData[healthData.length - 1]?.steps || "5.800"}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* 2. Tendência com Cruzamento de Dados (Recharts) */}
                    <div className="bg-slate-50 dark:bg-slate-950/45 border border-slate-200/50 dark:border-white/5 rounded-[2.5rem] p-6 space-y-4 shadow-inner">
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                          <span>📊 Tendência Emocional & Dados de Saúde</span>
                        </h4>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          Visualização integrada do índice de sentimento do diário cruzado com sono (colunas) e atividade física (passos).
                        </p>
                      </div>

                      <div className="h-64 w-full pt-4 font-sans">
                        {!hasTrendData ? (
                          <div className="h-full w-full flex flex-col items-center justify-center text-center p-8 bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-white/5 rounded-3xl space-y-3">
                            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/30 rounded-2xl flex items-center justify-center text-indigo-500">
                              <BookOpen className="w-5 h-5" />
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Nenhum registro de diário esta semana</p>
                              <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                                Escreva suas reflexões diárias no diário para cruzar seus sentimentos com dados de sono!
                              </p>
                            </div>
                            <button 
                              onClick={() => navigate('/diario')}
                              className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
                            >
                              Escrever no Diário
                            </button>
                          </div>
                        ) : (
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={joinedTrendData} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.08)" vertical={false} />
                              <XAxis 
                                dataKey="dateLabel" 
                                stroke="rgba(148, 163, 184, 0.45)" 
                                fontSize={10} 
                                tickLine={false} 
                                axisLine={false}
                                dy={10}
                              />
                              <YAxis 
                                domain={[1, 10]} 
                                stroke="rgba(148, 163, 184, 0.45)" 
                                fontSize={10} 
                                tickLine={false} 
                                axisLine={false}
                                dx={-10}
                              />
                              <Tooltip
                                content={({ active, payload }) => {
                                  if (active && payload && payload.length) {
                                    const data = payload[0].payload;
                                    
                                    return (
                                      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-3 rounded-2xl shadow-xl space-y-1.5 font-sans max-w-[240px]">
                                        <p className="text-[10px] text-slate-400 font-bold uppercase">{data.dateLabel}</p>
                                        <div className="space-y-1">
                                          <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex justify-between gap-4">
                                            <span>Média Sentimento:</span>
                                            <span>{data.score || "N/A"}/10</span>
                                          </p>
                                          <p className="text-xs text-slate-650 dark:text-slate-350 flex justify-between gap-4">
                                            <span>🌙 Horas Sono:</span>
                                            <span>{data.sleep || "N/A"}h</span>
                                          </p>
                                          <p className="text-xs text-slate-650 dark:text-slate-350 flex justify-between gap-4">
                                            <span>🏃 Passos:</span>
                                            <span>{data.steps || "N/A"}</span>
                                          </p>
                                        </div>
                                      </div>
                                    );
                                  }
                                  return null;
                                }}
                              />
                              <Line 
                                type="monotone" 
                                dataKey="score" 
                                stroke="url(#lineGradientSentiment)" 
                                strokeWidth={3}
                                connectNulls={true}
                                dot={{ r: 4, strokeWidth: 2, fill: "#8b5cf6" }}
                                activeDot={{ r: 6, strokeWidth: 0, fill: "#8b5cf6" }}
                              />
                              <defs>
                                <linearGradient id="lineGradientSentiment" x1="0" y1="0" x2="1" y2="0">
                                  <stop offset="0%" stopColor="#8b5cf6" />
                                  <stop offset="100%" stopColor="#6366f1" />
                                </linearGradient>
                              </defs>
                            </LineChart>
                          </ResponsiveContainer>
                        )}
                      </div>

                      {hasTrendData && (
                        <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center items-center text-[9px] uppercase font-bold text-slate-500 tracking-wider pt-2 border-t border-slate-200/50 dark:border-white/5">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                            <span>Índice Sentimento Diário (1-10)</span>
                          </div>
                          {(isGoogleFitLinked || isHealthKitLinked) && (
                            <>
                              <div className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                                <span>Sono Conectado</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span>Passos Sincronizados</span>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    {/* 3. Card de Correlação Emocional/Física */}
                    <div className="bg-gradient-to-br from-indigo-55/10 via-emerald-55/5 to-transparent border border-slate-200 dark:border-white/5 rounded-[2.5rem] p-6 space-y-3 shadow-md">
                      <div className="flex items-center gap-2">
                        <Brain className="w-5 h-5 text-indigo-500 shrink-0" />
                        <h4 className="text-xs font-bold uppercase tracking-widest text-indigo-500">Análise de Correlação Física & Mental</h4>
                      </div>
                      
                      <div className="space-y-2 text-xs">
                        <div className="p-3 bg-white/40 dark:bg-slate-900/30 rounded-2xl border border-indigo-500/10 space-y-1">
                          <span className="font-bold text-slate-700 dark:text-slate-300 block">🌙 Impacto do Sono no Humor</span>
                          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            {correlation.sleepCorrelation}
                          </p>
                        </div>
                        
                        <div className="p-3 bg-white/40 dark:bg-slate-900/30 rounded-2xl border border-indigo-500/10 space-y-1">
                          <span className="font-bold text-slate-700 dark:text-slate-300 block">🏃 Impacto da Atividade Física no Humor</span>
                          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            {correlation.activityCorrelation}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* 4. Sistema de Lembretes Agendados do Paciente */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2.5rem] p-6 space-y-4 shadow-xl shadow-slate-100 dark:shadow-none">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Bell className="w-5 h-5 text-indigo-500 shrink-0" />
                          <div>
                            <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">Lembretes Diários do Diário</h3>
                            <p className="text-[11px] text-slate-500">Defina o melhor momento do dia para sua escrita terapêutica</p>
                          </div>
                        </div>

                        <button
                          onClick={() => setNotificationScheduled(!notificationScheduled)}
                          className={cn(
                            "p-2 rounded-xl border transition-all cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center",
                            notificationScheduled
                              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
                              : "bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/5 text-slate-450"
                          )}
                          title={notificationScheduled ? "Lembretes Ativados" : "Lembretes Desativados"}
                        >
                          <Check className={cn("w-4 h-4", notificationScheduled ? "opacity-100" : "opacity-30")} />
                        </button>
                      </div>

                      {notificationScheduled && (
                        <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-slate-600">Disparar Lembrete Diário às:</span>
                            <input
                              type="time"
                              value={notificationTime}
                              onChange={(e) => setNotificationTime(e.target.value)}
                              className="p-2 border border-slate-200 dark:border-white/5 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                            />
                          </div>

                          <button
                            onClick={handleSaveNotificationSetting}
                            disabled={savingNotification}
                            className="px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-200 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-indigo-500/10 cursor-pointer text-center"
                          >
                            {savingNotification ? "Gravando..." : "Salvar Agendamento"}
                          </button>
                        </div>
                      )}

                      {showNotificationSavedToast && (
                        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                          <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span>Notificação agendada com sucesso! Você receberá um alerta diariamente às {notificationTime}.</span>
                        </div>
                      )}
                    </div>

                    {/* 5. Exportar Relatório em PDF */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2.5rem] p-6 space-y-4 shadow-xl shadow-slate-100 dark:shadow-none">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-indigo-500 shrink-0" />
                        <div>
                          <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">Exportar Progresso para Especialistas</h3>
                          <p className="text-[11px] text-slate-500">Gere um documento PDF completo e seguro com todo o seu histórico emocional</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <button
                          onClick={() => handleExportSentimentPDF('weekly')}
                          className="py-3 bg-slate-50 dark:bg-slate-950 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-300 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
                        >
                          <Download className="w-4 h-4 shrink-0" />
                          Baixar Semanal
                        </button>
                        
                        <button
                          onClick={() => handleExportSentimentPDF('monthly')}
                          className="py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-2xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[44px] shadow-md shadow-indigo-500/10"
                        >
                          <Download className="w-4 h-4 shrink-0" />
                          Baixar Mensal
                        </button>
                      </div>
                    </div>

                    {/* Registros do Diário e Sentimentos */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        Registros do Diário e Sentimentos
                      </h4>

                      {diaryEntries.length === 0 ? (
                        <p className="text-xs text-slate-500 italic">Nenhum registro encontrado no diário.</p>
                      ) : (
                        <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                          {diaryEntries.slice(0, 5).map((entry) => {
                            const sentiment = sentimentService.analyzeDiarySentiment(entry.content, entry.moodValue);
                            const isSelectedForAI = selectedDiaryEntryForAI?.id === entry.id;

                            return (
                              <div 
                                key={entry.id} 
                                className="bg-slate-50/50 dark:bg-slate-950/20 border border-slate-150 dark:border-white/5 rounded-3xl p-4 space-y-3 transition-all"
                              >
                                <div className="flex justify-between items-start gap-2">
                                  <div>
                                    <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                      {entry.title || "Sem título"}
                                    </h5>
                                    <span className="text-[10px] text-slate-400">
                                      {entry.timestamp ? new Date(entry.timestamp).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ""}
                                    </span>
                                  </div>

                                  <div className="flex flex-col items-end gap-1">
                                    <span className={cn(
                                      "text-[10px] font-bold px-2 py-0.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-white/5 flex items-center gap-1 shadow-sm",
                                      sentiment.color
                                    )}>
                                      <span>{sentiment.emoji}</span>
                                      <span>{sentiment.label}</span>
                                    </span>
                                    <span className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider">
                                      {sentiment.dominantEmotion}
                                    </span>
                                  </div>
                                </div>

                                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                                  {entry.content}
                                </p>

                                <div className="flex justify-between items-center pt-2 border-t border-slate-200/40 dark:border-white/5">
                                  {entry.triggers && entry.triggers.length > 0 ? (
                                    <div className="flex flex-wrap gap-1">
                                      {entry.triggers.map((t: string) => (
                                        <span key={t} className="text-[9px] px-1.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-500 font-medium">
                                          {t}
                                        </span>
                                      ))}
                                    </div>
                                  ) : (
                                    <div />
                                  )}

                                  <button
                                    onClick={() => handleAIAnalysis(entry)}
                                    className="text-[10px] text-indigo-500 hover:text-indigo-600 font-bold flex items-center gap-1 cursor-pointer"
                                  >
                                    <Sparkles className="w-3 h-3 animate-pulse" />
                                    Análise Avançada IA
                                  </button>
                                </div>

                                {/* Inline AI Analysis result */}
                                {isSelectedForAI && (
                                  <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-2xl p-3.5 space-y-2 text-xs relative mt-2">
                                    <button 
                                      onClick={handleCloseAIAnalysis}
                                      className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                    
                                    <div className="flex items-center gap-1.5">
                                      <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                                      <span className="font-bold text-indigo-600 dark:text-indigo-400">Insights Clínicos de Sentimento (IA)</span>
                                    </div>

                                    {loadingAISentiment ? (
                                      <div className="flex items-center gap-2 text-slate-500 py-2">
                                        <div className="w-3 h-3 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                                        <span>IARA está analisando a escrita...</span>
                                      </div>
                                    ) : aiSentimentReport ? (
                                      <div className="space-y-2.5 pt-1">
                                        <div className="flex justify-between items-center">
                                          <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wide">Pontuação do Tom</span>
                                          <span className="font-mono font-bold text-indigo-500 text-sm">{aiSentimentReport.score}/10</span>
                                        </div>
                                        <p className="text-slate-600 dark:text-slate-350 italic leading-relaxed">
                                          "{aiSentimentReport.explanation}"
                                        </p>
                                        <div className="bg-white dark:bg-slate-900 border border-indigo-500/10 p-2.5 rounded-xl space-y-1">
                                          <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-500">Recomendação</span>
                                          <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                                            {aiSentimentReport.advice}
                                          </p>
                                        </div>
                                        {aiSentimentReport.keywords && aiSentimentReport.keywords.length > 0 && (
                                          <div className="flex flex-wrap gap-1 pt-1">
                                            {aiSentimentReport.keywords.map((kw: string) => (
                                              <span key={kw} className="text-[9px] px-1.5 py-0.5 rounded-full bg-slate-150 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                                #{kw}
                                              </span>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    ) : (
                                      <p className="text-slate-500 italic">Ocorreu um erro na análise de IA.</p>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-end">
                <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-2xl border border-slate-200 dark:border-white/5 select-none">
                  {(['7', '30', 'all'] as const).map((period) => (
                    <button
                      key={period}
                      onClick={() => setChartPeriod(period)}
                      className={cn(
                        "px-3 py-1.5 text-[9px] font-bold uppercase rounded-xl transition-all cursor-pointer",
                        chartPeriod === period 
                          ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm border border-slate-200/50 dark:border-white/5" 
                          : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                      )}
                    >
                      {period === '7' ? "7 dias" : period === '30' ? "30 dias" : "Tudo"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-60 w-full pt-4 font-sans">
                {getChartData().length === 0 ? (
                  <div className="h-full w-full flex flex-col items-center justify-center text-center p-8 bg-slate-50/50 dark:bg-slate-950/20 border border-dashed border-slate-200 dark:border-white/5 rounded-3xl space-y-2">
                    <div className="w-12 h-12 bg-slate-100 dark:bg-white/5 rounded-2xl flex items-center justify-center text-slate-400">
                      <Activity className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Ainda sem dados registrados</p>
                      <p className="text-xs text-slate-450 dark:text-slate-550 max-w-xs leading-relaxed">Selecione um emoji e registre seu humor acima para redefinir as tendências e criar sua curva em tempo real!</p>
                    </div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={getChartData()} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.08)" vertical={false} />
                      <XAxis 
                        dataKey="data" 
                        stroke="rgba(148, 163, 184, 0.45)" 
                        fontSize={10} 
                        tickLine={false} 
                        axisLine={false}
                        dy={10}
                        fontFamily="inherit"
                      />
                      <YAxis 
                        domain={[0, 10]} 
                        stroke="rgba(148, 163, 184, 0.45)" 
                        fontSize={10} 
                        tickLine={false} 
                        axisLine={false}
                        dx={-10}
                        fontFamily="inherit"
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-3 rounded-2xl shadow-xl space-y-1.5 font-sans max-w-[240px]">
                                <p className="text-[10px] text-slate-400 font-bold uppercase">{data.dataCompleta}</p>
                                <div className="space-y-1">
                                  <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex justify-between gap-4">
                                    <span>Humor:</span>
                                    <span>{data.humor}/10</span>
                                  </p>
                                  <p className="text-xs font-medium text-blue-500 flex justify-between gap-4">
                                    <span>Intensidade:</span>
                                    <span>{data.intensidade}/10</span>
                                  </p>
                                </div>
                                {data.note && (
                                  <p className="text-[10.5px] text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-white/5 pt-1.5 italic">
                                    "{data.note}"
                                  </p>
                                )}
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="humor" 
                        stroke="url(#lineGradientHumor)" 
                        strokeWidth={3}
                        dot={{ r: 3, strokeWidth: 1.5, fill: "#10b981" }}
                        activeDot={{ r: 5, strokeWidth: 0, fill: "#10b981" }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="intensidade" 
                        stroke="rgba(59, 130, 246, 0.4)" 
                        strokeWidth={1.5}
                        strokeDasharray="4 4"
                        dot={false}
                      />
                      <defs>
                        <linearGradient id="lineGradientHumor" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#10b981" />
                          <stop offset="100%" stopColor="#059669" />
                        </linearGradient>
                      </defs>
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>

              <div className="flex gap-4 justify-center items-center text-[9px] uppercase font-bold text-slate-500 dark:text-slate-500 tracking-wider pt-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Nível de Humor</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full border border-dashed border-blue-500 bg-transparent" />
                  <span className="text-slate-500">Intensidade do Sentimento</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Triggers Distribution Card */}
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/45 dark:shadow-none space-y-4">
          <div className="space-y-0.5">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-500" />
              Distribuição de Gatilhos Recorrentes
            </h3>
            <p className="text-xs text-slate-500 font-medium">Fatores ou áreas correlacionadas com seu estado de humor registrado</p>
          </div>

          <div className="h-60 w-full flex items-center justify-center font-sans">
            {getTriggersChartData().length === 0 ? (
              <div className="h-full w-full flex flex-col items-center justify-center text-center p-8 bg-slate-50/50 dark:bg-slate-950/20 border border-dashed border-slate-200 dark:border-white/5 rounded-3xl space-y-2">
                <div className="w-12 h-12 bg-slate-100 dark:bg-white/5 rounded-2xl flex items-center justify-center text-slate-400">
                  <Activity className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Sem gatilhos identificados</p>
                  <p className="text-xs text-slate-450 dark:text-slate-550 max-w-xs leading-relaxed">
                    Marque os fatores determinantes (ex: Trabalho, Família, Saúde) ao registrar novos sentimentos acima para visualizar seus gatilhos!
                  </p>
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={getTriggersChartData()}
                    cx="50%"
                    cy="45%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {getTriggersChartData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 px-3 py-2 rounded-xl shadow-lg text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }} />
                            <span>{data.name}: <strong className="text-indigo-600 dark:text-indigo-400">{data.value} {data.value === 1 ? 'registro' : 'registros'}</strong></span>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend 
                    layout="horizontal" 
                    verticalAlign="bottom" 
                    align="center"
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 capitalize">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Quick Actions Carousel */}
        <section className="space-y-3">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Acesso Rápido</h3>
          </div>
          <div className="flex overflow-x-auto gap-3 pb-4 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
            {quickActions.map((action, idx) => (
              <motion.button
                key={action.id}
                whileHover={{ y: -4, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(action.path)}
                className={cn(
                  "flex-shrink-0 flex flex-col items-center gap-2 p-3 rounded-2xl border border-white/10 shadow-sm transition-all",
                  "w-20 sm:w-24",
                  idx % 3 === 0 ? "bg-slate-900 dark:bg-white/5" : "bg-white dark:bg-slate-900",
                  "hover:shadow-lg hover:shadow-emerald-500/5",
                  idx % 2 === 0 ? "mt-1" : "mt-0"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-inner",
                  action.color
                )}>
                  <action.icon className="w-4 h-4" />
                </div>
                <span className="text-[9px] font-bold text-slate-600 dark:text-slate-400 text-center truncate w-full">
                  {action.label}
                </span>
              </motion.button>
            ))}
          </div>
        </section>

        {/* Gamification Stats */}
        <div className="grid grid-cols-2 gap-4">
          <motion.div 
            whileHover={{ y: -2 }}
            className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-white/5 flex items-center gap-3 shadow-sm"
          >
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-500/20 rounded-2xl flex items-center justify-center text-orange-600 dark:text-orange-400">
              <Zap className="w-4 h-4 fill-current" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Streak</p>
              <p className="text-lg font-bold text-slate-800 dark:text-slate-200">{userProfile?.streak || 0} dias</p>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -2 }}
            className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-white/5 flex items-center gap-3 shadow-sm"
          >
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-500/20 rounded-2xl flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Sparkles className="w-4 h-4 fill-current" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Nível</p>
              <p className="text-lg font-bold text-slate-800 dark:text-slate-200">{userProfile?.level || 'Iniciante'}</p>
            </div>
          </motion.div>
        </div>

        {/* Progress Bar */}
        {nextLevel && (
          <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm space-y-2">
            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-500">
              <span>Progresso para {nextLevel.name}</span>
              <span>{userProfile?.xp || 0} / {nextLevel.minXp} XP</span>
            </div>
            <div className="h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-emerald-500 rounded-full"
              />
            </div>
          </div>
        )}

        {/* Daily Pill */}
        {dailyPill && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
              <Sparkles size={48} className="text-emerald-500" />
            </div>
            
            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-3">
                <div className="px-4 py-1.5 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full text-[10px] font-bold uppercase tracking-widest">
                  Pílula do Dia • {dailyPill.fase}
                </div>
                <div className="text-[10px] text-slate-400 font-medium">Dia {dailyPill.dia} de 365</div>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100 leading-tight">
                  "{dailyPill.frase}"
                </h2>
                
                <div className="space-y-4 pt-2">
                  <div className="flex gap-4">
                    <div className="w-1 bg-emerald-500/30 rounded-full" />
                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed italic">
                      {dailyPill.reflexao}
                    </p>
                  </div>

                  <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-100 dark:border-white/5">
                    <div className="flex items-center gap-2 mb-1">
                      <Zap size={14} className="text-amber-500 fill-current" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Ação Sugerida</span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 text-sm font-medium">
                      {dailyPill.acao}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button 
                  onClick={handleReadPill}
                  disabled={pillRead}
                  className={cn(
                    "flex-1 py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2",
                    pillRead 
                      ? "bg-slate-100 dark:bg-white/5 text-slate-400 cursor-default"
                      : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20"
                  )}
                >
                  {pillRead ? <Check className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
                  {pillRead ? "Pílula Absorvida" : "Absorver Pílula (+3 XP)"}
                </button>
                <button 
                  onClick={handleSetFavoritePill}
                  className="flex-1 py-4 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 border border-indigo-500/20"
                >
                  <Star className="w-4 h-4" />
                  Pílula da Semana
                </button>
                <button 
                  onClick={() => navigate("/reset")}
                  className="flex-1 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  <RefreshCw className="w-4 h-4" />
                  Fazer ReSet Agora
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Notification Prompt */}
        {NotificationService.isPendingOrDenied() && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-emerald-600 dark:bg-emerald-500 rounded-[2rem] p-6 text-white shadow-xl shadow-emerald-600/20 relative overflow-hidden"
          >
            <div className="relative z-10 flex items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Bell className="w-4 h-4 text-emerald-100" />
                  <span className="text-xs font-bold uppercase tracking-widest text-emerald-100 font-sans">Notificações</span>
                </div>
                <h3 className="text-xl font-bold mb-1 font-serif italic text-white">Fique por dentro</h3>
                <p className="text-sm text-emerald-50/80 leading-relaxed font-sans">
                  {notificationPermission === "denied"
                    ? "Para receber lembretes de sessões e meditação, ative as notificações no topo da página ou através do seu navegador."
                    : "Ative as notificações para receber lembretes de sessões e dicas diárias."}
                </p>
              </div>
              <button 
                onClick={async () => {
                  if (notificationPermission === "denied") {
                    setShowDeniedModal(true);
                  } else {
                    await requestNotificationPermission();
                  }
                }}
                className="px-6 py-3 bg-white text-emerald-600 hover:bg-emerald-50 rounded-2xl font-bold text-sm transition-colors shadow-lg shadow-black/5 cursor-pointer whitespace-nowrap"
              >
                Ativar notificações
              </button>
            </div>
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
          </motion.div>
        )}

        {/* Pill of the Week Highlight */}
        {userProfile?.pillOfTheWeek && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[2.5rem] p-6 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden"
          >
            <div className="absolute -right-4 -top-4 opacity-20">
              <Star size={80} className="text-white fill-current" />
            </div>
            <div className="relative z-10 space-y-3">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-indigo-200 fill-current" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-100">Sua Pílula da Semana</span>
              </div>
              <h3 className="text-xl font-bold leading-tight">"{userProfile.pillOfTheWeek.frase}"</h3>
              <p className="text-xs text-indigo-100/80">Escolhida em {new Date(userProfile.pillOfTheWeek.timestamp).toLocaleDateString('pt-BR')}</p>
            </div>
          </motion.div>
        )}

        {/* Session Reminder */}
        {appointmentToRemind && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-amber-500 dark:bg-amber-600 rounded-[2rem] p-6 text-white shadow-xl shadow-amber-500/20 relative overflow-hidden"
          >
            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-amber-100" />
                  <span className="text-xs font-bold uppercase tracking-widest text-amber-100">Lembrete de Sessão</span>
                </div>
                <h3 className="text-xl font-bold mb-1">Sessão em menos de 24h</h3>
                <p className="text-sm text-amber-50/90 leading-relaxed">
                  Sua sessão com {appointmentToRemind.therapistNome} é amanhã às {new Date(appointmentToRemind.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}.
                </p>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <button 
                  onClick={() => {
                    userService.updateAppointmentStatus(appointmentToRemind.id, 'confirmed');
                    userService.markAppointmentReminded(appointmentToRemind.id);
                    setAppointmentToRemind(null);
                  }}
                  className="flex-1 sm:flex-none px-4 py-2 bg-white text-amber-600 rounded-xl font-bold text-xs hover:bg-amber-50 transition-colors shadow-lg shadow-black/5"
                >
                  Confirmar
                </button>
                <button 
                  onClick={() => navigate(`/agendamento/${appointmentToRemind.therapistId}`)}
                  className="flex-1 sm:flex-none px-4 py-2 bg-amber-400/30 text-white rounded-xl font-bold text-xs hover:bg-amber-400/40 transition-colors border border-white/20"
                >
                  Reagendar
                </button>
              </div>
            </div>
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
          </motion.div>
        )}
        
        {/* Sentí Go - Instant Help (Uber-like) */}
        <motion.section 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-900 border border-emerald-500/30 rounded-[2.5rem] p-6 text-white shadow-2xl relative overflow-hidden group"
        >
          <div className="absolute -right-8 -top-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <Zap className="w-16 h-16 text-emerald-400" />
          </div>
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/30 backdrop-blur-md">
                <Zap className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-lg font-black tracking-tight">Sentí Go</h3>
                <p className="text-emerald-400/80 text-xs font-bold uppercase tracking-widest">Ajuda Instantânea</p>
              </div>
            </div>
            
            <p className="text-slate-400 text-sm leading-relaxed">
              Precisa falar com alguém agora? O <span className="text-white font-bold">Sentí Go</span> encontra o primeiro terapeuta disponível para você em segundos.
            </p>

            <button 
              onClick={() => {
                const onlineTherapist = featuredTherapists.find(t => t.online);
                if (onlineTherapist) {
                  navigate(`/agendamento/${onlineTherapist.uid}`);
                } else {
                  navigate("/profissionais");
                }
              }}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-base transition-all shadow-xl shadow-emerald-900/40 flex items-center justify-center gap-3 active:scale-95"
            >
              Conectar Agora
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.section>

        {/* Dica do Dia */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-500/20 rounded-2xl p-4 flex items-start gap-4"
        >
          <div className="w-10 h-10 bg-amber-100 dark:bg-amber-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <Lightbulb className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-amber-800 dark:text-amber-400 mb-1">Dica do Dia</h4>
            <p className="text-sm text-amber-700 dark:text-amber-200/80 leading-relaxed">{dicaHoje}</p>
          </div>
        </motion.section>

        {/* Mood Card */}
        <motion.section 
          id="onboarding-mood"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-3xl p-6 relative overflow-hidden group shadow-sm card-hover"
        >
          <div className="absolute top-0 right-0 p-4 opacity-5 dark:opacity-10 group-hover:opacity-10 dark:group-hover:opacity-20 transition-opacity">
            <Activity className="w-12 h-12 text-emerald-500 dark:text-emerald-400" />
          </div>
          
          <div className="relative z-10 space-y-4">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider">Como você está hoje?</h3>
                <p className="text-2xl font-light text-slate-800 dark:text-slate-100">
                  {recentMood ? `Último registro: ${recentMood.value}/10` : "Ainda não registrou hoje"}
                </p>
              </div>
              <button 
                onClick={() => navigate("/diario")}
                className="p-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-200 dark:border-emerald-500/20 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors"
              >
                <Zap className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={() => navigate("/reset")}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-sm font-bold transition-all shadow-lg shadow-emerald-600/20 dark:shadow-emerald-900/20 flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                ReSet Agora
              </button>
              <button 
                id="onboarding-iara"
                onClick={() => navigate("/chat")}
                className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl text-sm font-bold transition-all border border-slate-200 dark:border-white/5 flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                Falar com IARA
              </button>
            </div>
          </div>
        </motion.section>

        {/* Download App CTA */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-6 text-white shadow-xl shadow-indigo-900/20 relative overflow-hidden card-hover"
        >
          <div className="absolute -right-6 -top-6 opacity-20">
            <Smartphone className="w-16 h-16 rotate-12" />
          </div>
          <div className="relative z-10 space-y-4">
            <div className="space-y-1">
              <h3 className="text-lg font-black">Sentí no seu Bolso</h3>
              <p className="text-indigo-100 text-xs">Baixe o app para acesso offline e notificações em tempo real.</p>
            </div>
            <button 
              onClick={handleInstall}
              className="w-full py-3 bg-white text-indigo-700 rounded-2xl font-bold text-sm hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2 shadow-lg"
            >
              {isInstallable ? "Instalar Aplicativo" : "Baixar Aplicativo"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.section>

        {/* 21 Days Journey Card */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onClick={() => navigate("/reset21")}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-3xl p-6 relative overflow-hidden group cursor-pointer hover:border-emerald-500/30 transition-all shadow-sm card-hover"
        >
          <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Calendar className="w-16 h-16 text-emerald-500 dark:text-emerald-400" />
          </div>
          <div className="relative z-10 flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest">Jornada 21 Dias</h3>
              <p className="text-xl font-black text-slate-800 dark:text-slate-100">Seu ReSet Diário</p>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-32 h-1.5 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-50 w-[15%]" />
                </div>
                <span className="text-[10px] font-bold text-slate-500">Dia 3/21</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
              <PlayCircle className="w-5 h-5" />
            </div>
          </div>
        </motion.section>

        {/* IARA Live Call to Action */}
        <motion.section 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-3xl p-6 text-white shadow-xl shadow-emerald-900/40 relative overflow-hidden card-hover"
        >
          <div className="absolute -right-4 -bottom-4 opacity-20">
            <Sparkles className="w-20 h-20" />
          </div>
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                <Video className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Sessão IARA Live</h3>
                <p className="text-emerald-100 text-xs">Converse com a IARA por vídeo agora</p>
              </div>
            </div>
            <button 
              onClick={() => navigate("/live-iara")}
              className="w-full py-3 bg-white text-emerald-700 rounded-2xl font-bold text-sm hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2"
            >
              Iniciar Sessão ao Vivo
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.section>

        {/* Next Appointment */}
        {nextAppointment && (
          <motion.section 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-500/20 rounded-3xl p-6 flex items-center justify-between shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-500/20 rounded-2xl flex items-center justify-center">
                <Calendar className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-emerald-600 dark:text-emerald-400/60 uppercase tracking-widest font-bold">Próxima Sessão</p>
                <h4 className="text-lg font-medium text-slate-800 dark:text-slate-100">
                  {new Date(nextAppointment.date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })} às {new Date(nextAppointment.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">Com Dr(a). {nextAppointment.therapistNome}</p>
              </div>
            </div>
            <button 
              onClick={() => navigate(`/atendimento/${nextAppointment.id}`)}
              className="w-10 h-10 bg-emerald-600 dark:bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-600/20 dark:shadow-emerald-900/40 hover:scale-110 transition-transform"
            >
              <Video className="w-4 h-4" />
            </button>
          </motion.section>
        )}

        {/* Guided Direction - Especialidades */}
        <section className="space-y-4">
          <div className="px-2">
            <h3 className="text-xl font-medium text-slate-800 dark:text-slate-200">Como você está se sentindo?</h3>
            <p className="text-sm text-slate-500">Escolha um tema para direcionamento guiado</p>
          </div>
          <Especialidades 
            selecionada="" 
            onSelecionar={(e) => navigate(`/profissionais?tipo=${e}`)} 
          />
        </section>

        {/* Marketplace / Terapeutas Online Section */}
        <section id="onboarding-therapists" className="space-y-4">
          <div className="flex justify-between items-end px-2">
            <div>
              <h3 className="text-xl font-medium text-slate-800 dark:text-slate-200">Match Inteligente</h3>
              <p className="text-sm text-slate-500">Profissionais online agora</p>
            </div>
            <button 
              onClick={() => navigate("/profissionais")}
              className="text-sm text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 hover:gap-2 transition-all"
            >
              Ver todos <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {featuredTherapists.map((prof) => (
              <motion.div 
                key={prof.uid}
                whileHover={{ x: 4 }}
                onClick={() => navigate(`/terapeuta-perfil/${prof.uid}`)}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex items-center gap-5 cursor-pointer hover:border-emerald-500/30 transition-all shadow-xl shadow-black/10 group relative overflow-hidden"
              >
                <div className="relative shrink-0">
                  <img 
                    src={prof.fotoUrl || `https://picsum.photos/seed/${prof.uid}/200/200`} 
                    alt={prof.nome} 
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-slate-800 shadow-inner"
                    referrerPolicy="no-referrer"
                  />
                  {prof.online && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-4 border-slate-900 animate-pulse shadow-lg shadow-emerald-500/20" />
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-black text-slate-100 group-hover:text-emerald-400 transition-colors tracking-tight">{prof.nome}</h4>
                    <div className="bg-slate-800/50 px-2 py-1 rounded-lg border border-white/5">
                      <StarRating rating={prof.rating || 4.8} count={prof.reviewCount || 124} size={12} />
                    </div>
                  </div>
                  <p className="text-[10px] font-bold text-emerald-400/80 uppercase tracking-widest line-clamp-1">{prof.especialidades?.join(" • ") || "Psicólogo"}</p>
                  
                  {/* DNA Tags */}
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {prof.estilo && (
                      <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded-md border border-blue-500/10">
                        {prof.estilo}
                      </span>
                    )}
                    {prof.abordagem && (
                      <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 bg-purple-500/10 text-purple-400 rounded-md border border-purple-500/10">
                        {prof.abordagem}
                      </span>
                    )}
                  </div>
                  
                  <div className="mt-4 flex gap-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/agendamento/${prof.uid}`);
                      }}
                      className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-[10px] font-black rounded-xl uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/10 active:scale-95"
                    >
                      Agendar
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        const numero = "5511999999999";
                        const mensagem = encodeURIComponent(`Olá, vi seu perfil no Sentí e gostaria de tirar uma dúvida.`);
                        window.open(`https://wa.me/${numero}?text=${mensagem}`, "_blank");
                      }}
                      className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-100 text-[10px] font-black rounded-xl uppercase tracking-widest transition-all border border-white/5 active:scale-95"
                    >
                      Dúvida
                    </button>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-slate-800/50 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-slate-950 transition-all border border-white/5">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Quick Actions */}
        <section className="grid grid-cols-2 gap-4">
          <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              const onlineTherapist = featuredTherapists.find(t => t.online);
              if (onlineTherapist) {
                navigate(`/agendamento/${onlineTherapist.uid}`);
              } else {
                navigate("/profissionais");
              }
            }}
            className="bg-emerald-600 dark:bg-emerald-500 p-6 rounded-3xl text-white flex flex-col items-center gap-3 shadow-lg shadow-emerald-600/20 dark:shadow-emerald-900/40"
          >
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <Zap className="w-6 h-6 fill-white" />
            </div>
            <span className="text-sm font-bold">SENTI Go</span>
          </motion.button>
          
          <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/profissionais")}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 p-6 rounded-3xl flex flex-col items-center gap-3 hover:border-emerald-500/30 transition-all shadow-sm"
          >
            <div className="w-12 h-12 bg-slate-100 dark:bg-white/5 rounded-2xl flex items-center justify-center">
              <Search className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Explorar</span>
          </motion.button>
        </section>

        {/* News Section */}
        <section className="space-y-6 pt-4">
          <div className="flex justify-between items-end px-2">
            <div>
              <h3 className="text-xl font-medium text-slate-800 dark:text-slate-200">Conteúdo para você</h3>
              <p className="text-sm text-slate-500">Artigos e dicas para seu bem-estar</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {news.slice(0, visibleNewsCount).map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <NewsCard 
                  {...item} 
                  onConnect={(id) => navigate(`/agendamento/${id}`)}
                  onViewProfile={(id) => navigate(`/terapeuta-perfil/${id}`)}
                />
              </motion.div>
            ))}
          </div>

          <div ref={observerTarget} className="h-4 w-full" />

          {visibleNewsCount < news.length && (
            <div className="flex justify-center pt-4">
              <button
                onClick={loadMoreNews}
                className="px-8 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl text-emerald-600 dark:text-emerald-400 font-bold text-sm shadow-sm hover:border-emerald-500/30 transition-all flex items-center gap-2"
              >
                Carregar mais artigos
                <ArrowRight className="w-4 h-4 rotate-90" />
              </button>
            </div>
          )}
        </section>
      </main>

      {/* Modal de Instruções de Notificação Bloqueada */}
      <AnimatePresence>
        {showDeniedModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeniedModal(false)}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 cursor-pointer"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-3xl p-6 w-full max-w-sm z-55 space-y-5 shadow-2xl text-slate-800 dark:text-slate-100"
              id="denied-notification-modal"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
                <h3 className="text-base font-bold font-serif italic text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-emerald-500" />
                  Como Ativar Notificações
                </h3>
                <button
                  onClick={() => setShowDeniedModal(false)}
                  className="text-slate-400 hover:text-slate-650 dark:hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                As notificações estão bloqueadas no seu navegador. Para permitir pílulas diárias e alertas de áudio, siga estes passos rápidos:
              </p>

              <div className="space-y-4 text-xs">
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold flex items-center justify-center shrink-0">1</div>
                  <p className="leading-normal pt-0.5 text-slate-600 dark:text-slate-350">
                    No topo da página, ao lado do endereço URL (barra de navegação), clique no ícone de <strong>Cadeado 🔒</strong> ou <strong>Configurações ⚙️</strong>.
                  </p>
                </div>

                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold flex items-center justify-center shrink-0">2</div>
                  <p className="leading-normal pt-0.5 text-slate-600 dark:text-slate-350">
                    Encontre a opção <strong>"Notificações"</strong> e altere para <strong>"Permitir"</strong> ou limpe a preferência atual.
                  </p>
                </div>

                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0">3</div>
                  <p className="leading-normal pt-0.5 font-bold text-emerald-600 dark:text-emerald-405">
                    Recarregue esta página para ativar as pílulas de sabedoria e apoio instantâneas!
                  </p>
                </div>
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  onClick={() => setShowDeniedModal(false)}
                  className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-2xl text-xs font-bold transition-all cursor-pointer text-center"
                >
                  Entendi
                </button>
                <button
                  onClick={() => {
                    setShowDeniedModal(false);
                    window.location.reload();
                  }}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer text-center shadow-md shadow-emerald-500/15"
                >
                  Recarregar 🔄
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
