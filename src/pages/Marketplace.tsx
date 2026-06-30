import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  ShoppingBag, 
  Sparkles, 
  Lock, 
  ArrowLeft, 
  Crown, 
  Heart, 
  Gift, 
  BookOpen, 
  Video, 
  Calendar, 
  Plus, 
  Search, 
  CheckCircle, 
  FileText, 
  DollarSign, 
  User, 
  Tag,
  Star
} from "lucide-react";
import { useAuth } from "../components/AuthProvider";
import { marketplaceService, MarketplaceItem } from "../services/marketplaceService";
import { cn } from "../lib/utils";

export default function Marketplace() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("Todos");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [purchasedItemIds, setPurchasedItemIds] = useState<string[]>([]);
  
  // Purchase Modal States
  const [selectedItemForPurchase, setSelectedItemForPurchase] = useState<MarketplaceItem | null>(null);
  const [isPurchasing, setIsPurchasing] = useState<boolean>(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState<boolean>(false);

  // Creation Modal States (For therapists/creators)
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newCategory, setNewCategory] = useState<"Programas" | "Cursos" | "Livros" | "Eventos" | "Materiais">("Cursos");
  const [newPrice, setNewPrice] = useState("");
  const [newDuration, setNewDuration] = useState("");
  const [newDate, setNewDate] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const categories = ["Todos", "Programas", "Cursos", "Livros", "Eventos", "Materiais"];

  // Check if user has premium subscription for discounts
  const isPremium = (profile?.subscriptionPlan as string) === "premium" || (profile?.subscriptionPlan as string) === "corporate";

  const loadMarketplaceData = async () => {
    setLoading(true);
    try {
      const data = await marketplaceService.getItems();
      setItems(data);
      if (profile?.uid) {
        const purchases = await marketplaceService.getUserPurchases(profile.uid);
        setPurchasedItemIds(purchases);
      }
    } catch (error) {
      console.error("Erro ao carregar dados do marketplace:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMarketplaceData();
  }, [profile]);

  const handlePurchase = async () => {
    if (!selectedItemForPurchase || !profile?.uid) return;
    setIsPurchasing(true);
    try {
      const success = await marketplaceService.purchaseItem(selectedItemForPurchase.id!, profile.uid);
      if (success) {
        setPurchasedItemIds(prev => [...prev, selectedItemForPurchase.id!]);
        setPurchaseSuccess(true);
        setTimeout(() => {
          setPurchaseSuccess(false);
          setSelectedItemForPurchase(null);
        }, 2500);
      }
    } catch (error) {
      console.error("Erro na compra:", error);
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDescription.trim() || !newPrice) return;
    setIsCreating(true);

    try {
      const priceNum = parseFloat(newPrice);
      const creatorName = profile?.nome || "Especialista SentiPae";
      const creatorId = profile?.uid || "custom-creator";

      await marketplaceService.createItem({
        title: newTitle,
        description: newDescription,
        category: newCategory,
        price: priceNum,
        creatorId,
        creatorName,
        duration: newDuration || undefined,
        date: newCategory === "Eventos" ? newDate : undefined,
        imageUrl: `https://picsum.photos/seed/${newTitle.length}/600/400`
      });

      // Reset & Reload
      setNewTitle("");
      setNewDescription("");
      setNewPrice("");
      setNewDuration("");
      setNewDate("");
      setShowCreateModal(false);
      await loadMarketplaceData();
    } catch (err) {
      console.error("Erro ao publicar conteúdo:", err);
    } finally {
      setIsCreating(false);
    }
  };

  const filteredItems = items.filter(item => {
    const matchesCategory = selectedCategory === "Todos" || item.category === selectedCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.creatorName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Programas": return Heart;
      case "Cursos": return Video;
      case "Livros": return BookOpen;
      case "Eventos": return Calendar;
      default: return FileText;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-24 transition-colors font-sans flex flex-col">
      {/* Header */}
      <header className="px-4 py-4 sm:p-6 flex items-center justify-between sticky top-0 bg-slate-950/80 backdrop-blur-md z-20 border-b border-white/5">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate("/app")}
            className="p-2 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors flex items-center justify-center cursor-pointer text-slate-300"
            aria-label="Voltar"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-extrabold text-slate-100 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-purple-400" />
              SentiMarketplace
            </h1>
            <p className="text-[10px] uppercase tracking-widest font-black text-purple-400">Produtos & Conhecimento Humano</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {profile?.tipo === "terapeuta" && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-black transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Publicar Conteúdo
            </button>
          )}

          {isPremium && (
            <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black uppercase tracking-wider text-emerald-400 rounded-full flex items-center gap-1">
              <Crown className="w-3.5 h-3.5 fill-emerald-400" /> Premium Active
            </span>
          )}
        </div>
      </header>

      {/* Hero Banner */}
      <div className="bg-slate-900/40 border-b border-white/5 py-12 px-6">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-full text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" /> SentiCore Network Hub
            </div>
            <h2 className="text-3xl font-black tracking-tight leading-none text-slate-100">
              Conhecimento e Ferramentas para sua Jornada Emocional
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed font-light">
              Explore programas de regulação, palestras, cursos e materiais criados e assinados de forma ética pela nossa rede credenciada de especialistas.
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-950/20 to-purple-900/10 border border-purple-500/10 p-6 rounded-3xl max-w-xs space-y-3 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl" />
            <Crown className="w-8 h-8 text-purple-400" />
            <h4 className="text-sm font-extrabold text-slate-200">Clube de Benefícios SentiPae</h4>
            <p className="text-xs text-slate-400 font-light leading-relaxed">
              Assinantes Premium recebem **20% de desconto imediato** em qualquer compra no marketplace, além de acesso vitalício aos programas gratuitos.
            </p>
          </div>
        </div>
      </div>

      <main className="p-4 sm:p-6 max-w-6xl mx-auto space-y-8 w-full flex-1">
        
        {/* Search & Tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
          {/* Tabs */}
          <div className="flex flex-wrap gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
                  selectedCategory === cat 
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-950/30" 
                    : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-white/5"
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar conteúdos ou criadores..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-white/5 rounded-2xl py-2.5 pl-10 pr-4 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Content grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-10 h-10 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
            <p className="text-slate-400 text-sm">Sincronizando produtos...</p>
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => {
              const IconComponent = getCategoryIcon(item.category);
              const hasBought = purchasedItemIds.includes(item.id!);
              const originalPrice = item.price;
              const finalPrice = isPremium ? originalPrice * 0.8 : originalPrice;

              return (
                <div 
                  key={item.id}
                  className="bg-slate-900 border border-white/5 hover:border-purple-500/20 rounded-3xl overflow-hidden flex flex-col group transition-all relative shadow-xl hover:shadow-2xl"
                >
                  <div className="relative aspect-video w-full bg-slate-950 overflow-hidden">
                    <img 
                      src={item.imageUrl || `https://picsum.photos/seed/${item.id}/600/400`} 
                      alt={item.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent opacity-60" />
                    
                    {/* Category tag */}
                    <span className="absolute top-4 left-4 inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider bg-purple-600 text-white px-2.5 py-1 rounded-full shadow-lg">
                      <IconComponent className="w-3 h-3" /> {item.category}
                    </span>

                    {/* Creator label */}
                    <div className="absolute bottom-4 left-4 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-slate-800 border border-white/10 flex items-center justify-center text-slate-300 text-xs font-extrabold">
                        {item.creatorName.charAt(0)}
                      </div>
                      <div className="text-[10px] font-bold text-slate-200">
                        Por {item.creatorName}
                      </div>
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-base font-black text-slate-100 group-hover:text-purple-400 transition-colors leading-snug">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed font-light">
                        {item.description}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                      {/* Meta information */}
                      <div className="text-[10px] text-slate-500">
                        {item.duration && <span>Duração: {item.duration}</span>}
                        {item.date && <span className="block">Data: {item.date}</span>}
                      </div>

                      {/* Pricing and Action */}
                      <div className="text-right">
                        {hasBought ? (
                          <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-extrabold bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                            <CheckCircle className="w-4 h-4" /> Adquirido
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              {isPremium ? (
                                <div className="flex flex-col">
                                  <span className="text-[10px] text-slate-500 line-through">R$ {originalPrice.toFixed(2)}</span>
                                  <span className="text-sm font-black text-emerald-400 flex items-center">
                                    <Tag className="w-3.5 h-3.5 mr-0.5 fill-emerald-400/20" /> R$ {finalPrice.toFixed(2)}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-sm font-black text-slate-100">R$ {originalPrice.toFixed(2)}</span>
                              )}
                            </div>
                            <button
                              onClick={() => setSelectedItemForPurchase(item)}
                              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-black transition-colors"
                            >
                              Adquirir
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-slate-900/30 rounded-3xl border border-white/5 max-w-lg mx-auto">
            <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-base font-bold text-slate-300">Nenhum conteúdo nesta categoria</h3>
            <p className="text-xs text-slate-500 mt-1">Experimente buscar por outros termos ou categorias de apoio.</p>
          </div>
        )}
      </main>

      {/* Purchase Dialog */}
      <AnimatePresence>
        {selectedItemForPurchase && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-white/10 rounded-[2.5rem] p-8 max-w-md w-full space-y-6 relative"
            >
              <button 
                onClick={() => setSelectedItemForPurchase(null)}
                className="absolute top-6 right-6 p-1.5 hover:bg-white/5 rounded-full text-slate-400 hover:text-white transition-colors"
              >
                ✕
              </button>

              {purchaseSuccess ? (
                <div className="text-center py-8 space-y-4">
                  <div className="w-16 h-16 bg-emerald-500/15 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
                    <CheckCircle className="w-10 h-10 text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-black text-slate-100">Conteúdo Adquirido!</h3>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
                    Parabéns! Sua transação foi aprovada e o material já está disponível em sua biblioteca de conteúdos do SentiPae.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest block">{selectedItemForPurchase.category}</span>
                    <h3 className="text-xl font-black text-slate-150 leading-snug">{selectedItemForPurchase.title}</h3>
                    <p className="text-xs text-slate-400">Criado por {selectedItemForPurchase.creatorName}</p>
                  </div>

                  <div className="p-4 bg-slate-950 rounded-2xl border border-white/5 space-y-2">
                    <div className="flex justify-between items-center text-xs text-slate-400">
                      <span>Preço Regular:</span>
                      <span>R$ {selectedItemForPurchase.price.toFixed(2)}</span>
                    </div>

                    {isPremium && (
                      <div className="flex justify-between items-center text-xs text-emerald-400 font-extrabold">
                        <span>Desconto Premium (20%):</span>
                        <span>- R$ {(selectedItemForPurchase.price * 0.2).toFixed(2)}</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center text-sm font-black text-slate-200 pt-2 border-t border-white/5">
                      <span>Total a Pagar:</span>
                      <span className="text-lg text-emerald-400">R$ {(isPremium ? selectedItemForPurchase.price * 0.8 : selectedItemForPurchase.price).toFixed(2)}</span>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    Sua segurança é prioridade. As transações no SentiPae seguem regras estritas da LGPD e as receitas são compartilhadas de forma justa para valorizar nossa rede de especialistas parceiros.
                  </p>

                  <div className="pt-2 flex gap-3">
                    <button
                      onClick={() => setSelectedItemForPurchase(null)}
                      className="flex-1 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl text-xs font-black transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handlePurchase}
                      disabled={isPurchasing}
                      className="flex-1 py-3.5 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl text-xs font-black transition-colors flex items-center justify-center gap-2"
                    >
                      {isPurchasing ? "Processando..." : "Confirmar Compra"}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Upload/Create Dialog (For Terapeutas) */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-white/10 rounded-[2.5rem] p-8 max-w-md w-full space-y-6 relative max-h-[90vh] overflow-y-auto"
            >
              <button 
                onClick={() => setShowCreateModal(false)}
                className="absolute top-6 right-6 p-1.5 hover:bg-white/5 rounded-full text-slate-400 hover:text-white transition-colors"
              >
                ✕
              </button>

              <div className="space-y-1">
                <h3 className="text-xl font-black text-slate-100 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-purple-400" /> Publicar Novo Conteúdo
                </h3>
                <p className="text-xs text-slate-400">Disponibilize seus cursos, workshops, materiais ou programas.</p>
              </div>

              <form onSubmit={handleCreateItem} className="space-y-4 pt-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Título do Conteúdo</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Ex: Guia de Mindfulness Prático"
                    className="w-full bg-slate-950 border border-white/5 rounded-2xl px-4 py-3 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Descrição Detalhada</label>
                  <textarea
                    required
                    rows={3}
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Descreva o que o usuário vai receber, os objetivos e benefícios deste material..."
                    className="w-full bg-slate-950 border border-white/5 rounded-2xl px-4 py-3 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-purple-500 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Categoria</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as any)}
                      className="w-full bg-slate-950 border border-white/5 rounded-2xl px-4 py-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    >
                      <option value="Programas">Programas</option>
                      <option value="Cursos">Cursos</option>
                      <option value="Livros">Livros</option>
                      <option value="Eventos">Eventos</option>
                      <option value="Materiais">Materiais</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Preço (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value)}
                      placeholder="Ex: 49.90"
                      className="w-full bg-slate-950 border border-white/5 rounded-2xl px-4 py-3 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Duração / Formato (Opcional)</label>
                  <input
                    type="text"
                    value={newDuration}
                    onChange={(e) => setNewDuration(e.target.value)}
                    placeholder="Ex: 4 semanas / PDF 50 páginas / 6 faixas de áudio"
                    className="w-full bg-slate-950 border border-white/5 rounded-2xl px-4 py-3 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>

                {newCategory === "Eventos" && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Data e Hora do Evento</label>
                    <input
                      type="text"
                      required
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      placeholder="Ex: 25/08/2026 - 19:00"
                      className="w-full bg-slate-950 border border-white/5 rounded-2xl px-4 py-3 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                )}

                <p className="text-[9px] text-slate-500 italic">
                  * Todo conteúdo publicado passa por uma moderação automatizada de segurança baseada nas diretrizes de acolhimento ético do SentiCore.
                </p>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 py-3 bg-slate-800 text-slate-300 rounded-2xl text-xs font-black transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl text-xs font-black transition-colors flex items-center justify-center"
                  >
                    {isCreating ? "Publicando..." : "Publicar Conteúdo"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
