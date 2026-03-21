import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      let errorMessage = "Ocorreu um erro inesperado.";
      
      try {
        // Tenta parsear se for um erro do Firestore (JSON string)
        const firestoreError = JSON.parse(this.state.error?.message || "");
        if (firestoreError.error) {
          errorMessage = `Erro de Banco de Dados: ${firestoreError.error}`;
        }
      } catch (e) {
        // Não é um erro JSON do Firestore
        errorMessage = this.state.error?.message || errorMessage;
      }

      return (
        <div className="min-h-screen bg-brand-dark flex items-center justify-center p-6 text-center">
          <div className="glass-card p-8 max-w-md space-y-6">
            <div className="w-16 h-16 bg-brand-red/20 text-brand-red rounded-full flex items-center justify-center mx-auto">
              <span className="text-2xl font-bold">!</span>
            </div>
            <h1 className="text-2xl font-bold text-brand-text">Ops! Algo deu errado</h1>
            <p className="text-brand-text/60">{errorMessage}</p>
            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-brand-green text-brand-dark font-bold py-3 rounded-xl"
            >
              Recarregar Página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
