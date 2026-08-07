import React, { useEffect, useState } from 'react';
import { store } from '../services/store';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, MessageSquare, Calendar, Star, CheckCircle2, Megaphone, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ServiceAd, UserRole, Appointment, ChatSession } from '../types';

const DashboardHome: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [myAds, setMyAds] = useState<ServiceAd[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [chats, setChats] = useState<ChatSession[]>([]);

  useEffect(() => {
    if (loading) return;
    if (!user) {
        navigate('/login');
        return;
    }

    const loadAll = async () => {
      const unread = await store.getGlobalUnreadCount(user.id);
      void unread;
      const userAppointments = await store.getMyAppointments(user.id, user.role);
      setAppointments(userAppointments);
      const userChats = await store.getChats(user.id);
      setChats(userChats);
      if (user.role === UserRole.PROVIDER) {
        const ads = await store.getAds({ providerId: user.id });
        setMyAds(ads);
      }
    };
    loadAll();
  }, [user, loading, navigate]);

  if (loading || !user) return null;

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
    <div className="h-full">
        <div className="flex justify-between items-center mb-4">
            <h1 className="text-lg font-bold text-gray-900">Meu Painel</h1>
            {!isClient && (
                <Link to="/create-ad" className="bg-brand-600 text-white px-3 py-1.5 text-sm rounded-md flex items-center hover:bg-brand-700">
                    <Plus size={16} className="mr-1" /> Novo Anúncio
                </Link>
            )}
        </div>

        {/* Meus Serviços */}
        <div className="mb-6">
            <SectionHeader title="Meus Serviços" to="/dashboard/enquiries" linkText="Ver todos" />
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    <StatCard label="Total de Anúncios" value={adsTotal} icon={Megaphone} color="bg-brand-50 text-brand-600" />
                    <StatCard label="Anúncios Premium" value={adsPremium} icon={Star} color="bg-yellow-50 text-yellow-600" />
                    <StatCard label="Categorias" value={adsCategories} icon={Search} color="bg-blue-50 text-blue-600" />
                    <StatCard label="Avaliação Média" value={adsRating} icon={Star} color="bg-purple-50 text-purple-600" />
                </div>
            </div>
        )}
    </div>
  );
};

export default DashboardHome;
