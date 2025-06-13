import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./global/navbar";
import Login from "./login/login";

const App: React.FC = () => {
  const handleLogin = (credentials: { email: string; password: string }) => {
    console.log("Credenciales recibidas:", credentials);
  };

  return (
    <div>
      <Navbar />

      <main>
        <Routes>
          <Route path="/" element={<Login onLogin={handleLogin} />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
