import React, { useEffect, useState } from 'react';
import { store } from '../services/store';
import { Link, useNavigate } from 'react-router-dom';
import { Settings, Plus, Search, MessageSquare, LogOut, Calendar, Check, X, Clock, Star, CheckCircle2, Loader2, Send, Megaphone, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ServiceAd, UserRole, Appointment, AppointmentStatus, ChatSession } from '../types';

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

  const handleUpdateAppointmentStatus = async (id: string, status: AppointmentStatus) => {
      await store.updateAppointmentStatus(id, status);
      if (user) {
          const appointment = appointments.find(a => a.id === id);
          if (appointment) {
              try {
                  if (status === 'cancelled') {
                      await store.notifyAppointmentCancelled(appointment, user.name);
                  } else if (status === 'confirmed') {
                      await store.notifyAppointmentConfirmed(appointment, user.name);
                  }
              } catch (e) {
                  console.error("Erro ao notificar mudança de status:", e);
              }
          }
      }
      setAppointments(prev => prev.map(app => app.id === id ? { ...app, status } : app));
  };

  const handleConfirmService = async (app: Appointment) => {
      await store.updateAppointmentStatus(app.id, 'completed');
      setAppointments(prev => prev.map(a => a.id === app.id ? { ...a, status: 'completed' } : a));
      setReviewingApp(app);
      setReviewRating(5);
      setReviewComment('');
      setReviewError('');
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!reviewingApp) return;

      setSubmittingReview(true);
      setReviewError('');
      try {
          await store.addReview(reviewingApp.adId, {
              authorId: user!.id,
              authorName: user!.name,
              rating: reviewRating,
              comment: reviewComment,
          });
          await store.markAppointmentReviewed(reviewingApp.id);
          setAppointments(prev => prev.map(a => a.id === reviewingApp.id ? { ...a, reviewed: true } : a));
          setReviewingApp(null);
          alert("Avaliação publicada com sucesso! Ela já aparece no anúncio do profissional.");
      } catch (err: any) {
          console.error("Erro ao enviar avaliação:", err);
          setReviewError(err.code === '42501'
              ? "Erro de permissão no Supabase (RLS): verifique as políticas da tabela 'reviews'."
              : "Houve um erro ao publicar sua avaliação. Tente novamente.");
      } finally {
          setSubmittingReview(false);
      }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este anúncio?')) {
        await store.deleteAd(id);
        setMyAds(prev => prev.filter(ad => ad.id !== id));
    }
  };

  if (!user) return null;

  const isClient = user.role === UserRole.CLIENT;

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const enquiriesTotal = chats.length;
  const enquiriesNew = chats.reduce((acc, c) => acc + (c.unreadCount || 0), 0);
  const enquiriesWeek = chats.filter(c => new Date(c.updatedAt) >= weekAgo).length;
  const enquiriesResolved = appointments.filter(a => a.status === 'completed').length;

  const apptTotal = appointments.length;
  const apptPending = appointments.filter(a => a.status === 'pending').length;
  const apptConfirmed = appointments.filter(a => a.status === 'confirmed').length;
  const apptCompleted = appointments.filter(a => a.status === 'completed').length;

  const adsTotal = myAds.length;
  const adsPremium = myAds.filter(a => a.isPremium).length;
  const adsCategories = new Set(myAds.map(a => a.category)).size;
  const adsRating = myAds.length ? (myAds.reduce((acc, a) => acc + (a.rating || 0), 0) / myAds.length).toFixed(1) : '0';

  const StatCard: React.FC<{ label: string; value: number | string; icon: React.ComponentType<{ size?: number | string; className?: string }>; color: string }> = ({ label, value, icon: Icon, color }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${color}`}>
        <Icon size={22} />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );

  const SectionHeader: React.FC<{ title: string; to: string; linkText: string }> = ({ title, to, linkText }) => (
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-xl font-bold text-gray-800">{title}</h2>
      <Link to={to} className="text-brand-600 font-medium text-sm hover:underline">{linkText} →</Link>
    </div>
  );

  return (
    <>
    <div className="flex-1 bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col">        
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Meu Painel</h1>
            {!isClient && (
                <Link to="/create-ad" className="bg-brand-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-brand-700">
                    <Plus size={18} className="mr-2" /> Novo Anúncio
                </Link>
            )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Profile */}
            <div className="bg-white rounded-lg shadow p-6 h-fit">
                <div className="flex flex-col items-center">
                    <img src={user.avatar || 'https://via.placeholder.com/100'} alt="Profile" className="w-24 h-24 rounded-full mb-4 object-cover" />
                    <h2 className="text-xl font-bold">{user.name}</h2>
                    <p className="text-gray-500 text-sm mb-4">{user.email}</p>
                    <div className="mb-4 bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full font-medium">
                        {isClient ? 'Cliente' : 'Profissional'}
                    </div>
                    <div className="w-full flex space-x-2">
                        <Link to="/profile/edit" className="flex-1 border border-gray-300 text-gray-700 px-3 py-2 rounded-md flex items-center justify-center hover:bg-gray-50 transition-colors text-sm">
                            <Settings size={16} className="mr-2" /> Editar
                        </Link>
                        <button onClick={handleLogout} className="flex-1 bg-red-50 text-red-600 border border-red-100 px-3 py-2 rounded-md flex items-center justify-center hover:bg-red-100 transition-colors text-sm">
                            <LogOut size={16} className="mr-2" /> Sair
                        </button>
                    </div>
                </div>
                
                <div className="mt-8 border-t border-gray-100 pt-6">
                    <h3 className="font-semibold text-gray-700 mb-4">Menu</h3>
                    <nav className="space-y-1">
                        <Link to="/dashboard/enquiries" className="flex items-center px-3 py-2 rounded-md text-gray-700 hover:bg-brand-50 hover:text-brand-700 transition-colors text-sm font-medium">
                            <MessageSquare size={16} className="mr-3 text-brand-600" /> Minhas Consultas
                        </Link>
                        <Link to="/dashboard/appointments" className="flex items-center px-3 py-2 rounded-md text-gray-700 hover:bg-brand-50 hover:text-brand-700 transition-colors text-sm font-medium">
                            <Calendar size={16} className="mr-3 text-brand-600" /> Meus Agendamentos
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
                {/* Minhas Consultas */}
                <div className="mb-10">
                    <SectionHeader title="Minhas Consultas" to="/dashboard/enquiries" linkText="Ver todas" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard label="Total de Consultas" value={enquiriesTotal} icon={MessageSquare} color="bg-brand-50 text-brand-600" />
                        <StatCard label="Novas Mensagens" value={enquiriesNew} icon={Mail} color="bg-green-50 text-green-600" />
                        <StatCard label="Esta Semana" value={enquiriesWeek} icon={Calendar} color="bg-blue-50 text-blue-600" />
                        <StatCard label="Total Resolvidas" value={enquiriesResolved} icon={CheckCircle2} color="bg-purple-50 text-purple-600" />
                    </div>
                </div>

                {/* Meus Agendamentos */}
                <div className="mb-10">
                    <SectionHeader title="Meus Agendamentos" to="/dashboard/appointments" linkText="Ver todos" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard label="Total de Agendamentos" value={apptTotal} icon={Calendar} color="bg-brand-50 text-brand-600" />
                        <StatCard label="Pendentes" value={apptPending} icon={Clock} color="bg-yellow-50 text-yellow-600" />
                        <StatCard label="Confirmados" value={apptConfirmed} icon={Check} color="bg-green-50 text-green-600" />
                        <StatCard label="Concluídos" value={apptCompleted} icon={CheckCircle2} color="bg-blue-50 text-blue-600" />
                    </div>
                </div>

                {/* Meus Anúncios (apenas profissional) */}
                {!isClient && (
                    <div className="mb-10">
                        <SectionHeader title="Meus Anúncios" to="/dashboard/ads" linkText="Ver todos" />
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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

    {/* Review Modal */}
    {reviewingApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform animate-in slide-in-from-bottom-4 duration-300">
                <div className="bg-indigo-600 p-4 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-white flex items-center tracking-tight">
                        <Star size={20} className="mr-2" /> Avalie o serviço
                    </h3>
                    <button onClick={() => setReviewingApp(null)} className="text-white/80 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmitReview} className="p-4 space-y-3">
                    <p className="text-xs text-gray-600 bg-indigo-50 p-2.5 rounded-lg border border-indigo-100">
                        <strong>{reviewingApp.adTitle}</strong> — {new Date(reviewingApp.date).toLocaleDateString()} às {reviewingApp.time} com {reviewingApp.providerName}.
                    </p>

                    {reviewError && (
                        <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-2.5 rounded-lg">
                            {reviewError}
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Qual sua nota para este serviço?</label>
                        <div className="flex gap-1.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                                <button
                                    key={s}
                                    type="button"
                                    onClick={() => setReviewRating(s)}
                                    className={`p-1.5 rounded-lg border transition-all ${reviewRating >= s ? 'bg-yellow-50 border-yellow-300 text-yellow-600' : 'bg-white border-gray-200 text-gray-300'}`}
                                >
                                    <Star size={22} className={reviewRating >= s ? 'fill-current' : ''} />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Comentário</label>
                        <textarea
                            placeholder="Como foi o atendimento? Recomendaria?"
                            className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            rows={3}
                            value={reviewComment}
                            onChange={(e) => setReviewComment(e.target.value)}
                            required
                        />
                    </div>

                    <div className="pt-2 flex gap-3">
                        <button
                            type="button"
                            onClick={() => setReviewingApp(null)}
                            className="flex-1 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-bold text-sm transition-colors"
                        >
                            Agora não
                        </button>
                        <button
                            type="submit"
                            disabled={submittingReview}
                            className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-bold text-sm shadow-lg transition-all flex items-center justify-center disabled:opacity-50"
                        >
                            {submittingReview ? <Loader2 className="animate-spin mr-2" size={16} /> : <Send size={16} className="mr-2" />}
                            {submittingReview ? 'Enviando...' : 'Publicar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )}
  </>
  );
};

export default Dashboard;
