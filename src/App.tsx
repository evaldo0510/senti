import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { PWAProvider } from "./contexts/PWAContext";
import DashboardPaciente from "./pages/DashboardPaciente";
import LandingPro from "./pages/LandingPro";
import LeadForm from "./pages/LeadForm";
import VendasEmpresa from "./pages/VendasEmpresa";
import Triagem from "./pages/Triagem";
import Respiracao from "./pages/Respiracao";
import ChatIARA from "./pages/ChatIARA";
import Direcionamento from "./pages/Direcionamento";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Profissionais from "./pages/Profissionais";
import Agendamento from "./pages/Agendamento";
import Diario from "./pages/Diario";
import Terapeuta from "./pages/Terapeuta";
import Empresa from "./pages/Empresa";
import Prefeitura from "./pages/Prefeitura";
import Emergencia from "./pages/Emergencia";
import ProntoAtendimento from "./pages/ProntoAtendimento";
import TerapeutaSetup from "./pages/TerapeutaSetup";
import Atendimento from "./pages/Atendimento";
import Registro from "./pages/Registro";
import ProntuarioPaciente from "./pages/ProntuarioPaciente";
import TerapeutaPerfil from "./pages/TerapeutaPerfil";
import LiveIARA from "./pages/LiveIARA";
import Perfil from "./pages/Perfil";
import GerenciamentoDados from "./pages/GerenciamentoDados";
import Clinica from "./pages/Clinica";
import Hospital from "./pages/Hospital";
import Reset from "./pages/Reset";
import Reset21 from "./pages/Reset21";
import Reset21Day from "./pages/Reset21Day";
import Reset21Sales from "./pages/Reset21Sales";
import Subscription from "./pages/Subscription";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Security from "./pages/Security";
import Contact from "./pages/Contact";
import Sobre from "./pages/Sobre";
import Onboarding from "./pages/Onboarding";
import AppDashboard from "./pages/AppDashboard";
import IARAChatBubble from "./components/IARAChatBubble";
import SOSButton from "./components/SOSButton";
import MobileDeviceWrapper from "./components/MobileDeviceWrapper";
import NetworkStatusIndicator from "./components/NetworkStatusIndicator";
import { ProtectedRoute } from "./components/AuthProvider";

import { ErrorBoundary } from "./components/ErrorBoundary";

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <PWAProvider>
          <Router>
            <Routes>
            <Route path="/" element={<LandingPro />} />
            <Route path="/home" element={<ProtectedRoute><MobileDeviceWrapper><DashboardPaciente /></MobileDeviceWrapper></ProtectedRoute>} />
            <Route path="/assinatura" element={<Subscription />} />
            <Route path="/reset" element={<ProtectedRoute><MobileDeviceWrapper><Reset /></MobileDeviceWrapper></ProtectedRoute>} />
            <Route path="/reset21" element={<Reset21 />} />
            <Route path="/reset-21/day/:dayId" element={<Reset21Day />} />
            <Route path="/reset-21/sales" element={<Reset21Sales />} />
            <Route path="/termos" element={<Terms />} />
            <Route path="/privacidade" element={<Privacy />} />
            <Route path="/seguranca" element={<Security />} />
            <Route path="/contato" element={<Contact />} />
            <Route path="/sobre" element={<ProtectedRoute><MobileDeviceWrapper><Sobre /></MobileDeviceWrapper></ProtectedRoute>} />
            <Route path="/lead" element={<LeadForm />} />
            <Route path="/vendas-empresa" element={<VendasEmpresa />} />
            <Route path="/triagem" element={<ProtectedRoute><MobileDeviceWrapper><Triagem /></MobileDeviceWrapper></ProtectedRoute>} />
            <Route path="/respiracao" element={<ProtectedRoute><MobileDeviceWrapper><Respiracao /></MobileDeviceWrapper></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute><MobileDeviceWrapper><ChatIARA /></MobileDeviceWrapper></ProtectedRoute>} />
            <Route path="/direcionamento" element={<ProtectedRoute><Direcionamento /></ProtectedRoute>} />
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro" element={<Login />} />
            <Route path="/onboarding" element={<ProtectedRoute><MobileDeviceWrapper><Onboarding /></MobileDeviceWrapper></ProtectedRoute>} />
            <Route path="/app" element={<ProtectedRoute><MobileDeviceWrapper><AppDashboard /></MobileDeviceWrapper></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/terapeuta" element={<ProtectedRoute><Terapeuta /></ProtectedRoute>} />
            <Route path="/empresa" element={<ProtectedRoute><Empresa /></ProtectedRoute>} />
            <Route path="/prefeitura" element={<ProtectedRoute><Prefeitura /></ProtectedRoute>} />
            <Route path="/profissionais" element={<ProtectedRoute><MobileDeviceWrapper><Profissionais /></MobileDeviceWrapper></ProtectedRoute>} />
            <Route path="/agendamento/:id" element={<ProtectedRoute><Agendamento /></ProtectedRoute>} />
            <Route path="/terapeuta-perfil/:id" element={<ProtectedRoute><TerapeutaPerfil /></ProtectedRoute>} />
            <Route path="/diario" element={<ProtectedRoute><MobileDeviceWrapper><Diario /></MobileDeviceWrapper></ProtectedRoute>} />
            <Route path="/perfil" element={<ProtectedRoute><MobileDeviceWrapper><Perfil /></MobileDeviceWrapper></ProtectedRoute>} />
            <Route path="/gerenciar-dados" element={<ProtectedRoute><GerenciamentoDados /></ProtectedRoute>} />
            <Route path="/emergencia" element={<ProtectedRoute><MobileDeviceWrapper><Emergencia /></MobileDeviceWrapper></ProtectedRoute>} />
            <Route path="/pronto-atendimento" element={<ProtectedRoute><MobileDeviceWrapper><ProntoAtendimento /></MobileDeviceWrapper></ProtectedRoute>} />
            <Route path="/terapeuta-setup" element={<ProtectedRoute><TerapeutaSetup /></ProtectedRoute>} />
            <Route path="/live-iara" element={<ProtectedRoute><MobileDeviceWrapper><LiveIARA /></MobileDeviceWrapper></ProtectedRoute>} />
            <Route path="/clinica" element={<ProtectedRoute><Clinica /></ProtectedRoute>} />
            <Route path="/hospital" element={<ProtectedRoute><Hospital /></ProtectedRoute>} />
            <Route path="/atendimento/:appointmentId" element={<ProtectedRoute><Atendimento /></ProtectedRoute>} />
            <Route path="/registro/:appointmentId" element={<ProtectedRoute><Registro /></ProtectedRoute>} />
            <Route path="/terapeuta/paciente/:id" element={<ProtectedRoute><ProntuarioPaciente /></ProtectedRoute>} />
          </Routes>
          <IARAChatBubble />
          <SOSButton />
          <NetworkStatusIndicator />
        </Router>
      </PWAProvider>
    </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
