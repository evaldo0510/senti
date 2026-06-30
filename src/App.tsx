import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { PWAProvider } from "./contexts/PWAContext";
import { FeaturePreviewProvider } from "./context/FeaturePreviewContext";
import { FeaturePreviewDialog } from "./components/FeaturePreviewDialog";
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
import Moderador from "./pages/Moderador";
import Reset from "./pages/Reset";
import Reset21 from "./pages/Reset21";
import Reset21Day from "./pages/Reset21Day";
import Reset21Sales from "./pages/Reset21Sales";
import Subscription from "./pages/Subscription";
import SimulatedCheckout from "./pages/SimulatedCheckout";
import AdminDashboard from "./pages/AdminDashboard";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Security from "./pages/Security";
import Contact from "./pages/Contact";
import Sobre from "./pages/Sobre";
import Onboarding from "./pages/Onboarding";
import AppDashboard from "./pages/AppDashboard";
import Marketplace from "./pages/Marketplace";
import EspacoInspirar from "./pages/EspacoInspirar";
import DashboardInstitucional from "./pages/DashboardInstitucional";
import { TenantRoute } from "./components/TenantRoute";
import IARAChatBubble from "./components/IARAChatBubble";
import SOSButton from "./components/SOSButton";
import MobileDeviceWrapper from "./components/MobileDeviceWrapper";
import NetworkStatusIndicator from "./components/NetworkStatusIndicator";
import { ProtectedRoute, PremiumProtectedRoute } from "./components/AuthProvider";
import { AdminRoute } from "./components/AdminRoute";

import { ErrorBoundary } from "./components/ErrorBoundary";

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <PWAProvider>
          <FeaturePreviewProvider>
            <Router>
              <Routes>
                <Route path="/" element={<LandingPro />} />
                <Route path="/checkout/simulated" element={<ProtectedRoute><SimulatedCheckout /></ProtectedRoute>} />
                <Route path="/admin-dashboard" element={<AdminRoute><AdminDashboard defaultTab="senticore" /></AdminRoute>} />
                <Route path="/admin" element={<AdminRoute><AdminDashboard defaultTab="geral" /></AdminRoute>} />
                <Route path="/admin/users" element={<AdminRoute><AdminDashboard defaultTab="usuarios" /></AdminRoute>} />
                <Route path="/admin/settings" element={<AdminRoute><AdminDashboard defaultTab="config" /></AdminRoute>} />
                <Route path="/admin/organizations" element={<AdminRoute><AdminDashboard defaultTab="organizations" /></AdminRoute>} />
                <Route path="/admin/payments" element={<AdminRoute><AdminDashboard defaultTab="financeiro" /></AdminRoute>} />
                <Route path="/reset21" element={<Reset21 />} />
                <Route path="/reset-21/day/:dayId" element={<Reset21Day />} />
                <Route path="/reset-21/sales" element={<Reset21Sales />} />
                <Route path="/termos" element={<Terms />} />
                <Route path="/privacidade" element={<Privacy />} />
                <Route path="/seguranca" element={<Security />} />
                <Route path="/contato" element={<Contact />} />
                <Route path="/lead" element={<LeadForm />} />
                <Route path="/vendas-empresa" element={<VendasEmpresa />} />
                <Route path="/direcionamento" element={<ProtectedRoute><Direcionamento /></ProtectedRoute>} />
                <Route path="/login" element={<Login />} />
                <Route path="/cadastro" element={<Login />} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/terapeuta" element={<ProtectedRoute><Terapeuta /></ProtectedRoute>} />
                <Route path="/empresa" element={<ProtectedRoute><TenantRoute><Empresa /></TenantRoute></ProtectedRoute>} />
                <Route path="/prefeitura" element={<ProtectedRoute><TenantRoute><Prefeitura /></TenantRoute></ProtectedRoute>} />
                <Route path="/dashboard-institucional" element={<ProtectedRoute><TenantRoute requireAdmin><DashboardInstitucional /></TenantRoute></ProtectedRoute>} />
                <Route path="/agendamento/:id" element={<ProtectedRoute><Agendamento /></ProtectedRoute>} />
                <Route path="/terapeuta-perfil/:id" element={<ProtectedRoute><TerapeutaPerfil /></ProtectedRoute>} />
                <Route path="/gerenciar-dados" element={<ProtectedRoute><GerenciamentoDados /></ProtectedRoute>} />
                <Route path="/terapeuta-setup" element={<ProtectedRoute><TerapeutaSetup /></ProtectedRoute>} />
                <Route path="/clinica" element={<ProtectedRoute><Clinica /></ProtectedRoute>} />
                <Route path="/hospital" element={<ProtectedRoute><Hospital /></ProtectedRoute>} />
                <Route path="/moderador" element={<ProtectedRoute><Moderador /></ProtectedRoute>} />
                <Route path="/atendimento/:appointmentId" element={<ProtectedRoute><Atendimento /></ProtectedRoute>} />
                <Route path="/registro/:appointmentId" element={<ProtectedRoute><Registro /></ProtectedRoute>} />
                <Route path="/terapeuta/paciente/:id" element={<ProtectedRoute><ProntuarioPaciente /></ProtectedRoute>} />

                {/* Layout Route with Persistent Mobile Shell for Beautiful Page Transitions */}
                <Route element={<ProtectedRoute><MobileDeviceWrapper /></ProtectedRoute>}>
                  <Route path="/home" element={<PremiumProtectedRoute><DashboardPaciente /></PremiumProtectedRoute>} />
                  <Route path="/assinatura" element={<Subscription />} />
                  <Route path="/reset" element={<Reset />} />
                  <Route path="/sobre" element={<Sobre />} />
                  <Route path="/triagem" element={<Triagem />} />
                  <Route path="/respiracao" element={<PremiumProtectedRoute><Respiracao /></PremiumProtectedRoute>} />
                  <Route path="/chat" element={<PremiumProtectedRoute><ChatIARA /></PremiumProtectedRoute>} />
                  <Route path="/onboarding" element={<Onboarding />} />
                  <Route path="/app" element={<AppDashboard />} />
                  <Route path="/profissionais" element={<PremiumProtectedRoute><Profissionais /></PremiumProtectedRoute>} />
                  <Route path="/diario" element={<PremiumProtectedRoute><Diario /></PremiumProtectedRoute>} />
                  <Route path="/perfil" element={<Perfil />} />
                  <Route path="/emergencia" element={<Emergencia />} />
                  <Route path="/pronto-atendimento" element={<ProntoAtendimento />} />
                  <Route path="/marketplace" element={<Marketplace />} />
                  <Route path="/inspirar" element={<PremiumProtectedRoute><EspacoInspirar /></PremiumProtectedRoute>} />
                  <Route path="/live-iara" element={<LiveIARA />} />
                </Route>
              </Routes>
              <IARAChatBubble />
              <SOSButton />
              <NetworkStatusIndicator />
              <FeaturePreviewDialog />
            </Router>
          </FeaturePreviewProvider>
        </PWAProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
