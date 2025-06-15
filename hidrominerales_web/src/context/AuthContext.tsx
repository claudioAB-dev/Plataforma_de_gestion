import React, { createContext, useState, useContext, useEffect } from "react";
import type { ReactNode } from "react";

interface User {
  id: number;
  nombre: string;
  rol_id: number;
  rol_nombre: string | null;
}

interface LoginCredentials {
  nombre: string;
  contrasena: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  error: string | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Inicia en true para verificar el estado inicial
  const [error, setError] = useState<string | null>(null);

  // Efecto para comprobar si hay un usuario en localStorage al cargar la app
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error("Error al leer el estado de autenticación", e);
      localStorage.removeItem("user"); // Limpia si hay datos corruptos
    } finally {
      setIsLoading(false); // Terminamos la carga inicial
    }
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("http://127.0.0.1:5001/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al iniciar sesión");
      }

      // Login exitoso
      const loggedInUser: User = data.user;
      setUser(loggedInUser);
      localStorage.setItem("user", JSON.stringify(loggedInUser)); // Persistimos la sesión
    } catch (err: any) {
      setError(err.message);
      console.error("Error en el login:", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    // Aquí también podrías limpiar cualquier otro dato de sesión (ej. token)
  };

  const value = {
    user,
    isAuthenticated: !!user, // Es true si 'user' no es null
    isLoading,
    error,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 6. Hook personalizado para consumir el contexto fácilmente
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
};
