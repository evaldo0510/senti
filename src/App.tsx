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
import IARAChatBubble from "./components/IARAChatBubble";
import SOSButton from "./components/SOSButton";
import MobileDeviceWrapper from "./components/MobileDeviceWrapper";

import { ErrorBoundary } from "./components/ErrorBoundary";

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <PWAProvider>
          <Router>
            <Routes>
            <Route path="/" element={<LandingPro />} />
            <Route path="/home" element={<MobileDeviceWrapper><DashboardPaciente /></MobileDeviceWrapper>} />
            <Route path="/assinatura" element={<Subscription />} />
            <Route path="/reset" element={<MobileDeviceWrapper><Reset /></MobileDeviceWrapper>} />
            <Route path="/reset21" element={<Reset21 />} />
            <Route path="/reset-21/day/:dayId" element={<Reset21Day />} />
            <Route path="/reset-21/sales" element={<Reset21Sales />} />
            <Route path="/termos" element={<Terms />} />
            <Route path="/privacidade" element={<Privacy />} />
            <Route path="/seguranca" element={<Security />} />
            <Route path="/contato" element={<Contact />} />
            <Route path="/lead" element={<LeadForm />} />
            <Route path="/vendas-empresa" element={<VendasEmpresa />} />
            <Route path="/triagem" element={<MobileDeviceWrapper><Triagem /></MobileDeviceWrapper>} />
            <Route path="/respiracao" element={<MobileDeviceWrapper><Respiracao /></MobileDeviceWrapper>} />
            <Route path="/chat" element={<MobileDeviceWrapper><ChatIARA /></MobileDeviceWrapper>} />
            <Route path="/direcionamento" element={<Direcionamento />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/terapeuta" element={<Terapeuta />} />
            <Route path="/empresa" element={<Empresa />} />
            <Route path="/prefeitura" element={<Prefeitura />} />
            <Route path="/profissionais" element={<MobileDeviceWrapper><Profissionais /></MobileDeviceWrapper>} />
            <Route path="/agendamento/:id" element={<Agendamento />} />
            <Route path="/terapeuta-perfil/:id" element={<TerapeutaPerfil />} />
            <Route path="/diario" element={<MobileDeviceWrapper><Diario /></MobileDeviceWrapper>} />
            <Route path="/perfil" element={<MobileDeviceWrapper><Perfil /></MobileDeviceWrapper>} />
            <Route path="/gerenciar-dados" element={<GerenciamentoDados />} />
            <Route path="/emergencia" element={<MobileDeviceWrapper><Emergencia /></MobileDeviceWrapper>} />
            <Route path="/pronto-atendimento" element={<MobileDeviceWrapper><ProntoAtendimento /></MobileDeviceWrapper>} />
            <Route path="/terapeuta-setup" element={<TerapeutaSetup />} />
            <Route path="/live-iara" element={<MobileDeviceWrapper><LiveIARA /></MobileDeviceWrapper>} />
            <Route path="/clinica" element={<Clinica />} />
            <Route path="/hospital" element={<Hospital />} />
            <Route path="/atendimento/:appointmentId" element={<Atendimento />} />
            <Route path="/registro/:appointmentId" element={<Registro />} />
            <Route path="/terapeuta/paciente/:id" element={<ProntuarioPaciente />} />
          </Routes>
          <IARAChatBubble />
          <SOSButton />
        </Router>
      </PWAProvider>
    </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
