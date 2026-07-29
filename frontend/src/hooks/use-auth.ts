import { useAuthStore } from '../stores/auth.store';
import { useNavigate } from 'react-router-dom';

export function useAuth() {
  const store = useAuthStore();
  const navigate = useNavigate();

  const logoutAndRedirect = () => {
    store.logout();
    navigate('/login');
  };

  return {
    user: store.user,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.isLoading,
    error: store.error,
    isPatient: store.user?.role === 'PATIENT',
    isDoctor: store.user?.role === 'DOCTOR',
    isAdmin: store.user?.role === 'ADMIN',
    login: store.login,
    register: store.register,
    logout: logoutAndRedirect,
    fetchMe: store.fetchMe,
    clearError: store.clearError,
  };
}
