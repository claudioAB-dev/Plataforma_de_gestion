import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Footer from "../global/footer";
import LoginNav from "../global/LoginNav";

import "./styles/login.css";

const Login: React.FC = () => {
  // Utilizamos el hook para acceder al estado y las funciones de autenticación
  const { login, isLoading, error } = useAuth();

  // Cambiamos el estado para que coincida con la API (nombre, contrasena)
  const [nombre, setNombre] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (nombre.trim() === "" || password.trim() === "") {
      console.error("Ambos campos son requeridos.");
      return;
    }

    // Llamamos a la función login del contexto
    await login({ nombre: nombre, contrasena: password });
  };

  return (
    <>
      <div className="login-container">
        <form onSubmit={handleSubmit} className="login-form">
          <h2>Iniciar Sesión</h2>

          {/* Mostramos un mensaje de error si existe */}
          {error && <p className="error-message">{error}</p>}

          <div className="form-group">
            <label htmlFor="nombre">Nombre de Usuario</label>
            <input
              type="text"
              id="nombre"
              className="form-input"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="tu_usuario"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <button type="submit" className="submit-button" disabled={isLoading}>
            {isLoading ? "Cargando..." : "Entrar"}
          </button>
        </form>
      </div>
      <Footer />
    </>
  );
};

export default Login;
