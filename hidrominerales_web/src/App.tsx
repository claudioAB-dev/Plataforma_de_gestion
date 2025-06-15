import React from "react";
import { Routes, Route, Navigate, Link } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./global/navbar";
import Login from "./login/Login";
import VentasLayout from "./produccion/produccion";

const AdminPage: React.FC = () => <h1>Panel de Administrador (Solo Rol 1)</h1>;
const EditorPage: React.FC = () => <h1>Panel de Editor (Solo Rol 2)</h1>;

const UnauthorizedPage: React.FC = () => {
  const { logout } = useAuth();

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>🚫 Acceso Denegado</h1>
      <p>No tienes el rol necesario para ver esta página.</p>
      <div>
        <Link to="/" style={{ marginRight: "1rem" }}>
          Volver al inicio
        </Link>
        {/* El botón ahora llama a la función del contexto */}
        <button onClick={logout}>Cerrar Sesión</button>
      </div>
    </div>
  );
};

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: number[];
}

const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const userRoleId = user?.rol_id;

  if (userRoleId && allowedRoles.includes(userRoleId)) {
    return <>{children}</>;
  }

  return <Navigate to="/unauthorized" replace />;
};

// --- PÁGINA DE INICIO ACTUALIZADA ---

const HomePage: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>¡Bienvenido, {user?.nombre}!</h1>
      <p>
        Tu rol es: <strong>{user?.rol_nombre}</strong> (ID: {user?.rol_id})
      </p>
      <nav>
        {/* Mostramos los enlaces solo si el rol del usuario coincide */}
        {user?.rol_id === 1 && (
          <Link to="/admin" style={{ margin: "0 10px" }}>
            Panel Admin
          </Link>
        )}
        {user?.rol_id === 2 && (
          <Link to="/editor" style={{ margin: "0 10px" }}>
            Panel Editor
          </Link>
        )}
      </nav>
      <br />
      <button onClick={logout}>Cerrar Sesión</button>
    </div>
  );
};

// --- CONTENIDO PRINCIPAL DE LA APP ---

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Cargando aplicación...</div>;
  }

  return (
    <div>
      <Navbar />
      <main>
        <Routes>
          {/* --- RUTAS PÚBLICAS --- */}
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
          />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* --- RUTAS PROTEGIDAS --- */}
          <Route
            path="/"
            element={
              // Esta ruta solo requiere estar autenticado con un rol válido (ej: 1 o 2)
              <RoleProtectedRoute allowedRoles={[1, 2]}>
                <HomePage />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <RoleProtectedRoute allowedRoles={[1]}>
                <AdminPage />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/editor"
            element={
              // Solo el rol 2 puede acceder aquí (lógica de permisos eliminada)
              <RoleProtectedRoute allowedRoles={[2]}>
                <EditorPage />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/produccion"
            element={
              <RoleProtectedRoute allowedRoles={[1, 2, 4, 5]}>
                <VentasLayout />
              </RoleProtectedRoute>
            }
          />

          {/* --- RUTA COMODÍN --- */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
};

// --- COMPONENTE PRINCIPAL ---
const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
