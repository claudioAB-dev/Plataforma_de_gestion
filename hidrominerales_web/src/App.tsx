import React from "react";
import { Routes, Route, Navigate, Link } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./global/navbar";
import Login from "./login/Login";
import VentasLayout from "./produccion/produccion";
import AdminLayout from "./admin/AdminLayout";
import GerenteProduccionLayout from "./gerente_produccion/GerenteProduccionLayout";
import GerenteClienteLayout from "./gerente_clientes/GerenteClienteLayout";
import GerenteAlmacenLayout from "./gerente_almacen/GerenteAlmacenLayout";
import ErrorBoundary from "./ErrorBoundary";
import ReporteDetalle from "./gerente_produccion/views/ReporteDetalle";
import HomePage from "./home/HomePage";
import EmpleadoLayout from "./empleado/EmpleadoLayout";
import GerenteEmpleadosLayout from "./gerente_empleados/GerenteEmpleadosLayout";

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

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Cargando aplicación...</div>;
  }

  return (
    <ErrorBoundary>
      <div>
        <Navbar />
        <main>
          <Routes>
            <Route
              path="/login"
              element={
                isAuthenticated ? <Navigate to="/" replace /> : <Login />
              }
            />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            <Route
              path="/"
              element={
                <RoleProtectedRoute allowedRoles={[1, 2, 3, 4, 5, 6, 7, 8]}>
                  <HomePage />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <RoleProtectedRoute allowedRoles={[1, 2]}>
                  <AdminLayout />
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
            <Route path="*" element={<Navigate to="/" />} />
            <Route
              path="/gerente-produccion"
              element={
                <RoleProtectedRoute allowedRoles={[1, 2, 4]}>
                  <GerenteProduccionLayout />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/gerente-produccion/reportes/:reporteId"
              element={
                <RoleProtectedRoute allowedRoles={[1, 2, 4]}>
                  <ReporteDetalle />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/gerente-clientes"
              element={
                <RoleProtectedRoute allowedRoles={[1, 2, 3, 8]}>
                  <GerenteClienteLayout />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/gerente-almacen"
              element={
                <RoleProtectedRoute allowedRoles={[1, 6, 8]}>
                  <GerenteAlmacenLayout />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/empleado"
              element={
                <RoleProtectedRoute allowedRoles={[1, 2, 3, 4, 5, 6, 7, 8]}>
                  <EmpleadoLayout />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/gerente-empleados"
              element={
                <RoleProtectedRoute allowedRoles={[1, 2, 8]}>
                  <GerenteEmpleadosLayout />
                </RoleProtectedRoute>
              }
            />
          </Routes>
        </main>
      </div>
    </ErrorBoundary>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
