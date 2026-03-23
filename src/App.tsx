import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
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
import TerapeutaSetup from "./pages/TerapeutaSetup";
import TerapeutaCadastro from "./pages/TerapeutaCadastro";
import Atendimento from "./pages/Atendimento";
import Registro from "./pages/Registro";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPro />} />
        <Route path="/home" element={<Home />} />
        <Route path="/lead" element={<LeadForm />} />
        <Route path="/vendas-empresa" element={<VendasEmpresa />} />
        <Route path="/triagem" element={<Triagem />} />
        <Route path="/respiracao" element={<Respiracao />} />
        <Route path="/chat" element={<ChatIARA />} />
        <Route path="/direcionamento" element={<Direcionamento />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/terapeuta" element={<Terapeuta />} />
        <Route path="/empresa" element={<Empresa />} />
        <Route path="/prefeitura" element={<Prefeitura />} />
        <Route path="/profissionais" element={<Profissionais />} />
        <Route path="/agendamento/:id" element={<Agendamento />} />
        <Route path="/diario" element={<Diario />} />
        <Route path="/emergencia" element={<Emergencia />} />
        <Route path="/terapeuta-setup" element={<TerapeutaSetup />} />
        <Route path="/cadastro-terapeuta" element={<TerapeutaCadastro />} />
        <Route path="/atendimento/:appointmentId" element={<Atendimento />} />
        <Route path="/registro/:appointmentId" element={<Registro />} />
      </Routes>
    </Router>
  );
}

export default App;
