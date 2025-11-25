import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { Trophy, LogOut, Users, Calendar, BarChart3, Settings } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return <>{children}</>;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link to="/" className="flex items-center space-x-2">
                <Trophy className="w-8 h-8 text-primary-600" />
                <span className="text-xl font-bold text-gray-900">
                  GymnaTech
                </span>
              </Link>

              <div className="hidden md:flex space-x-4">
                <Link
                  to="/events"
                  className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Events</span>
                </Link>

                {user.role === 'judge' && (
                  <Link
                    to="/judge"
                    className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md"
                  >
                    <BarChart3 className="w-4 h-4" />
                    <span>Judge Panel</span>
                  </Link>
                )}

                {(user.role === 'admin' || user.role === 'official') && (
                  <Link
                    to="/athletes"
                    className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md"
                  >
                    <Users className="w-4 h-4" />
                    <span>Athletes</span>
                  </Link>
                )}

                {user.role === 'admin' && (
                  <Link
                    to="/configuration"
                    className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Config</span>
                  </Link>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-sm">
                <div className="font-medium text-gray-900">
                  {user.first_name} {user.last_name}
                </div>
                <div className="text-xs text-gray-500 capitalize">{user.role}</div>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-md"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};


