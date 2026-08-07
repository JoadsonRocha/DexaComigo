import React, { useEffect, useState } from 'react';
import { store } from '../services/store';
import { Link, useNavigate } from 'react-router-dom';
import { Settings, Plus, Search, MessageSquare, LogOut, Calendar, Check, Clock, Star, CheckCircle2, Megaphone, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ServiceAd, UserRole, Appointment, ChatSession } from '../types';

const Dashboard: React.FC = () => {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();

  const [unreadCount, setUnreadCount] = useState(0);

  const handleLogout = async () => {
      navigate('/');
      await logout();
  };
  const [myAds, setMyAds] = useState<ServiceAd[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [chats, setChats] = useState<ChatSession[]>([]);

  const loadAppointments = async (userId: string, role: UserRole) => {
      const data = await store.getMyAppointments(userId, role);
      setAppointments(data);
  };

  useEffect(() => {
    if (loading) return;
    if (!user) {
        navigate('/login');
        return;
    }
    if (user.role === UserRole.PROVIDER) {
        const loadData = async () => {
        const ads = await store.getAds({ providerId: user.id });
        setMyAds(ads);
        const unread = await store.getGlobalUnreadCount(user.id);
        setUnreadCount(unread);
        await loadAppointments(user.id, user.role);
        const userChats = await store.getChats(user.id);
        setChats(userChats);
    };
    loadData();
    } else {
        const loadClientData = async () => {
            const unread = await store.getGlobalUnreadCount(user.id);
            setUnreadCount(unread);
            await loadAppointments(user.id, user.role);
            const userChats = await store.getChats(user.id);
            setChats(userChats);
        };
        loadClientData();
    }
  }, [user, navigate]);

  if (!user) return null;

  const isClient = user.role === UserRole.CLIENT;

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const enquiriesTotal = chats.length;
  const enquiriesNew = chats.reduce((acc, c) => acc + (c.unreadCount || 0), 0);
  const enquiriesWeek = chats.filter(c => new Date(c.updatedAt) >= weekAgo).length;
  const enquiriesResolved = appointments.filter(a => a.status === 'completed').length;

  const adsTotal = myAds.length;
  const adsPremium = myAds.filter(a => a.isPremium).length;
  const adsCategories = new Set(myAds.map(a => a.category)).size;
  const adsRating = myAds.length ? (myAds.reduce((acc, a) => acc + (a.rating || 0), 0) / myAds.length).toFixed(1) : '0';

  const StatCard: React.FC<{ label: string; value: number | string; icon: React.ComponentType<{ size?: number | string; className?: string }>; color: string }> = ({ label, value, icon: Icon, color }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-4 py-3 flex items-center">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${color}`}>
        <Icon size={18} />
      </div>
      <div>
        <p className="text-xl font-bold text-gray-900 leading-tight">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </div>
  );

  const SectionHeader: React.FC<{ title: string; to: string; linkText: string }> = ({ title, to, linkText }) => (
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-lg font-bold text-gray-800">{title}</h2>
      <Link to={to} className="text-brand-600 font-medium text-sm hover:underline">{linkText} →</Link>
    </div>
  );

  return (
    <>
    <div className="flex-1 bg-gray-50 py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col">        
        <div className="flex justify-between items-center mb-4">
            <h1 className="text-lg font-bold text-gray-900">Meu Painel</h1>
            {!isClient && (
                <Link to="/create-ad" className="bg-brand-600 text-white px-3 py-1.5 text-sm rounded-md flex items-center hover:bg-brand-700">
                    <Plus size={16} className="mr-1" /> Novo Anúncio
                </Link>
            )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar Profile */}
            <div className="bg-white rounded-lg shadow p-5 h-fit">
                <div className="flex flex-col items-center">
                    <img src={user.avatar || 'https://via.placeholder.com/100'} alt="Profile" className="w-16 h-16 rounded-full mb-3 object-cover" />
                    <h2 className="text-lg font-bold text-center">{user.name}</h2>
                    <p className="text-gray-500 text-xs mb-3 text-center truncate max-w-full">{user.email}</p>
                    <div className="mb-3 bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full font-medium">
                        {isClient ? 'Cliente' : 'Profissional'}
                    </div>
                    <div className="w-full flex space-x-2">
                        <Link to="/profile/edit" className="flex-1 border border-gray-300 text-gray-700 px-2 py-1.5 rounded-md flex items-center justify-center hover:bg-gray-50 transition-colors text-xs">
                            <Settings size={14} className="mr-1" /> Editar
                        </Link>
                        <button onClick={handleLogout} className="flex-1 bg-red-50 text-red-600 border border-red-100 px-2 py-1.5 rounded-md flex items-center justify-center hover:bg-red-100 transition-colors text-xs">
                            <LogOut size={14} className="mr-1" /> Sair
                        </button>
                    </div>
                </div>
                
                <div className="mt-4 border-t border-gray-100 pt-4">
                    <h3 className="font-semibold text-gray-700 mb-3">Menu</h3>
                    <nav className="space-y-0.5">
                        <Link to="/chat" className="flex items-center px-3 py-2 rounded-md text-gray-700 hover:bg-brand-50 hover:text-brand-700 transition-colors text-sm font-medium">
                            <MessageSquare size={16} className="mr-3 text-brand-600" /> Chat
                        </Link>
                        <Link to="/dashboard/appointments" className="flex items-center px-3 py-2 rounded-md text-gray-700 hover:bg-brand-50 hover:text-brand-700 transition-colors text-sm font-medium">
                            <Calendar size={16} className="mr-3 text-brand-600" /> Meus Agendamentos
                        </Link>
                        <Link to="/dashboard/enquiries" className="flex items-center px-3 py-2 rounded-md text-gray-700 hover:bg-brand-50 hover:text-brand-700 transition-colors text-sm font-medium">
                            <MessageSquare size={16} className="mr-3 text-brand-600" /> Minhas Consultas
                        </Link>
                        {!isClient && (
                            <Link to="/dashboard/ads" className="flex items-center px-3 py-2 rounded-md text-gray-700 hover:bg-brand-50 hover:text-brand-700 transition-colors text-sm font-medium">
                                <Megaphone size={16} className="mr-3 text-brand-600" /> Meus Anúncios
                            </Link>
                        )}
                    </nav>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-3">
                {/* Meus Serviços */}
                <div className="mb-6">
                    <SectionHeader title="Meus Serviços" to="/dashboard/enquiries" linkText="Ver todos" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard label="Total de Consultas" value={enquiriesTotal} icon={MessageSquare} color="bg-brand-50 text-brand-600" />
                        <StatCard label="Novas Mensagens" value={enquiriesNew} icon={Mail} color="bg-green-50 text-green-600" />
                        <StatCard label="Esta Semana" value={enquiriesWeek} icon={Calendar} color="bg-blue-50 text-blue-600" />
                        <StatCard label="Total Resolvidas" value={enquiriesResolved} icon={CheckCircle2} color="bg-purple-50 text-purple-600" />
                    </div>
                </div>

                {/* Meus Anúncios (apenas profissional) */}
                {!isClient && (
                    <div className="mb-6">
                        <SectionHeader title="Meus Anúncios" to="/dashboard/ads" linkText="Ver todos" />
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <StatCard label="Total de Anúncios" value={adsTotal} icon={Megaphone} color="bg-brand-50 text-brand-600" />
                            <StatCard label="Anúncios Premium" value={adsPremium} icon={Star} color="bg-yellow-50 text-yellow-600" />
                            <StatCard label="Categorias" value={adsCategories} icon={Search} color="bg-blue-50 text-blue-600" />
                            <StatCard label="Avaliação Média" value={adsRating} icon={Star} color="bg-purple-50 text-purple-600" />
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  </>
  );
};

export default Dashboard;
