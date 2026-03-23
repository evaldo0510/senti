import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Triagem from "./pages/Triagem";
import Respiracao from "./pages/Respiracao";
import ChatIARA from "./pages/ChatIARA";
import Direcionamento from "./pages/Direcionamento";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Profissionais from "./pages/Profissionais";
import Agendamento from "./pages/Agendamento";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/triagem" element={<Triagem />} />
        <Route path="/respiracao" element={<Respiracao />} />
        <Route path="/chat" element={<ChatIARA />} />
        <Route path="/direcionamento" element={<Direcionamento />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profissionais" element={<Profissionais />} />
        <Route path="/agendamento/:id" element={<Agendamento />} />
      </Routes>
    </Router>
  );
}

export default App;
