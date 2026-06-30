import React, { useState, useEffect } from "react";
import { useAuth } from "../components/AuthProvider";
import { useNavigate } from "react-router-dom";
import { db } from "../services/firebase";
import { collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy, limit, setDoc } from "firebase/firestore";
import { UserProfile, UserType, Organization } from "../types";
import { organizationService } from "../services/organizationService";
import { userService } from "../services/userService";
import { PLANS } from "../services/paymentService";
import SentiCoreCommandCenter from "../components/SentiCoreCommandCenter";
import { 
  Users, 
  ShieldAlert, 
  Coins, 
  UserCheck, 
  Building, 
  Calendar, 
  Search, 
  Edit3, 
  Trash2, 
  CheckCircle, 
  X,
  Database,
  ArrowLeft,
  Settings,
  Activity,
  UserX,
  CreditCard,
  FileText,
  Bot
} from "lucide-react";

export default function AdminDashboard() {
  const { profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<"geral" | "usuarios" | "organizations" | "assinaturas" | "terapeutas" | "agendamentos" | "config" | "senticore" | "financeiro">("senticore");
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [appointmentsList, setAppointmentsList] = useState<any[]>([]);
  const [organizationsList, setOrganizationsList] = useState<Organization[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [planFilter, setPlanFilter] = useState<string>("all");

  // Estados Financeiros para a SPRINT 17
  const [paymentsList, setPaymentsList] = useState<any[]>([]);
  const [commissionsList, setCommissionsList] = useState<any[]>([]);
  const [payoutsList, setPayoutsList] = useState<any[]>([]);
  const [couponsList, setCouponsList] = useState<any[]>([]);

  // Estados de criação de cupom de desconto
  const [newCouponCode, setNewCouponCode] = useState("");
  const [newCouponDiscount, setNewCouponDiscount] = useState<number>(15);
  const [newCouponMaxUses, setNewCouponMaxUses] = useState<number>(100);
  const [newCouponValidUntil, setNewCouponValidUntil] = useState("2026-12-31");

  // Estado do Modal de Edição de Usuário
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [editRole, setEditRole] = useState<UserType>("usuario");
  const [editPlan, setEditPlan] = useState<"trial" | "premium" | "professional" | "enterprise">("trial");
  const [editStatus, setEditStatus] = useState<"trial" | "active" | "expired" | "cancelled">("trial");
  const [editTenantId, setEditTenantId] = useState<string>("");
  const [actionLoading, setActionLoading] = useState(false);

  // Estados para nova organização
  const [newOrgId, setNewOrgId] = useState("");
  const [newOrgName, setNewOrgName] = useState("");
  const [newOrgTipo, setNewOrgTipo] = useState<'prefeitura' | 'clinica' | 'empresa' | 'hospital' | 'outra'>("empresa");
  const [newOrgMaxUsers, setNewOrgMaxUsers] = useState<number>(500);
  const [newOrgEmail, setNewOrgEmail] = useState("");
  const [newOrgPhone, setNewOrgPhone] = useState("");
  const [newOrgDomain, setNewOrgDomain] = useState("");

  // Redireciona usuários não autorizados
  useEffect(() => {
    if (!authLoading) {
      if (!profile || (profile.tipo !== "admin" && profile.tipo !== "super_admin")) {
        navigate("/home", { replace: true });
      }
    }
  }, [profile, authLoading, navigate]);

  // Carrega dados reais do Firestore
  const loadAdminData = async () => {
    if (!profile || (profile.tipo !== "admin" && profile.tipo !== "super_admin")) {
      console.warn("User is not authorized as admin, skipping loadAdminData.");
      return;
    }
    setLoadingData(true);
    try {
      // Carrega usuários
      const usersSnap = await getDocs(collection(db, "users"));
      const usersData = usersSnap.docs.map(docSnap => ({
        ...docSnap.data()
      })) as UserProfile[];
      setUsersList(usersData);

      // Carrega agendamentos
      const appSnap = await getDocs(collection(db, "appointments"));
      const appData = appSnap.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      }));
      setAppointmentsList(appData);

      // Carrega Organizações (Tenants)
      const orgs = await organizationService.listOrganizations();
      setOrganizationsList(orgs);

      // Carrega Pagamentos
      try {
        const paySnap = await getDocs(collection(db, "payments"));
        const payData = paySnap.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
        setPaymentsList(payData);
      } catch (e) {
        console.warn("Payments collection not loaded yet:", e);
      }

      // Carrega Comissões
      try {
        const commSnap = await getDocs(collection(db, "commissions"));
        const commData = commSnap.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
        setCommissionsList(commData);
      } catch (e) {
        console.warn("Commissions collection not loaded yet:", e);
      }

      // Carrega Repasses (Payouts)
      try {
        const paySnap = await getDocs(collection(db, "payouts"));
        const payData = paySnap.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
        setPayoutsList(payData);
      } catch (e) {
        console.warn("Payouts collection not loaded yet:", e);
      }

      // Carrega Cupons
      try {
        const coupSnap = await getDocs(collection(db, "coupons"));
        const coupData = coupSnap.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
        setCouponsList(coupData);
      } catch (e) {
        console.warn("Coupons collection not loaded yet:", e);
      }

    } catch (error) {
      console.error("Erro ao carregar dados administrativos:", error);
    } finally {
      setLoadingData(false);
    }
  };

  // Criação de novos cupons no Firestore
  const handleCreateCoupon = async () => {
    if (!newCouponCode.trim()) {
      alert("Por favor, digite um código para o cupom.");
      return;
    }
    setActionLoading(true);
    try {
      const now = new Date();
      const couponId = newCouponCode.trim().toUpperCase();
      const newCoupon = {
        id: couponId,
        code: couponId,
        discountPercentage: Number(newCouponDiscount),
        active: true,
        maxUses: Number(newCouponMaxUses),
        currentUses: 0,
        validUntil: newCouponValidUntil,
        createdAt: now.toISOString()
      };

      await setDoc(doc(db, "coupons", couponId), newCoupon);
      alert(`Cupom ${couponId} criado com sucesso!`);
      setNewCouponCode("");
      
      // Recarrega dados
      const coupSnap = await getDocs(collection(db, "coupons"));
      setCouponsList(coupSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err: any) {
      console.error("Erro ao criar cupom:", err);
      alert("Erro ao salvar cupom: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Deleta cupom do Firestore
  const handleDeleteCoupon = async (id: string) => {
    if (!confirm("Tem certeza de que deseja remover este cupom?")) return;
    setActionLoading(true);
    try {
      await deleteDoc(doc(db, "coupons", id));
      alert("Cupom removido com sucesso.");
      setCouponsList(prev => prev.filter(c => c.id !== id));
    } catch (err: any) {
      console.error("Erro ao remover cupom:", err);
      alert("Erro ao excluir: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Popula dados de simulação
  const handlePopulateFinancialDemoData = async () => {
    setActionLoading(true);
    try {
      const now = new Date();
      const mockCoupons = [
        { id: "CUPOM10", code: "Senti10", discountPercentage: 10, active: true, maxUses: 100, currentUses: 12, validUntil: "2026-12-31", createdAt: now.toISOString() },
        { id: "FOUNDER100", code: "FOUNDER100", discountPercentage: 100, active: true, maxUses: 50, currentUses: 4, validUntil: "2026-12-31", createdAt: now.toISOString() },
        { id: "VIVERBEM20", code: "VIVERBEM20", discountPercentage: 20, active: true, maxUses: 200, currentUses: 35, validUntil: "2026-08-31", createdAt: now.toISOString() }
      ];

      for (const coupon of mockCoupons) {
        await setDoc(doc(db, "coupons", coupon.id), coupon);
      }

      const therapists = usersList.filter(u => u.tipo === "terapeuta");
      const regularUsers = usersList.filter(u => u.tipo === "usuario");

      if (regularUsers.length > 0) {
        for (let i = 0; i < Math.min(regularUsers.length, 5); i++) {
          const user = regularUsers[i];
          const payId = `PAY-DEMO-${i}`;
          await setDoc(doc(db, "payments", payId), {
            id: payId,
            userId: user.uid,
            amount: 39.90,
            status: "success",
            provider: "stripe",
            type: "subscription",
            createdAt: new Date(now.getTime() - i * 5 * 24 * 60 * 60 * 1000).toISOString()
          });
        }
      }

      if (therapists.length > 0) {
        for (let i = 0; i < Math.min(therapists.length, 3); i++) {
          const therapist = therapists[i];
          const commissionId = `COMM-DEMO-${i}`;
          const payoutId = `PAYOUT-DEMO-${i}`;

          await setDoc(doc(db, "commissions", commissionId), {
            id: commissionId,
            appointmentId: `APP-DEMO-${i}`,
            therapistId: therapist.uid,
            totalAmount: 150.00,
            commissionPercentage: 15,
            commissionAmount: 22.50,
            therapistAmount: 127.50,
            status: "pending",
            createdAt: now.toISOString()
          });

          await setDoc(doc(db, "payouts", payoutId), {
            id: payoutId,
            therapistId: therapist.uid,
            amount: 255.00,
            status: i % 2 === 0 ? "paid" : "pending",
            bankName: "Banco Central",
            bankAgency: "0001",
            bankAccount: "987654-3",
            pixKeyType: "email",
            pixKey: therapist.email || "pix@senti.com",
            paidAt: i % 2 === 0 ? now.toISOString() : "",
            createdAt: now.toISOString()
          });
        }
      }

      alert("Dados de simulação financeira criados com sucesso!");
      await loadAdminData();
    } catch (err: any) {
      console.error("Erro ao popular dados de simulação financeira:", err);
      alert("Erro ao criar dados no Firestore: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    if (profile && (profile.tipo === "admin" || profile.tipo === "super_admin")) {
      loadAdminData();
    }
  }, [profile]);

  if (authLoading || !profile || (profile.tipo !== "admin" && profile.tipo !== "super_admin")) {
    return (
      <div className="min-h-screen bg-[#fafaf5] flex items-center justify-center">
        <div className="text-center space-y-2">
          <Database className="w-8 h-8 text-emerald-500 animate-spin mx-auto" />
          <p className="text-slate-600 text-sm font-semibold">Autenticando privilégios administrativos...</p>
        </div>
      </div>
    );
  }

  // Cálculos de Métricas de Dashboard (baseado em dados reais carregados!)
  const totalRegistros = usersList.length;
  const totalPremium = usersList.filter(u => u.subscriptionStatus === "active" && u.subscriptionPlan === "premium").length;
  const totalProfessional = usersList.filter(u => u.subscriptionStatus === "active" && u.subscriptionPlan === "professional").length;
  const totalEnterprise = usersList.filter(u => u.subscriptionStatus === "active" && u.subscriptionPlan === "enterprise").length;
  const totalTherapists = usersList.filter(u => u.tipo === "terapeuta").length;
  const totalCompanies = usersList.filter(u => u.tipo === "empresa").length;
  const totalAppointments = appointmentsList.length;

  // Receita Mensal Recorrente Estimada (MRR)
  const estimatedMRR = 
    (totalPremium * 39.90) + 
    (totalProfessional * 99.90) + 
    (totalEnterprise * 499.90);

  // Filtragem de Usuários para tabelas
  const filteredUsers = usersList.filter(u => {
    const matchesSearch = 
      (u.nome || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
      (u.email || "").toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === "all" || u.tipo === roleFilter;
    const matchesPlan = planFilter === "all" || u.subscriptionPlan === planFilter;

    return matchesSearch && matchesRole && matchesPlan;
  });

  const handleOpenEdit = (user: UserProfile) => {
    setEditingUser(user);
    setEditRole(user.tipo);
    setEditPlan(user.subscriptionPlan || "trial");
    setEditStatus(user.subscriptionStatus || "trial");
    setEditTenantId(user.tenantId || "");
  };

  const handleSaveUserChanges = async () => {
    if (!editingUser) return;
    setActionLoading(true);

    try {
      const userRef = doc(db, "users", editingUser.uid);
      const updatePayload: Partial<UserProfile> = {
        tipo: editRole,
        subscriptionPlan: editPlan,
        subscriptionStatus: editStatus,
        tenantId: editTenantId || null
      };

      // Se ativou plano manualmente, preenche campos extras se vazios
      if (editStatus === "active" && editingUser.subscriptionStatus !== "active") {
        updatePayload.lastPayment = new Date().toISOString();
        const nextBill = new Date();
        nextBill.setMonth(nextBill.getMonth() + 1);
        updatePayload.nextBilling = nextBill.toISOString();
      }

      await updateDoc(userRef, updatePayload);
      
      // Atualiza lista localmente sem precisar recarregar tudo do Firestore
      setUsersList(prev => prev.map(u => u.uid === editingUser.uid ? { ...u, ...updatePayload } : u));
      setEditingUser(null);
    } catch (e) {
      console.error("Erro ao salvar alterações do usuário:", e);
      alert("Falha ao salvar alterações no banco de dados.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (uid: string) => {
    if (!window.confirm("Tem certeza que deseja excluir permanentemente este usuário? Esta ação é irreversível.")) return;
    try {
      await deleteDoc(doc(db, "users", uid));
      setUsersList(prev => prev.filter(u => u.uid !== uid));
    } catch (e) {
      console.error("Erro ao deletar usuário:", e);
      alert("Falha ao excluir usuário.");
    }
  };

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgId || !newOrgName) {
      alert("Por favor, preencha o ID e o Nome da organização.");
      return;
    }
    const sanitizedId = newOrgId.toLowerCase().trim().replace(/\s+/g, "-");
    
    setActionLoading(true);
    try {
      const created = await organizationService.createOrganization({
        id: sanitizedId,
        name: newOrgName,
        tipo: newOrgTipo,
        maxUsers: newOrgMaxUsers,
        contatoEmail: newOrgEmail || undefined,
        contatoTelefone: newOrgPhone || undefined,
        domain: newOrgDomain || undefined
      });
      setOrganizationsList(prev => [created, ...prev]);
      setNewOrgId("");
      setNewOrgName("");
      setNewOrgEmail("");
      setNewOrgPhone("");
      setNewOrgDomain("");
      alert("Organização criada com sucesso!");
    } catch (err) {
      console.error("Erro ao criar organização:", err);
      alert("Erro ao criar organização no Firestore.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleOrgActive = async (orgId: string, currentActive: boolean) => {
    try {
      await organizationService.updateOrganization(orgId, { active: !currentActive });
      setOrganizationsList(prev => prev.map(o => o.id === orgId ? { ...o, active: !currentActive } : o));
    } catch (err) {
      console.error("Erro ao alterar status da organização:", err);
    }
  };

  const handleRecalculateIndicators = async (orgId: string) => {
    setActionLoading(true);
    try {
      const updatedIndicadores = await organizationService.updateAggregatedIndicators(orgId);
      setOrganizationsList(prev => prev.map(o => o.id === orgId ? { ...o, indicadores: updatedIndicadores } : o));
      alert("Indicadores recalculados com sucesso para esta organização!");
    } catch (err) {
      console.error("Erro ao recalcular indicadores:", err);
      alert("Erro ao recalcular indicadores no Firestore.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafaf5] text-[#1a1a1a] flex flex-col md:flex-row">
      
      {/* Sidebar de Administração */}
      <div className="w-full md:w-64 bg-slate-900 text-white p-6 flex flex-col justify-between">
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center font-extrabold text-white text-lg">
              S
            </div>
            <div>
              <span className="font-extrabold tracking-tight text-sm block">SentiPae Admin</span>
              <span className="text-[10px] text-slate-400 font-bold block">Controle Institucional</span>
            </div>
          </div>

          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab("geral")}
              className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition ${
                activeTab === "geral" ? "bg-emerald-500 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Activity className="w-4 h-4" /> Geral & Métricas
            </button>

            <button
              onClick={() => setActiveTab("senticore")}
              className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition ${
                activeTab === "senticore" ? "bg-emerald-500 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Bot className="w-4 h-4" /> SentiCore OS Hub
            </button>

            <button
              onClick={() => setActiveTab("usuarios")}
              className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition ${
                activeTab === "usuarios" ? "bg-emerald-500 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Users className="w-4 h-4" /> Usuários Cadastrados
            </button>

            <button
              onClick={() => setActiveTab("organizations")}
              className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition ${
                activeTab === "organizations" ? "bg-emerald-500 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Building className="w-4 h-4" /> Organizações B2B (Tenants)
            </button>

            <button
              onClick={() => setActiveTab("assinaturas")}
              className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition ${
                activeTab === "assinaturas" ? "bg-emerald-500 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <CreditCard className="w-4 h-4" /> Assinaturas & Planos
            </button>

            <button
              onClick={() => setActiveTab("financeiro")}
              className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition ${
                activeTab === "financeiro" ? "bg-emerald-500 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
              id="admin-tab-financeiro"
            >
              <Coins className="w-4 h-4" /> Painel Financeiro
            </button>

            <button
              onClick={() => setActiveTab("terapeutas")}
              className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition ${
                activeTab === "terapeutas" ? "bg-emerald-500 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <UserCheck className="w-4 h-4" /> Terapeutas Credenciados
            </button>

            <button
              onClick={() => setActiveTab("agendamentos")}
              className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition ${
                activeTab === "agendamentos" ? "bg-emerald-500 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Calendar className="w-4 h-4" /> Agendamentos Gerais
            </button>

            <button
              onClick={() => setActiveTab("config")}
              className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition ${
                activeTab === "config" ? "bg-emerald-500 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Settings className="w-4 h-4" /> Configurações Gerais
            </button>
          </nav>
        </div>

        <button
          onClick={() => navigate("/home")}
          className="mt-12 w-full flex items-center justify-center gap-1.5 px-3 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs font-bold rounded-xl transition"
          id="exit-admin-btn"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Voltar ao Aplicativo
        </button>
      </div>

      {/* Conteúdo Principal do Painel */}
      <div className="flex-1 p-6 md:p-10 overflow-y-auto max-w-7xl mx-auto w-full">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Painel Administrativo</h1>
            <p className="text-xs text-slate-500 mt-1">Status do Sistema: <span className="text-emerald-500 font-bold">Operacional</span></p>
          </div>
          <button 
            onClick={loadAdminData}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-emerald-500/10 flex items-center gap-1.5"
            id="refresh-admin-btn"
          >
            <Database className="w-3.5 h-3.5" /> Recarregar Dados
          </button>
        </div>

        {loadingData ? (
          <div className="py-24 text-center space-y-2">
            <Database className="w-8 h-8 text-emerald-500 animate-spin mx-auto" />
            <p className="text-slate-500 text-xs font-semibold">Consultando coleções do Firestore...</p>
          </div>
        ) : (
          <>
            {/* TAB 1: GERAL & METRICAS */}
            {activeTab === "geral" && (
              <div className="space-y-8">
                {/* Cards de KPIs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm space-y-2">
                    <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider block">Receita Recorrente (MRR)</span>
                    <h2 className="text-2xl font-extrabold text-slate-900">
                      R$ {estimatedMRR.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </h2>
                    <span className="text-[10px] text-emerald-600 font-bold block">Assinaturas Ativas</span>
                  </div>

                  <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm space-y-2">
                    <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider block">Usuários Cadastrados</span>
                    <h2 className="text-2xl font-extrabold text-slate-900">{totalRegistros}</h2>
                    <span className="text-[10px] text-indigo-600 font-bold block">Total Registrados</span>
                  </div>

                  <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm space-y-2">
                    <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider block">Terapeutas Ativos</span>
                    <h2 className="text-2xl font-extrabold text-slate-900">{totalTherapists}</h2>
                    <span className="text-[10px] text-emerald-600 font-bold block">Terapeutas Cadastrados</span>
                  </div>

                  <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm space-y-2">
                    <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider block">Consultas Realizadas</span>
                    <h2 className="text-2xl font-extrabold text-slate-900">{totalAppointments}</h2>
                    <span className="text-[10px] text-purple-600 font-bold block">Agendamentos Clínicos</span>
                  </div>
                </div>

                {/* Subdivisões por planos */}
                <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm">
                  <h3 className="text-sm font-extrabold text-slate-800 mb-4 uppercase tracking-wider text-[10px]">Distribuição por Planos</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-black/5 text-center space-y-1">
                      <span className="text-slate-400 text-[10px] font-bold block">Plano Premium</span>
                      <p className="text-xl font-extrabold text-slate-800">{totalPremium}</p>
                      <span className="text-[9px] text-slate-500 block">R$ 39,90/mês</span>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-black/5 text-center space-y-1">
                      <span className="text-slate-400 text-[10px] font-bold block">Plano Professional (Terapeuta)</span>
                      <p className="text-xl font-extrabold text-slate-800">{totalProfessional}</p>
                      <span className="text-[9px] text-slate-500 block">R$ 99,90/mês</span>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-black/5 text-center space-y-1">
                      <span className="text-slate-400 text-[10px] font-bold block">Plano Enterprise</span>
                      <p className="text-xl font-extrabold text-slate-800">{totalEnterprise}</p>
                      <span className="text-[9px] text-slate-500 block">R$ 499,90/mês</span>
                    </div>
                  </div>
                </div>

                {/* Feedbacks recentes */}
                <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm">
                  <h3 className="text-sm font-extrabold text-slate-800 mb-4 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-emerald-500" /> Atividades Recentes do Servidor
                  </h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-emerald-50/50 rounded-xl text-xs text-slate-600 flex justify-between">
                      <span>Database listener estabelecido para <b>users</b></span>
                      <span className="text-[10px] text-slate-400 font-bold">Agora mesmo</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 flex justify-between">
                      <span>Integridade das regras de segurança carregadas</span>
                      <span className="text-[10px] text-slate-400 font-bold">Há 10 minutos</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: ORGANIZACOES B2B / TENANTS */}
            {activeTab === "organizations" && (
              <div className="space-y-6">
                {/* Criar Nova Organização */}
                <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm space-y-6">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">Cadastrar Nova Organização (Tenant B2B)</h3>
                    <p className="text-[10px] text-slate-400">Configure prefeituras, clínicas, hospitais ou empresas parceiras.</p>
                  </div>

                  <form onSubmit={handleCreateOrg} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">ID Único (Tenant ID)</label>
                      <input
                        type="text"
                        placeholder="ex: prefeitura-santo-andre"
                        value={newOrgId}
                        onChange={(e) => setNewOrgId(e.target.value)}
                        required
                        className="w-full px-3 py-2 bg-[#f5f5f0] rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Nome da Organização</label>
                      <input
                        type="text"
                        placeholder="ex: Prefeitura de Santo André"
                        value={newOrgName}
                        onChange={(e) => setNewOrgName(e.target.value)}
                        required
                        className="w-full px-3 py-2 bg-[#f5f5f0] rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Tipo</label>
                      <select
                        value={newOrgTipo}
                        onChange={(e) => setNewOrgTipo(e.target.value as any)}
                        className="w-full px-3 py-2 bg-[#f5f5f0] rounded-xl text-xs font-bold focus:outline-none cursor-pointer text-slate-800"
                      >
                        <option value="prefeitura">Prefeitura / Município</option>
                        <option value="empresa">Empresa (RH / Corporativo)</option>
                        <option value="clinica">Clínica</option>
                        <option value="hospital">Hospital / Pronto Atendimento</option>
                        <option value="outra">Outra Entidade</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Limite de Colaboradores</label>
                      <input
                        type="number"
                        placeholder="500"
                        value={newOrgMaxUsers}
                        onChange={(e) => setNewOrgMaxUsers(parseInt(e.target.value) || 0)}
                        required
                        className="w-full px-3 py-2 bg-[#f5f5f0] rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">E-mail de Contato</label>
                      <input
                        type="email"
                        placeholder="contato@organizacao.com"
                        value={newOrgEmail}
                        onChange={(e) => setNewOrgEmail(e.target.value)}
                        className="w-full px-3 py-2 bg-[#f5f5f0] rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Domínio de E-mail (ex: @santoandre.gov)</label>
                      <input
                        type="text"
                        placeholder="@santoandre.sp.gov.br"
                        value={newOrgDomain}
                        onChange={(e) => setNewOrgDomain(e.target.value)}
                        className="w-full px-3 py-2 bg-[#f5f5f0] rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-slate-800"
                      />
                    </div>

                    <div className="md:col-span-3 pt-2">
                      <button
                        type="submit"
                        disabled={actionLoading}
                        className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition disabled:opacity-50"
                      >
                        {actionLoading ? "Processando..." : "Criar Organização"}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Lista de Organizações */}
                <div className="bg-white rounded-3xl border border-black/5 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-black/5">
                    <h3 className="text-sm font-extrabold text-slate-900">Organizações Cadastradas</h3>
                    <p className="text-[10px] text-slate-400">Total de {organizationsList.length} tenants gerenciados no sistema.</p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-black/5 text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">
                          <th className="px-6 py-3">Organização / ID</th>
                          <th className="px-6 py-3">Tipo</th>
                          <th className="px-6 py-3">Domínio / Email</th>
                          <th className="px-6 py-3">Usuários Ativos / Limite</th>
                          <th className="px-6 py-3">Métricas Consolidadas (Anônimas)</th>
                          <th className="px-6 py-3">Status</th>
                          <th className="px-6 py-3 text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/5 text-xs text-slate-700">
                        {organizationsList.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="px-6 py-10 text-center text-slate-400">
                              Nenhuma organização cadastrada.
                            </td>
                          </tr>
                        ) : (
                          organizationsList.map(org => {
                            const linkedUsersCount = usersList.filter(u => u.tenantId === org.id).length;
                            return (
                              <tr key={org.id} className="hover:bg-slate-50/50 transition">
                                <td className="px-6 py-4">
                                  <div className="font-extrabold text-slate-900">{org.name}</div>
                                  <div className="text-[10px] text-slate-400 font-mono">{org.id}</div>
                                </td>
                                <td className="px-6 py-4 uppercase text-[10px] font-bold">
                                  <span className={`px-2 py-0.5 rounded-full ${
                                    org.tipo === 'prefeitura' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                                    org.tipo === 'empresa' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                    org.tipo === 'clinica' ? 'bg-purple-50 text-purple-600 border border-purple-100' :
                                    org.tipo === 'hospital' ? 'bg-red-50 text-red-600 border border-red-100' :
                                    'bg-slate-50 text-slate-600'
                                  }`}>
                                    {org.tipo}
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  <div>{org.contatoEmail || "Sem email"}</div>
                                  <div className="text-[10px] text-slate-400 font-mono">{org.domain || "Sem domínio de auto-reg"}</div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="font-bold">{linkedUsersCount} / {org.maxUsers}</div>
                                  <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1">
                                    <div 
                                      className="h-full bg-emerald-500 rounded-full" 
                                      style={{ width: `${Math.min(100, (linkedUsersCount / org.maxUsers) * 100)}%` }}
                                    ></div>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px]">
                                    <div><span className="text-slate-400">Consultas:</span> <span className="font-bold text-slate-800">{org.indicadores?.totalConsultas || 0}</span></div>
                                    <div><span className="text-slate-400">Humor Médio:</span> <span className="font-bold text-slate-800">{org.indicadores?.humorMedio || 7.0}/10</span></div>
                                    <div><span className="text-slate-400">Estresse:</span> <span className="font-bold text-slate-800">{org.indicadores?.nivelEstresse || 3.0}/10</span></div>
                                    <div><span className="text-slate-400">IARA:</span> <span className="font-bold text-slate-800">{org.indicadores?.totalMensagensIara || 0} msgs</span></div>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <button
                                    onClick={() => handleToggleOrgActive(org.id, org.active)}
                                    className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border transition ${
                                      org.active 
                                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100' 
                                        : 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100'
                                    }`}
                                  >
                                    {org.active ? "ATIVO" : "INATIVO"}
                                  </button>
                                </td>
                                <td className="px-6 py-4 text-right space-x-1">
                                  <button
                                    onClick={() => handleRecalculateIndicators(org.id)}
                                    title="Recalcular Indicadores Consolidados"
                                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[10px] font-bold transition"
                                  >
                                    Recalcular
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: ROSTER DE USUARIOS */}
            {activeTab === "usuarios" && (
              <div className="space-y-6">
                {/* Filtros e Busca */}
                <div className="flex flex-col sm:flex-row gap-4 justify-between bg-white p-4 rounded-3xl border border-black/5 shadow-sm">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Buscar por nome ou e-mail..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#f5f5f0] focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-xs font-semibold"
                    />
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  </div>

                  <div className="flex gap-2">
                    <select
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                      className="px-3 py-2 bg-[#f5f5f0] rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/30 cursor-pointer"
                    >
                      <option value="all">Todas as Roles</option>
                      <option value="usuario">Paciente</option>
                      <option value="terapeuta">Terapeuta</option>
                      <option value="clinica">Clínica</option>
                      <option value="empresa">Empresa</option>
                      <option value="prefeitura">Prefeitura</option>
                      <option value="moderador">Moderador</option>
                      <option value="admin">Administrador</option>
                    </select>

                    <select
                      value={planFilter}
                      onChange={(e) => setPlanFilter(e.target.value)}
                      className="px-3 py-2 bg-[#f5f5f0] rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/30 cursor-pointer"
                    >
                      <option value="all">Todos os Planos</option>
                      <option value="trial">Trial</option>
                      <option value="premium">Premium</option>
                      <option value="professional">Professional</option>
                      <option value="enterprise">Enterprise</option>
                    </select>
                  </div>
                </div>

                {/* Tabela de Usuários */}
                <div className="bg-white rounded-3xl border border-black/5 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-black/5 text-slate-400 font-extrabold uppercase text-[9px] tracking-wider">
                          <th className="p-4">Nome</th>
                          <th className="p-4">Email</th>
                          <th className="p-4">Função / Role</th>
                          <th className="p-4">Plano</th>
                          <th className="p-4">Status de Assinatura</th>
                          <th className="p-4 text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/5">
                        {filteredUsers.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="p-8 text-center text-xs text-slate-400 font-bold">Nenhum usuário encontrado com as configurações de filtros aplicadas.</td>
                          </tr>
                        ) : (
                          filteredUsers.map((user) => (
                            <tr key={user.uid} className="hover:bg-slate-50 text-xs">
                              <td className="p-4 font-bold text-slate-800">{user.nome}</td>
                              <td className="p-4 text-slate-500">{user.email}</td>
                              <td className="p-4">
                                <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[9px] ${
                                  user.tipo === "admin" || user.tipo === "super_admin" 
                                    ? "bg-red-100 text-red-800"
                                    : user.tipo === "terapeuta"
                                    ? "bg-blue-100 text-blue-800"
                                    : user.tipo === "empresa"
                                    ? "bg-purple-100 text-purple-800"
                                    : "bg-slate-100 text-slate-700"
                                }`}>
                                  {user.tipo}
                                </span>
                              </td>
                              <td className="p-4 font-semibold uppercase text-slate-600">
                                {user.subscriptionPlan || "trial"}
                              </td>
                              <td className="p-4">
                                <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[9px] ${
                                  user.subscriptionStatus === "active"
                                    ? "bg-emerald-150 text-emerald-800"
                                    : user.subscriptionStatus === "trial"
                                    ? "bg-yellow-150 text-yellow-800"
                                    : "bg-red-150 text-red-800"
                                }`}>
                                  {user.subscriptionStatus || "trial"}
                                </span>
                              </td>
                              <td className="p-4 text-right space-x-1">
                                <button
                                  onClick={() => handleOpenEdit(user)}
                                  className="p-1.5 bg-slate-100 hover:bg-emerald-100 text-slate-600 hover:text-emerald-700 rounded-lg transition"
                                  title="Editar Usuário"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(user.uid)}
                                  className="p-1.5 bg-slate-100 hover:bg-red-100 text-slate-600 hover:text-red-700 rounded-lg transition"
                                  title="Excluir Usuário"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: ASSINATURAS */}
            {activeTab === "assinaturas" && (
              <div className="bg-white rounded-3xl border border-black/5 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-black/5">
                  <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider text-[11px]">Gerenciamento de Assinaturas Ativas</h3>
                  <p className="text-xs text-slate-400 mt-1">Lista de todos os assinantes pagantes reais registrados no sistema.</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-black/5 text-slate-400 font-extrabold uppercase text-[9px] tracking-wider">
                        <th className="p-4">Usuário</th>
                        <th className="p-4">Plano</th>
                        <th className="p-4">Provedor</th>
                        <th className="p-4">Último Pagamento</th>
                        <th className="p-4">Próxima Cobrança</th>
                        <th className="p-4">Identificador da Assinatura</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5">
                      {usersList.filter(u => u.subscriptionStatus === "active").length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-xs text-slate-400 font-bold">Nenhuma assinatura ativa encontrada no Firestore no momento.</td>
                        </tr>
                      ) : (
                        usersList.filter(u => u.subscriptionStatus === "active").map((user) => (
                          <tr key={user.uid} className="hover:bg-slate-50 text-xs">
                            <td className="p-4">
                              <div className="font-bold text-slate-800">{user.nome}</div>
                              <div className="text-[10px] text-slate-400">{user.email}</div>
                            </td>
                            <td className="p-4">
                              <span className="font-extrabold uppercase text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                                {user.subscriptionPlan}
                              </span>
                            </td>
                            <td className="p-4 font-semibold uppercase text-slate-500">
                              {user.paymentProvider || "stripe"}
                            </td>
                            <td className="p-4 text-slate-600">
                              {user.lastPayment ? new Date(user.lastPayment).toLocaleDateString("pt-BR") : "N/A"}
                            </td>
                            <td className="p-4 text-slate-600">
                              {user.nextBilling ? new Date(user.nextBilling).toLocaleDateString("pt-BR") : "N/A"}
                            </td>
                            <td className="p-4 font-mono text-[10px] text-slate-500">{user.subscriptionId || "N/A"}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 3.5: PAINEL FINANCEIRO */}
            {activeTab === "financeiro" && (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border border-black/5 shadow-sm">
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                      <Coins className="w-5 h-5 text-emerald-500" /> Painel Financeiro SentiPae
                    </h3>
                    <p className="text-xs text-slate-500">Monitoramento em tempo real de receitas, splits, repasses e cupons de desconto do ecossistema.</p>
                  </div>
                  <button
                    onClick={handlePopulateFinancialDemoData}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5"
                    id="populate-financial-demo-btn"
                  >
                    <Coins className="w-3.5 h-3.5 text-emerald-400" /> Carregar Dados de Demonstração
                  </button>
                </div>

                {/* Bento Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {/* MRR Estimado */}
                  <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">MRR Estimado (Planos)</span>
                      <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg"><Coins className="w-4 h-4" /></div>
                    </div>
                    <div className="mt-4">
                      <span className="text-2xl font-black text-slate-900">R$ {estimatedMRR.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                      <span className="text-[10px] text-slate-400 block mt-1">Baseado em assinantes ativos</span>
                    </div>
                  </div>

                  {/* Receita Realizada */}
                  <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Receita Realizada (Ledger)</span>
                      <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg"><CreditCard className="w-4 h-4" /></div>
                    </div>
                    <div className="mt-4">
                      <span className="text-2xl font-black text-slate-900">
                        R$ {paymentsList.filter(p => p.status === "success").reduce((acc, p) => acc + (p.amount || 0), 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-1">{paymentsList.filter(p => p.status === "success").length} pagamentos confirmados</span>
                    </div>
                  </div>

                  {/* Comissões SentiPae */}
                  <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Comissão SentiPae (15%)</span>
                      <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg"><Activity className="w-4 h-4" /></div>
                    </div>
                    <div className="mt-4">
                      <span className="text-2xl font-black text-slate-900">
                        R$ {commissionsList.reduce((acc, c) => acc + (c.commissionAmount || 0), 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-1">Split de agendamentos retido</span>
                    </div>
                  </div>

                  {/* Custos Operacionais */}
                  <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Custos Operacionais Est.</span>
                      <div className="p-1.5 bg-red-50 text-red-600 rounded-lg"><ShieldAlert className="w-4 h-4" /></div>
                    </div>
                    <div className="mt-4">
                      <span className="text-2xl font-black text-red-600">
                        R$ {((usersList.length * 0.15) + (paymentsList.length * 1.5)).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-1">API Gemini e servidores sandbox</span>
                    </div>
                  </div>
                </div>

                {/* Sub-grid: Histórico de Transações e Administração de Cupons */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Histórico Ledger */}
                  <div className="lg:col-span-2 bg-white rounded-3xl border border-black/5 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-black/5">
                      <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">Histórico de Transações Sandbox / Reais</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">Fluxo real e sandbox processados via Stripe e Mercado Pago.</p>
                    </div>
                    <div className="overflow-x-auto flex-1">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-black/5 text-slate-400 font-extrabold uppercase text-[9px] tracking-wider">
                            <th className="p-4">Identificador</th>
                            <th className="p-4">Método</th>
                            <th className="p-4">Tipo</th>
                            <th className="p-4">Data</th>
                            <th className="p-4 text-right">Valor</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-black/5 text-xs">
                          {paymentsList.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="p-8 text-center text-xs text-slate-400 font-bold">Nenhum pagamento registrado no Firestore. Clique em "Carregar Dados de Demonstração".</td>
                            </tr>
                          ) : (
                            paymentsList.map((pay) => (
                              <tr key={pay.id} className="hover:bg-slate-50">
                                <td className="p-4 font-mono text-[10px] text-slate-500">{pay.id}</td>
                                <td className="p-4 uppercase font-bold text-slate-600">{pay.provider}</td>
                                <td className="p-4 font-medium text-slate-500">{pay.type === 'subscription' ? 'Assinatura' : 'Consulta'}</td>
                                <td className="p-4 text-slate-400">{pay.createdAt ? new Date(pay.createdAt).toLocaleDateString("pt-BR") : "N/A"}</td>
                                <td className="p-4 text-right font-black text-slate-800">R$ {pay.amount?.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Gerenciamento de Cupons */}
                  <div className="bg-white rounded-3xl border border-black/5 shadow-sm p-6 space-y-6 flex flex-col justify-between">
                    <div>
                      <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">Gestão de Cupons Promocionais</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">Crie e ative cupons de desconto para alavancar conversão de assinantes.</p>

                      <div className="mt-4 space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <div>
                          <label className="block text-[9px] font-extrabold text-slate-500 uppercase mb-1">Código do Cupom</label>
                          <input
                            type="text"
                            placeholder="Ex: SENTI15"
                            value={newCouponCode}
                            onChange={(e) => setNewCouponCode(e.target.value)}
                            className="w-full px-3 py-2 border border-black/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs font-bold placeholder-slate-300"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[9px] font-extrabold text-slate-500 uppercase mb-1">Desconto (%)</label>
                            <input
                              type="number"
                              value={newCouponDiscount}
                              onChange={(e) => setNewCouponDiscount(Number(e.target.value))}
                              className="w-full px-3 py-2 border border-black/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs font-semibold"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-extrabold text-slate-500 uppercase mb-1">Limite Usos</label>
                            <input
                              type="number"
                              value={newCouponMaxUses}
                              onChange={(e) => setNewCouponMaxUses(Number(e.target.value))}
                              className="w-full px-3 py-2 border border-black/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs font-semibold"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[9px] font-extrabold text-slate-500 uppercase mb-1">Validade</label>
                          <input
                            type="date"
                            value={newCouponValidUntil}
                            onChange={(e) => setNewCouponValidUntil(e.target.value)}
                            className="w-full px-3 py-2 border border-black/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs font-semibold"
                          />
                        </div>
                        <button
                          onClick={handleCreateCoupon}
                          className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition shadow-md shadow-emerald-500/10"
                        >
                          Ativar Novo Cupom
                        </button>
                      </div>
                    </div>

                    <div className="border-t border-black/5 pt-4">
                      <h5 className="font-bold text-[10px] text-slate-400 uppercase tracking-wider mb-2">Cupons Ativos</h5>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {couponsList.length === 0 ? (
                          <p className="text-[11px] text-slate-400 italic font-semibold">Nenhum cupom ativo cadastrado.</p>
                        ) : (
                          couponsList.map((cupom) => (
                            <div key={cupom.id} className="flex justify-between items-center bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-xs">
                              <div>
                                <span className="font-extrabold text-slate-800">{cupom.code}</span>
                                <span className="text-[10px] text-emerald-600 font-black ml-2 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">-{cupom.discountPercentage}%</span>
                                <div className="text-[9px] text-slate-400 mt-0.5">Validade: {new Date(cupom.validUntil).toLocaleDateString("pt-BR")}</div>
                              </div>
                              <button
                                onClick={() => handleDeleteCoupon(cupom.id)}
                                className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Splits & Repasses */}
                <div className="bg-white rounded-3xl border border-black/5 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-black/5">
                    <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">Histórico de Splits de Marketplace & Repasses a Profissionais</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">Retenção automática de 15% do SentiPae com repasse seguro aos profissionais credenciados.</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-black/5 text-slate-400 font-extrabold uppercase text-[9px] tracking-wider">
                          <th className="p-4">Profissional</th>
                          <th className="p-4">Banco / Pix de Destino</th>
                          <th className="p-4">Valor Bruto</th>
                          <th className="p-4">Taxa SentiPae (15%)</th>
                          <th className="p-4 font-black">Repasse Líquido</th>
                          <th className="p-4">Status</th>
                          <th className="p-4 text-right">Ação</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/5 text-xs">
                        {payoutsList.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="p-8 text-center text-xs text-slate-400 font-bold">Nenhum repasse registrado no ledger.</td>
                          </tr>
                        ) : (
                          payoutsList.map((payout) => {
                            const therapist = usersList.find(u => u.uid === payout.therapistId);
                            return (
                              <tr key={payout.id} className="hover:bg-slate-50">
                                <td className="p-4">
                                  <div className="font-bold text-slate-800">{therapist?.nome || "Terapeuta Credenciado"}</div>
                                  <div className="text-[9px] text-slate-400">{therapist?.email || payout.therapistId}</div>
                                </td>
                                <td className="p-4 font-mono text-[10px] text-slate-500">
                                  <div>{payout.bankName} (Ag: {payout.bankAgency} C/C: {payout.bankAccount})</div>
                                  <div className="text-emerald-600 font-bold mt-0.5">Pix: {payout.pixKey}</div>
                                </td>
                                <td className="p-4 text-slate-600">R$ {(payout.amount / 0.85).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
                                <td className="p-4 text-amber-600 font-semibold">R$ {((payout.amount / 0.85) * 0.15).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
                                <td className="p-4 font-black text-slate-900">R$ {payout.amount?.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
                                <td className="p-4">
                                  <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wider ${
                                    payout.status === 'paid'
                                      ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                      : "bg-amber-50 text-amber-700 border-amber-100"
                                  }`}>
                                    {payout.status === 'paid' ? "Pago" : "Pendente"}
                                  </span>
                                </td>
                                <td className="p-4 text-right">
                                  {payout.status !== "paid" && (
                                    <button
                                      onClick={async () => {
                                        await updateDoc(doc(db, "payouts", payout.id), { status: "paid", paidAt: new Date().toISOString() });
                                        alert("Repasse liquidado com sucesso!");
                                        await loadAdminData();
                                      }}
                                      className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-extrabold rounded-lg transition"
                                    >
                                      Liquidar Repasse
                                    </button>
                                  )}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: TERAPEUTAS */}
            {activeTab === "terapeutas" && (
              <div className="bg-white rounded-3xl border border-black/5 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-black/5">
                  <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider text-[11px]">Lista de Terapeutas Credenciados</h3>
                  <p className="text-xs text-slate-400 mt-1">Gestão de credenciais de terapeutas reais cadastrados para consultas.</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-black/5 text-slate-400 font-extrabold uppercase text-[9px] tracking-wider">
                        <th className="p-4">Terapeuta</th>
                        <th className="p-4">Especialidade</th>
                        <th className="p-4">Valor Consulta</th>
                        <th className="p-4">Biografia</th>
                        <th className="p-4">Status de Validação</th>
                        <th className="p-4 text-right">Avaliações / Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5">
                      {usersList.filter(u => u.tipo === "terapeuta").length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-xs text-slate-400 font-bold">Nenhum terapeuta credenciado encontrado no momento.</td>
                        </tr>
                      ) : (
                        usersList.filter(u => u.tipo === "terapeuta").map((user) => (
                          <tr key={user.uid} className="hover:bg-slate-50 text-xs">
                            <td className="p-4">
                              <div className="font-bold text-slate-800">{user.nome}</div>
                              <div className="text-[10px] text-slate-400">{user.email}</div>
                            </td>
                            <td className="p-4 text-slate-600">
                              {user.especialidades && user.especialidades.length > 0 ? user.especialidades.join(", ") : "Geral"}
                            </td>
                            <td className="p-4 font-bold text-slate-700">
                              R$ {user.preco ? user.preco.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) : "Grátis"}
                            </td>
                            <td className="p-4 text-slate-500 max-w-xs truncate">{user.biografia || "Sem biografia cadastrada."}</td>
                            <td className="p-4">
                              <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wider ${
                                user.validationStatus === 'active' || user.validationStatus === 'approved' || !user.validationStatus
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : user.validationStatus === 'pending_approval'
                                  ? "bg-amber-50 text-amber-700 border-amber-200"
                                  : user.validationStatus === 'under_review'
                                  ? "bg-blue-50 text-blue-700 border-blue-200"
                                  : "bg-red-50 text-red-700 border-red-200"
                              }`}>
                                {user.validationStatus === 'pending_approval' ? "Pendente" :
                                 user.validationStatus === 'under_review' ? "Em Análise" :
                                 user.validationStatus === 'approved' ? "Aprovado" :
                                 user.validationStatus === 'active' ? "Ativo" :
                                 user.validationStatus === 'suspended' ? "Suspenso" : "Ativo (Legado)"}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              <div className="mb-2">
                                <span className="font-bold text-amber-500">★ {user.rating || "5.0"}</span>
                                <span className="text-slate-400 text-[10px] block">({user.reviewCount || 0} reviews)</span>
                              </div>
                              <div className="flex justify-end">
                                <select 
                                  value={user.validationStatus || 'active'}
                                  onChange={async (e) => {
                                    const newStatus = e.target.value as any;
                                    await userService.updateProfile(user.uid, { validationStatus: newStatus });
                                    const updatedList = usersList.map(u => u.uid === user.uid ? { ...u, validationStatus: newStatus } : u);
                                    setUsersList(updatedList);
                                  }}
                                  className="text-[10px] bg-white border border-slate-200 rounded px-1.5 py-1 font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                >
                                  <option value="pending_approval">Pendente</option>
                                  <option value="under_review">Em Análise</option>
                                  <option value="approved">Aprovado</option>
                                  <option value="active">Ativo na Rede</option>
                                  <option value="suspended">Suspenso</option>
                                </select>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 5: AGENDAMENTOS */}
            {activeTab === "agendamentos" && (
              <div className="bg-white rounded-3xl border border-black/5 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-black/5">
                  <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider text-[11px]">Agendamentos Clínicos Gerais</h3>
                  <p className="text-xs text-slate-400 mt-1">Histórico de todas as consultas agendadas entre pacientes e terapeutas.</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-black/5 text-slate-400 font-extrabold uppercase text-[9px] tracking-wider">
                        <th className="p-4">Data/Hora</th>
                        <th className="p-4">Paciente (ID)</th>
                        <th className="p-4">Terapeuta (ID)</th>
                        <th className="p-4">Canal</th>
                        <th className="p-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5">
                      {appointmentsList.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-xs text-slate-400 font-bold">Nenhum agendamento de consulta encontrado.</td>
                        </tr>
                      ) : (
                        appointmentsList.map((app) => (
                          <tr key={app.id} className="hover:bg-slate-50 text-xs">
                            <td className="p-4 font-bold text-slate-700">
                              {app.date ? new Date(app.date).toLocaleString("pt-BR") : "N/A"}
                            </td>
                            <td className="p-4 text-slate-600 font-mono text-[10px]">
                              {app.patientName || app.patientId}
                            </td>
                            <td className="p-4 text-slate-600 font-mono text-[10px]">
                              {app.therapistName || app.therapistId}
                            </td>
                            <td className="p-4 text-slate-500 uppercase">{app.type || "online"}</td>
                            <td className="p-4">
                              <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[9px] ${
                                app.status === "completed"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : app.status === "confirmed"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}>
                                {app.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 6: CONFIGURACOES */}
            {activeTab === "config" && (
              <div className="bg-white rounded-3xl p-6 border border-black/5 shadow-sm max-w-2xl space-y-6">
                <div>
                  <h3 className="font-bold text-sm text-slate-800">Parâmetros Globais do Sistema</h3>
                  <p className="text-xs text-slate-400 mt-1">Configurações para controle de recursos premium, chaves de API e períodos de renovação.</p>
                </div>

                <div className="space-y-4 pt-4 border-t border-black/5">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                    <div>
                      <span className="font-bold text-xs text-slate-700 block">Tempo de Trial (Período de Experiência)</span>
                      <span className="text-[10px] text-slate-400">Padrão: 7 dias do cadastro inicial</span>
                    </div>
                    <span className="font-extrabold text-xs text-emerald-600">7 Dias</span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                    <div>
                      <span className="font-bold text-xs text-slate-700 block">Prevenção de Duplicidade de Chaves</span>
                      <span className="text-[10px] text-slate-400">Verificação ativa no array mapping do dashboard de pacientes</span>
                    </div>
                    <span className="font-extrabold text-xs text-emerald-600">Ativo</span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                    <div>
                      <span className="font-bold text-xs text-slate-700 block">Autenticação Estrita Administrativa</span>
                      <span className="text-[10px] text-slate-400">Filtro de visualização com validação no Firestore local</span>
                    </div>
                    <span className="font-extrabold text-xs text-emerald-600">Ativo</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "senticore" && (
              <SentiCoreCommandCenter />
            )}
          </>
        )}
      </div>

      {/* Modal de Edição de Usuário */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-black/5 shadow-2xl space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Editar Usuário</h3>
                <p className="text-[10px] text-slate-400">{editingUser.nome} ({editingUser.email})</p>
              </div>
              <button 
                onClick={() => setEditingUser(null)}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">Função / Role</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as UserType)}
                  className="w-full px-3 py-2 bg-[#f5f5f0] rounded-xl text-xs font-bold focus:outline-none cursor-pointer"
                >
                  <option value="usuario">Paciente</option>
                  <option value="terapeuta">Terapeuta</option>
                  <option value="clinica">Clínica</option>
                  <option value="empresa">Empresa</option>
                  <option value="prefeitura">Prefeitura</option>
                  <option value="moderador">Moderador</option>
                  <option value="admin">Administrador</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">Plano de Assinatura</label>
                <select
                  value={editPlan}
                  onChange={(e) => setEditPlan(e.target.value as any)}
                  className="w-full px-3 py-2 bg-[#f5f5f0] rounded-xl text-xs font-bold focus:outline-none cursor-pointer"
                >
                  <option value="trial">Trial (7 dias)</option>
                  <option value="premium">Premium (R$ 39,90)</option>
                  <option value="professional">Professional (R$ 99,90)</option>
                  <option value="enterprise">Institucional (Orçamento)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">Status da Assinatura</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as any)}
                  className="w-full px-3 py-2 bg-[#f5f5f0] rounded-xl text-xs font-bold focus:outline-none cursor-pointer"
                >
                  <option value="trial">Trial</option>
                  <option value="active">Ativo (Acesso Liberado)</option>
                  <option value="expired">Expirado (Bloqueado)</option>
                  <option value="cancelled">Cancelado (Bloqueado)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">Organização Vinculada (Tenant ID)</label>
                <select
                  value={editTenantId}
                  onChange={(e) => setEditTenantId(e.target.value)}
                  className="w-full px-3 py-2 bg-[#f5f5f0] rounded-xl text-xs font-bold focus:outline-none cursor-pointer text-slate-800"
                >
                  <option value="">Nenhuma (Público B2C / Independente)</option>
                  {organizationsList.map(org => (
                    <option key={org.id} value={org.id}>{org.name} ({org.tipo})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setEditingUser(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveUserChanges}
                disabled={actionLoading}
                className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition disabled:opacity-50"
              >
                {actionLoading ? "Salvando..." : "Salvar Alterações"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
