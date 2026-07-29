import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Heart, Menu, X, LogOut, Calendar, LayoutDashboard, ChevronDown } from 'lucide-react';
import { useAuth } from '../../hooks/use-auth';
import { cn, getInitials } from '../../lib/utils';
import Button from '../ui/Button';

export default function Navbar() {
  const { user, isAuthenticated, isDoctor, isPatient, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const dashboardPath = isDoctor
    ? '/doctor/dashboard'
    : isPatient
      ? '/patient/dashboard'
      : '/';

  return (
    <nav className="sticky top-0 z-40 border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
              <Heart className="h-4 w-4 text-white fill-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">
              Cardio<span className="text-primary-600">Center</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden items-center gap-6 md:flex">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                cn('text-sm font-medium transition-colors', isActive ? 'text-primary-600' : 'text-gray-600 hover:text-gray-900')
              }
            >
              Inicio
            </NavLink>
            <NavLink
              to="/doctors"
              className={({ isActive }) =>
                cn('text-sm font-medium transition-colors', isActive ? 'text-primary-600' : 'text-gray-600 hover:text-gray-900')
              }
            >
              Médicos
            </NavLink>
          </div>

          {/* Desktop auth */}
          <div className="hidden items-center gap-3 md:flex">
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-600 text-xs font-bold text-white">
                    {getInitials(user.firstName, user.lastName)}
                  </div>
                  <span className="max-w-28 truncate">{user.firstName}</span>
                  <ChevronDown className={cn('h-4 w-4 transition-transform', dropdownOpen && 'rotate-180')} />
                </button>

                {dropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-52 rounded-xl border border-gray-100 bg-white py-1.5 shadow-xl animate-fade-in"
                    onMouseLeave={() => setDropdownOpen(false)}
                  >
                    <div className="border-b border-gray-100 px-4 pb-2 pt-1">
                      <p className="text-sm font-semibold text-gray-900">{user.firstName} {user.lastName}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    <button
                      onClick={() => { navigate(dashboardPath); setDropdownOpen(false); }}
                      className="flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <LayoutDashboard className="h-4 w-4" /> Dashboard
                    </button>
                    {isPatient && (
                      <button
                        onClick={() => { navigate('/patient/appointments'); setDropdownOpen(false); }}
                        className="flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Calendar className="h-4 w-4" /> Mis Citas
                      </button>
                    )}
                    <button
                      onClick={() => { logout(); setDropdownOpen(false); }}
                      className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4" /> Cerrar Sesión
                    </button>
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
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-gray-200 bg-white px-4 py-4 md:hidden animate-fade-in">
          <div className="flex flex-col gap-3">
            <Link to="/" className="text-sm font-medium text-gray-700" onClick={() => setMenuOpen(false)}>Inicio</Link>
            <Link to="/doctors" className="text-sm font-medium text-gray-700" onClick={() => setMenuOpen(false)}>Médicos</Link>
            {isAuthenticated ? (
              <>
                <Link to={dashboardPath} className="text-sm font-medium text-gray-700" onClick={() => setMenuOpen(false)}>Dashboard</Link>
                <button onClick={() => { logout(); setMenuOpen(false); }} className="text-left text-sm font-medium text-red-600">Cerrar Sesión</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMenuOpen(false)}><Button variant="secondary" className="w-full">Iniciar Sesión</Button></Link>
                <Link to="/register" onClick={() => setMenuOpen(false)}><Button className="w-full">Registrarse</Button></Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
