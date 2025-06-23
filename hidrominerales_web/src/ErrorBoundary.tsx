import React, { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    // Actualiza el estado para que el siguiente renderizado muestre la UI de fallback.
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // --- MENSAJE DE ERROR CLARO EN CONSOLA ---
    console.error("=========================================");
    console.error("||      ERROR CAPTURADO POR BOUNDARY     ||");
    console.error("=========================================");
    console.error("Error:", error);
    console.error("Detalles del Componente:", errorInfo.componentStack);
    console.error("=========================================");
  }

  public render() {
    if (this.state.hasError) {
      // Puedes renderizar cualquier UI de fallback.
      return (
        <div style={{ padding: "2rem", textAlign: "center", color: "red" }}>
          <h1>Algo salió mal.</h1>
          <p>
            Ocurrió un error inesperado en la aplicación. Por favor, intenta
            refrescar la página o contacta a soporte si el problema persiste.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
