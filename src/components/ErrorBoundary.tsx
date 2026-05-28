import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/";
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      let errorMessage = "Ocorreu um erro inesperado.";
      let isFirestoreError = false;

      try {
        if (this.state.error?.message) {
          const parsed = JSON.parse(this.state.error.message);
          if (parsed.error && parsed.operationType) {
            errorMessage = `Erro de Banco de Dados: ${parsed.error}`;
            isFirestoreError = true;
          }
        }
      } catch (e) {
        errorMessage = this.state.error?.message || errorMessage;
      }

      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-slate-100 font-sans">
          <div className="max-w-md w-full space-y-8 text-center">
            <div className="w-20 h-20 bg-red-500/10 rounded-[28px] flex items-center justify-center mx-auto border border-red-500/20">
              <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-black tracking-tighter">Ops! Algo deu errado</h1>
              <p className="text-slate-400 text-sm leading-relaxed">
                {isFirestoreError 
                  ? "Tivemos um problema ao acessar seus dados. Isso pode ser um erro de permissão ou conexão."
                  : "O aplicativo encontrou um erro e não conseguiu continuar."}
              </p>
            </div>

            <div className="p-4 bg-slate-900/50 border border-white/5 rounded-2xl text-left">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Detalhes do Erro</p>
              <p className="text-xs font-mono text-red-400 break-words line-clamp-3">
                {errorMessage}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={this.handleReload}
                className="flex items-center justify-center gap-2 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-sm font-bold transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                Recarregar
              </button>
              <button
                onClick={this.handleReset}
                className="flex items-center justify-center gap-2 py-4 bg-emerald-600 hover:bg-emerald-500 rounded-2xl text-sm font-bold transition-all shadow-lg shadow-emerald-600/20"
              >
                <Home className="w-4 h-4" />
                Início
              </button>
            </div>
            
            <p className="text-[10px] text-slate-600 font-medium">
              Se o problema persistir, entre em contato com o suporte técnico.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
