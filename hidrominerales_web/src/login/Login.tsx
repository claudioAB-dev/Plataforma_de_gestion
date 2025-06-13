import React, { useState } from "react";
import "./styles/login.css"; // Asegúrate de que la ruta a tu CSS es correcta

// 1. Definimos el tipado para las credenciales
interface Credentials {
  email: string;
  password: string;
}

// 2. Definimos las props que recibirá el componente
interface LoginProps {
  /**
   * Función que se ejecuta cuando el usuario envía el formulario.
   * Recibe las credenciales como argumento.
   */
  onLogin: (credentials: Credentials) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  // 3. Estado para manejar los inputs del formulario
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  // 4. Handler para el envío del formulario
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Prevenimos que la página se recargue

    // Validación básica
    if (email.trim() === "" || password.trim() === "") {
      // Es mejor evitar `alert` en React. Considera un componente de notificación.
      console.error("Ambos campos son requeridos.");
      return;
    }

    // Llamamos a la función que recibimos por props
    onLogin({ email, password });
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2>Iniciar Sesión</h2>
        <div className="form-group">
          <label htmlFor="email">Correo Electrónico</label>
          <input
            type="email"
            id="email"
            className="form-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tucorreo@ejemplo.com"
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
        <button type="submit" className="submit-button">
          Entrar
        </button>
      </form>
    </div>
  );
};

export default Login;
