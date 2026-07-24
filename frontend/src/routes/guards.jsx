import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FullScreenLoader from '../components/ui/FullScreenLoader';

/**
 * Guards routes that require authentication. Redirects to /login while
 * preserving the originally-requested location so we can return there after login.
 */
export const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <FullScreenLoader />;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  return <Outlet />;
};

/**
 * Guards routes that only make sense for logged-out visitors (login/register).
 * Redirects already-authenticated users straight to the dashboard.
 */
export const PublicOnlyRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <FullScreenLoader />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
};

/**
 * Guards routes that require admin role.
 */
export const AdminRoute = () => {
  const { isAdmin, isLoading } = useAuth();

  if (isLoading) return <FullScreenLoader />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
};
