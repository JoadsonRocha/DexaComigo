import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Check, X, Clock, CheckCircle2, MapPin, Star, Loader2, Send, List, LayoutGrid, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { store, supabase } from '../services/store';
import { Appointment, AppointmentStatus, UserRole } from '../types';
import { useToast } from '../context/ToastContext';

const Appointments: React.FC = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<'list' | 'grid'>('list');
  const [showHistory, setShowHistory] = useState(false);

  const [reviewingApp, setReviewingApp] = useState<Appointment | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate('/login');
      return;
    }

    const load = async () => {
      try {
        const data = await store.getMyAppointments(user.id, user.role);
        setAppointments(data);
      } catch (e) {
        console.error("Erro ao carregar agendamentos:", e);
        toast('Não foi possível carregar seus agendamentos.', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    load();

    const roleField = user.role === UserRole.CLIENT ? 'client_id' : 'provider_id';
    const channel = supabase
      .channel('appointments-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments', filter: `${roleField}=eq.${user.id}` }, () => {
        load();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, loading]);

  if (loading || isLoading) {
    return (
      <div className="flex-1 bg-gray-50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center p-20">
          <Clock className="animate-spin text-brand-600" size={32} />
        </div>
      </div>
    );
  }

  const isClient = user?.role === UserRole.CLIENT;

  const handleUpdateStatus = async (id: string, status: AppointmentStatus) => {
    try {
      await store.updateAppointmentStatus(id, status);
      setAppointments(prev => prev.map(app => app.id === id ? { ...app, status } : app));
      toast(status === 'cancelled' ? 'Agendamento cancelado.' : 'Agendamento confirmado.', 'success');
    } catch (e) {
      console.error("Erro ao atualizar agendamento:", e);
      toast('Não foi possível atualizar o agendamento.', 'error');
    }
  };

  const handleConfirmService = async (app: Appointment) => {
    try {
      await store.updateAppointmentStatus(app.id, 'completed');
      setAppointments(prev => prev.map(a => a.id === app.id ? { ...a, status: 'completed' } : a));
      setReviewingApp(app);
      setReviewRating(5);
      setReviewComment('');
      setReviewError('');
    } catch (e) {
      console.error("Erro ao concluir serviço:", e);
      toast('Não foi possível concluir o serviço.', 'error');
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingApp || !user) return;

    setSubmittingReview(true);
    setReviewError('');
    try {
      await store.addReview(reviewingApp.adId, {
        authorId: user.id,
        authorName: user.name,
        rating: reviewRating,
        comment: reviewComment,
      });
      await store.markAppointmentReviewed(reviewingApp.id);
      setAppointments(prev => prev.map(a => a.id === reviewingApp.id ? { ...a, reviewed: true } : a));
      setReviewingApp(null);
      toast('Avaliação publicada com sucesso! Ela já aparece no anúncio do profissional.', 'success');
    } catch (err: any) {
      console.error("Erro ao enviar avaliação:", err);
      setReviewError(err.code === '42501'
        ? "Erro de permissão no Supabase (RLS): verifique as políticas da tabela 'reviews'."
        : "Houve um erro ao publicar sua avaliação. Tente novamente.");
      toast('Não foi possível publicar a avaliação.', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  const statusLabel = (status: AppointmentStatus) =>
    status === 'pending' ? 'Aguardando Confirmação' :
    status === 'confirmed' ? 'Confirmado' :
    status === 'completed' ? 'Concluído' : 'Cancelado';

  const statusBadge = (status: AppointmentStatus) => `px-2 py-0.5 rounded text-xs font-bold uppercase ${
    status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
    status === 'confirmed' ? 'bg-green-100 text-green-700' :
    status === 'completed' ? 'bg-blue-100 text-blue-700' :
    'bg-red-100 text-red-700'
  }`;

  const renderActions = (app: Appointment) => {
    return (
      <>
        {isClient && app.status === 'confirmed' && (
          <button
            onClick={() => handleConfirmService(app)}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center justify-center transition-colors"
          >
            <CheckCircle2 size={16} className="mr-1" /> Confirmar serviço realizado
          </button>
        )}

        {isClient && app.status === 'completed' && !app.reviewed && (
          <div className="flex flex-col gap-1 items-start sm:items-end">
            <span className="text-xs text-gray-500 flex items-center">
              <Star size={13} className="mr-1 text-yellow-500" /> Serviço concluído
            </span>
            <button
              onClick={() => { setReviewingApp(app); setReviewRating(5); setReviewComment(''); setReviewError(''); }}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center justify-center transition-colors"
            >
              <Star size={16} className="mr-1" /> Avaliar serviço
            </button>
          </div>
        )}

        {isClient && app.status === 'completed' && app.reviewed && (
          <span className="text-xs text-green-600 flex items-center">
            <CheckCircle2 size={13} className="mr-1" /> Avaliado
          </span>
        )}

        {!isClient && app.status === 'pending' && (
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => handleUpdateStatus(app.id, 'confirmed')}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center justify-center transition-colors"
            >
              <Check size={16} className="mr-1" /> Confirmar
            </button>
            <button
              onClick={() => handleUpdateStatus(app.id, 'cancelled')}
              className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg text-sm font-bold flex items-center justify-center transition-colors"
            >
              <X size={16} className="mr-1" /> Recusar
            </button>
          </div>
        )}

        {!isClient && app.status === 'confirmed' && (
          <button
            onClick={() => handleUpdateStatus(app.id, 'completed')}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center justify-center transition-colors"
          >
            <CheckCircle2 size={16} className="mr-1" /> Concluir serviço
          </button>
        )}
      </>
    );
  };

  const total = appointments.length;
  const pending = appointments.filter(a => a.status === 'pending').length;
  const confirmed = appointments.filter(a => a.status === 'confirmed').length;
  const completed = appointments.filter(a => a.status === 'completed').length;
  const cancelled = appointments.filter(a => a.status === 'cancelled').length;

  const active = appointments.filter(a => a.status === 'pending' || a.status === 'confirmed');
  const archived = appointments.filter(a => a.status === 'completed' || a.status === 'cancelled');
  const historyOpen = showHistory || active.length === 0;

  const stats = [
    { label: 'Total de Agendamentos', value: total, icon: Calendar, color: 'bg-brand-50 text-brand-600' },
    { label: 'Pendentes', value: pending, icon: Clock, color: 'bg-yellow-50 text-yellow-600' },
    { label: 'Confirmados', value: confirmed, icon: CheckCircle2, color: 'bg-green-50 text-green-600' },
    { label: 'Concluídos', value: completed, icon: CheckCircle2, color: 'bg-blue-50 text-blue-600' },
    { label: 'Cancelados', value: cancelled, icon: X, color: 'bg-red-50 text-red-600' },
  ];

  const renderAppointments = (items: Appointment[]) => (
    view === 'list' ? (
      <ul className="divide-y divide-gray-100">
        {items.map(app => (
          <li key={app.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={statusBadge(app.status)}>{statusLabel(app.status)}</span>
                <span className="text-sm text-gray-500 flex items-center"><Calendar size={14} className="mr-1"/> {new Date(app.date).toLocaleDateString('pt-BR')} às {app.time}</span>
              </div>
              <h4 className="font-bold text-gray-900">{app.adTitle}</h4>
              <p className="text-sm text-gray-600 mt-1">
                {isClient
                  ? <>Profissional: <span className="font-medium text-brand-600">{app.providerName}</span></>
                  : <>Cliente: <span className="font-medium text-brand-600">{app.clientName}</span></>}
              </p>
              {app.clientLocation && (
                <p className="text-sm text-gray-600 flex items-center mt-1"><MapPin size={14} className="mr-1 text-gray-400"/> {app.clientLocation}</p>
              )}
              {app.notes && <p className="text-xs text-gray-500 mt-2 bg-gray-50 p-2 rounded">Obs: {app.notes}</p>}
            </div>

            {renderActions(app)}
          </li>
        ))}
      </ul>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-5">
        {items.map(app => (
          <div key={app.id} className="border border-gray-100 rounded-xl p-4 flex flex-col gap-3 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <span className={statusBadge(app.status)}>{statusLabel(app.status)}</span>
              <span className="text-xs text-gray-500 flex items-center whitespace-nowrap"><Calendar size={14} className="mr-1"/> {new Date(app.date).toLocaleDateString('pt-BR')} às {app.time}</span>
            </div>
            <h4 className="font-bold text-gray-900">{app.adTitle}</h4>
            <p className="text-sm text-gray-600">
              {isClient
                ? <>Profissional: <span className="font-medium text-brand-600">{app.providerName}</span></>
                : <>Cliente: <span className="font-medium text-brand-600">{app.clientName}</span></>}
            </p>
            {app.clientLocation && (
              <p className="text-sm text-gray-600 flex items-center"><MapPin size={14} className="mr-1 text-gray-400"/> {app.clientLocation}</p>
            )}
            {app.notes && <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded">Obs: {app.notes}</p>}
            <div className="mt-auto flex flex-col gap-2">{renderActions(app)}</div>
          </div>
        ))}
      </div>
    )
  );

  return (
    <>
    <div className="h-full p-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Meus Agendamentos</h1>
          <div className="flex items-center bg-white border border-gray-200 rounded-lg p-0.5 shadow-sm">
            <button
              onClick={() => setView('list')}
              className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${view === 'list' ? 'bg-brand-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              title="Vista em lista"
            >
              <List size={16} className="mr-1.5" /> Lista
            </button>
            <button
              onClick={() => setView('grid')}
              className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${view === 'grid' ? 'bg-brand-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              title="Vista em grade"
            >
              <LayoutGrid size={16} className="mr-1.5" /> Grid
            </button>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
          {stats.map(stat => (
            <div key={stat.label} className="bg-white rounded-xl shadow-sm border border-gray-100 px-4 py-3 flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${stat.color}`}>
                <stat.icon size={18} />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900 leading-tight">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Appointments List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">Seus Agendamentos</h2>
          </div>

          {appointments.length === 0 ? (
            <div className="p-10 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar size={28} className="text-gray-400" />
              </div>
              <p className="text-gray-500">Nenhum agendamento ainda.</p>
              <p className="text-gray-400 text-sm mt-1">Quando você tiver serviços agendados, eles aparecerão aqui.</p>
            </div>
          ) : (
            <>
              {active.length > 0 && (
                <div className="px-5 py-3 bg-brand-50/60 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Em aberto</h3>
                  <span className="text-xs text-gray-500">{active.length} agendamento(s)</span>
                </div>
              )}
              {active.length > 0 && renderAppointments(active)}

              {archived.length > 0 && (
                <>
                  <button
                    onClick={() => setShowHistory(!showHistory)}
                    className="w-full px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between hover:bg-gray-100 transition-colors"
                  >
                    <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Concluídos e Cancelados</h3>
                    <span className="flex items-center gap-2 text-xs text-gray-500">
                      {archived.length} <ChevronDown size={16} className={`transition-transform ${historyOpen ? 'rotate-180' : ''}`} />
                    </span>
                  </button>
                  {historyOpen && renderAppointments(archived)}
                </>
              )}
            </>
          )}
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
              <strong>{reviewingApp.adTitle}</strong> — {new Date(reviewingApp.date).toLocaleDateString('pt-BR')} às {reviewingApp.time} com {reviewingApp.providerName}.
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
};export default Appointments;
