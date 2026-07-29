import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Heart, Menu, X, LogOut, Calendar, LayoutDashboard, ChevronDown, User, Sun, Moon, Clock, Settings } from 'lucide-react';
import { useAuth } from '../../hooks/use-auth';
import { useTheme } from '../../hooks/use-theme';
import { cn, getInitials } from '../../lib/utils';
import Button from '../ui/Button';

export default function Navbar() {
  const { user, isAuthenticated, isDoctor, isPatient, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const dashboardPath = isDoctor
    ? '/doctor/dashboard'
    : isPatient
      ? '/patient/dashboard'
      : '/';

  return (
    <nav
      className={cn(
        'sticky top-0 z-40 transition-all duration-300',
        scrolled
          ? 'border-b border-neutral-200/80 bg-white/95 backdrop-blur-xl shadow-luxury'
          : 'border-b border-transparent bg-white/80 backdrop-blur-md',
      )}
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="flex h-17 items-center justify-between" style={{ height: '68px' }}>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 shadow-red-glow transition-all duration-300 group-hover:shadow-red-glow-lg group-hover:scale-105">
              <Heart className="h-4.5 w-4.5 text-white fill-white" style={{ width: '18px', height: '18px' }} />
            </div>
            <span className="text-[17px] font-bold tracking-tight text-neutral-900">
              Cardio<span className="text-primary-600">Center</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden items-center gap-1 md:flex">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100',
                )
              }
            >
              Inicio
            </NavLink>
            <NavLink
              to="/doctors"
              className={({ isActive }) =>
                cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100',
                )
              }
            >
              Médicos
            </NavLink>
          </div>

          {/* Desktop auth */}
          <div className="hidden items-center gap-3 md:flex">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
              title={theme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4 text-amber-500" />}
            </button>

            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2.5 rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-sm font-medium text-neutral-700 shadow-luxury transition-all duration-200 hover:border-neutral-300 hover:shadow-luxury-md"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-600 text-xs font-bold text-white">
                    {getInitials(user.firstName, user.lastName)}
                  </div>
                  <span className="max-w-28 truncate">{user.firstName}</span>
                  <ChevronDown className={cn('h-3.5 w-3.5 text-neutral-400 transition-transform duration-200', dropdownOpen && 'rotate-180')} />
                </button>

                {dropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 rounded-2xl border border-neutral-100 bg-white py-2 shadow-luxury-lg animate-fade-in"
                    onMouseLeave={() => setDropdownOpen(false)}
                  >
                    <div className="border-b border-neutral-100 px-4 pb-3 pt-1.5">
                      <p className="text-sm font-semibold text-neutral-900">{user.firstName} {user.lastName}</p>
                      <p className="text-xs text-neutral-400 mt-0.5">{user.email}</p>
                    </div>
                    <div className="pt-1">
                      <button
                        onClick={() => { navigate(dashboardPath); setDropdownOpen(false); }}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 transition-colors"
                      >
                        <LayoutDashboard className="h-4 w-4 text-neutral-400" /> Dashboard
                      </button>
                      {isDoctor && (
                        <>
                          <button
                            onClick={() => { navigate('/doctor/profile'); setDropdownOpen(false); }}
                            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 transition-colors"
                          >
                            <User className="h-4 w-4 text-neutral-400" /> Mi Perfil
                          </button>
                          <button
                            onClick={() => { navigate('/doctor/schedules'); setDropdownOpen(false); }}
                            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 transition-colors"
                          >
                            <Clock className="h-4 w-4 text-neutral-400" /> Mis Horarios
                          </button>
                          <button
                            onClick={() => { navigate('/doctor/services'); setDropdownOpen(false); }}
                            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 transition-colors"
                          >
                            <Settings className="h-4 w-4 text-neutral-400" /> Mis Servicios
                          </button>
                        </>
                      )}
                      {isPatient && (
                        <>
                          <button
                            onClick={() => { navigate('/patient/appointments'); setDropdownOpen(false); }}
                            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 transition-colors"
                          >
                            <Calendar className="h-4 w-4 text-neutral-400" /> Mis Citas
                          </button>
                          <button
                            onClick={() => { navigate('/patient/profile'); setDropdownOpen(false); }}
                            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 transition-colors"
                          >
                            <User className="h-4 w-4 text-neutral-400" /> Mi Perfil
                          </button>
                        </>
                      )}
                      <div className="mt-1 border-t border-neutral-100 pt-1">
                        <button
                          onClick={() => { logout(); setDropdownOpen(false); }}
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-primary-600 hover:bg-primary-50 transition-colors"
                        >
                          <LogOut className="h-4 w-4" /> Cerrar Sesión
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">Iniciar Sesión</Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">Registrarse</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="flex h-9 w-9 items-center justify-center rounded-xl text-neutral-600 hover:bg-neutral-100 transition-colors md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-neutral-100 bg-white px-5 py-4 md:hidden animate-slide-down">
          <div className="flex flex-col gap-1">
            <Link
              to="/"
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
              onClick={() => setMenuOpen(false)}
            >
              Inicio
            </Link>
            <Link
              to="/doctors"
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
              onClick={() => setMenuOpen(false)}
            >
              Médicos
            </Link>

            {isAuthenticated ? (
              <>
                <div className="my-2 h-px bg-neutral-100" />
                <Link
                  to={dashboardPath}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                  onClick={() => setMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => { logout(); setMenuOpen(false); }}
                  className="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-primary-600 hover:bg-primary-50 transition-colors"
                >
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <>
                <div className="my-2 h-px bg-neutral-100" />
                <Link to="/login" onClick={() => setMenuOpen(false)}>
                  <Button variant="secondary" className="w-full">Iniciar Sesión</Button>
                </Link>
                <Link to="/register" onClick={() => setMenuOpen(false)}>
                  <Button className="w-full mt-2">Registrarse</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
