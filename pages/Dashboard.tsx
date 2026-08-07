import React, { useEffect } from 'react';
import { Link, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { Settings, Plus, MessageSquare, LogOut, Calendar, Megaphone, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

const Dashboard: React.FC = () => {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
      navigate('/');
      await logout();
  };

  useEffect(() => {
    if (loading) return;
    if (!user) {
        navigate('/login');
        return;
    }
  }, [user, loading, navigate]);

  if (loading || !user) {
    return (
      <div className="flex-1 bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const isClient = user.role === UserRole.CLIENT;

  const menuItems = [
    { to: '/dashboard', label: 'Meu Painel', icon: LayoutDashboard },
    { to: '/dashboard/chat', label: 'Chat', icon: MessageSquare },
    { to: '/dashboard/appointments', label: 'Meus Agendamentos', icon: Calendar },
    ...(isClient ? [] : [{ to: '/dashboard/ads', label: 'Meus Anúncios', icon: Megaphone }]),
  ];

  const isActive = (to: string) => {
    if (to === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname.startsWith(to) ? 'bg-brand-50 text-brand-700 font-semibold' : 'text-gray-700 hover:bg-brand-50 hover:text-brand-700';
  };

  return (
    <>
    <div className="flex-1 bg-gray-50 py-4 overflow-hidden">
      <div className="px-3 h-full flex flex-col">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 flex-1 min-h-0">
            {/* Sidebar Profile */}
            <aside className="bg-white rounded-lg shadow p-5 flex flex-col overflow-hidden">
                <div className="flex flex-col items-center">
                    <img src={user.avatar || 'https://via.placeholder.com/100'} alt="Profile" className="w-16 h-16 rounded-full mb-3 object-cover" />
                    <h2 className="text-lg font-bold text-center">{user.name}</h2>
                    <p className="text-gray-500 text-xs mb-3 text-center truncate max-w-full">{user.email}</p>
                    <div className="mb-3 bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full font-medium">
                        {isClient ? 'Cliente' : 'Profissional'}
                    </div>
                </div>

                <div className="mt-4 border-t border-gray-100 pt-4">
                    <h3 className="font-semibold text-gray-700 mb-3">Menu</h3>
                    <nav className="space-y-0.5">
                        {menuItems.map(item => (
                            <Link
                                key={item.to}
                                to={item.to}
                                className={`flex items-center px-3 py-2 rounded-md transition-colors text-sm font-medium ${isActive(item.to)}`}
                            >
                                <item.icon size={16} className="mr-3 text-brand-600" /> {item.label}
                            </Link>
                        ))}
                    </nav>
                </div>

                <div className="mt-auto pt-4 border-t border-gray-100 space-y-2">
                    <Link to="/profile/edit" className="w-full flex items-center justify-center border border-gray-300 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium">
                        <Settings size={16} className="mr-2" /> Editar
                    </Link>
                    <button onClick={handleLogout} className="w-full flex items-center justify-center bg-red-50 text-red-600 border border-red-100 px-3 py-2 rounded-md hover:bg-red-100 transition-colors text-sm font-medium">
                        <LogOut size={16} className="mr-2" /> Sair
                    </button>
                    <Link to="/" className="flex items-center justify-center px-3 py-2 rounded-md text-gray-500 hover:text-brand-600 hover:bg-brand-50 transition-colors text-sm font-medium">
                        Voltar ao início
                    </Link>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="lg:col-span-3 min-h-0 overflow-y-auto">
                <Outlet />
            </div>
        </div>
      </div>
    </div>
  </>
  );
};

export default Dashboard;
