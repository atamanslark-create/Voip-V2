import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './store';
import { LoginPage } from './pages/Login';
import { DashboardPage } from './pages/Dashboard';
import { AdminPage } from './pages/Admin';
import { ManagerPage } from './pages/Manager';
import { TelephonistPage } from './pages/Telephonist';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" />;
}

function RoleRoute({ children, requiredRole }: { children: React.ReactNode; requiredRole: string }) {
  const { user } = useAuth();
  return user?.role === requiredRole ? children : <Navigate to="/dashboard" />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/users"
          element={
            <PrivateRoute>
              <RoleRoute requiredRole="admin">
                <AdminPage />
              </RoleRoute>
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/lines"
          element={
            <PrivateRoute>
              <RoleRoute requiredRole="admin">
                <AdminPage />
              </RoleRoute>
            </PrivateRoute>
          }
        />

        {/* Manager Routes */}
        <Route
          path="/manager/create-error"
          element={
            <PrivateRoute>
              <RoleRoute requiredRole="manager">
                <ManagerPage />
              </RoleRoute>
            </PrivateRoute>
          }
        />
        <Route
          path="/manager/tickets"
          element={
            <PrivateRoute>
              <RoleRoute requiredRole="manager">
                <ManagerPage />
              </RoleRoute>
            </PrivateRoute>
          }
        />

        {/* Telephonist Routes */}
        <Route
          path="/telephonist/lines"
          element={
            <PrivateRoute>
              <RoleRoute requiredRole="telephonist">
                <TelephonistPage />
              </RoleRoute>
            </PrivateRoute>
          }
        />
        <Route
          path="/telephonist/tickets"
          element={
            <PrivateRoute>
              <RoleRoute requiredRole="telephonist">
                <TelephonistPage />
              </RoleRoute>
            </PrivateRoute>
          }
        />

        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
