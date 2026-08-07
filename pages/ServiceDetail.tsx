
// Add React import to resolve namespace errors for FC and FormEvent
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapPin, MessageCircle, Star, Shield, Clock, Calendar, MessageSquare, CalendarCheck, X, Send, AlertTriangle, Loader2, CheckCircle } from 'lucide-react';
import { store } from '../services/store';
import { ServiceAd, Review } from '../types';
import { RatingStars, Badge } from '../components/UI';
import { useAuth } from '../context/AuthContext';

const ServiceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [ad, setAd] = useState<ServiceAd | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [submittingReview, setSubmittingReview] = useState(false);
  
  // Reviews State
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [reviewError, setReviewError] = useState('');

  // Scheduling State
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleData, setScheduleData] = useState({ date: '', time: '', notes: '' });
  const [isScheduling, setIsScheduling] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const loadAd = async () => {
      if (id) {
          const found = await store.getAdById(id);
          setAd(found || undefined);
      }
      setLoading(false);
    };
    loadAd();
  }, [id]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20">
      <Loader2 className="animate-spin text-brand-600 mb-4" size={40} />
      <p className="text-gray-500">Carregando detalhes do serviço...</p>
    </div>
  );
  
  if (!ad) return (
    <div className="p-10 text-center flex flex-col items-center">
      <AlertTriangle className="text-yellow-500 mb-4" size={48} />
      <h2 className="text-2xl font-bold mb-2">Serviço não encontrado</h2>
      <Link to="/" className="text-brand-600 font-semibold hover:underline">Voltar para a página inicial</Link>
    </div>
  );

  const handleContact = () => {
      const message = `Olá, vi seu anúncio "${ad.title}" no Dexacomigo e gostaria de mais informações.`;
      const url = `https://wa.me/${ad.whatsapp}?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank');
  };

  const handleInternalChat = async () => {
      if (!user) {
          navigate('/login');
          return;
      }
      if (user.id === ad.providerId) {
          alert("Você não pode iniciar um chat com seu próprio anúncio.");
          return;
      }

      try {
        const chatId = await store.startChat(user.id, ad.providerId, ad.id, ad.title);
        navigate(`/chat/${chatId}`);
      } catch (e: any) {
        alert("Erro ao iniciar chat. Verifique as permissões de banco de dados (RLS).");
      }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!user) {
          navigate('/login');
          return;
      }
      if (user.id === ad.providerId) {
          setReviewError("Você não pode avaliar seu próprio serviço.");
          return;
      }

      setSubmittingReview(true);
      setReviewError('');

      try {
        const reviewData: Omit<Review, 'id' | 'date'> = {
            authorId: user.id,
            authorName: user.name,
            rating: newReview.rating,
            comment: newReview.comment,
        };

        await store.addReview(ad.id, reviewData);
        
        // Refresh ad data to show new review
        const updatedAd = await store.getAdById(ad.id);
        if (updatedAd) setAd(updatedAd);
        
        setNewReview({ rating: 5, comment: '' });
        alert("Avaliação publicada com sucesso!");
      } catch (err: any) {
        console.error("Erro ao enviar avaliação:", err);
        if (err.code === '42501') {
            setReviewError("Erro de permissão no Supabase (RLS): A tabela 'reviews' não permite inserção via chave pública. Verifique o console ou as instruções no store.ts.");
        } else {
            setReviewError("Houve um erro ao publicar sua avaliação. Tente novamente.");
        }
      } finally {
        setSubmittingReview(false);
      }
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!user) {
          navigate('/login');
          return;
      }

      setIsScheduling(true);
      try {
        const formattedDate = new Date(scheduleData.date).toLocaleDateString('pt-BR');
        const message = `📅 *SOLICITAÇÃO DE AGENDAMENTO*\n\nOlá, gostaria de agendar um serviço:\n\n🗓️ Data: ${formattedDate}\n⏰ Horário: ${scheduleData.time}\n📝 Observações: ${scheduleData.notes || 'Nenhuma'}\n\nPodemos confirmar?`;

        const chatId = await store.startChat(user.id, ad.providerId, ad.id, ad.title);
        await store.sendMessage(chatId, user.id, message);
        
        setShowScheduleModal(false);
        navigate(`/chat/${chatId}`);
      } catch (e: any) {
        alert("Não foi possível solicitar o agendamento. Tente novamente mais tarde.");
      } finally {
        setIsScheduling(false);
      }
  };

  return (
    <div className="flex-1 bg-gray-50 pb-12 relative">
      {/* Header Image */}
      <div className="bg-gray-900 h-64 md:h-80 w-full relative">
        <img src={ad.images[0]} className="w-full h-full object-cover opacity-60" alt={ad.title} />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                    <Badge variant="primary">{ad.category}</Badge>
                    {ad.isPremium && <Badge variant="secondary">Destaque</Badge>}
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{ad.title}</h1>
                <div className="flex items-center text-gray-300 text-sm">
                    <MapPin size={16} className="mr-1" /> {ad.location}
                    <span className="mx-2">•</span>
                    <RatingStars rating={ad.rating} />
                    <span className="ml-1">({ad.reviewCount} avaliações)</span>
                </div>
            </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Sobre o Serviço</h2>
                    <div className="prose text-gray-600 whitespace-pre-line leading-relaxed">
                        {ad.description}
                    </div>
                </div>

                {ad.images.length > 1 && (
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Galeria de Fotos</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {ad.images.map((img, idx) => (
                                <img key={idx} src={img} alt={`Foto ${idx+1}`} className="rounded-lg w-full h-40 object-cover border border-gray-100 shadow-sm hover:scale-105 transition-transform" />
                            ))}
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Avaliações</h2>
                    
                    {/* Review Form */}
                    {user && user.id !== ad.providerId && (
                        <form onSubmit={handleSubmitReview} className="mb-8 bg-gray-50 p-6 rounded-xl border border-gray-200">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                <Star size={20} className="mr-2 text-yellow-500 fill-current" /> Conte sua experiência
                            </h3>
                            
                            {reviewError && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm flex items-start">
                                    <AlertTriangle size={16} className="mr-2 mt-0.5 flex-shrink-0" />
                                    <span>{reviewError}</span>
                                </div>
                            )}

                            <div className="mb-4">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Qual sua nota para este serviço?</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <button
                                            key={s}
                                            type="button"
                                            onClick={() => setNewReview(prev => ({...prev, rating: s}))}
                                            className={`p-2 rounded-lg border transition-all ${newReview.rating >= s ? 'bg-yellow-50 border-yellow-300 text-yellow-600' : 'bg-white border-gray-200 text-gray-300'}`}
                                        >
                                            <Star size={24} className={newReview.rating >= s ? 'fill-current' : ''} />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Comentário</label>
                                <textarea 
                                    placeholder="Como foi o atendimento? O profissional foi pontual? Recomendaria?" 
                                    className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                                    rows={3}
                                    value={newReview.comment}
                                    onChange={(e) => setNewReview(prev => ({...prev, comment: e.target.value}))}
                                    required
                                />
                            </div>
                            
                            <button 
                                type="submit" 
                                disabled={submittingReview}
                                className="w-full sm:w-auto bg-brand-600 text-white px-6 py-2.5 rounded-lg hover:bg-brand-700 font-bold flex items-center justify-center transition-colors disabled:opacity-50"
                            >
                                {submittingReview ? (
                                    <>
                                        <Loader2 className="animate-spin mr-2" size={18} /> Enviando...
                                    </>
                                ) : (
                                    <>
                                        <Send size={18} className="mr-2" /> Publicar Avaliação
                                    </>
                                )}
                            </button>
                        </form>
                    )}

                    {!user && (
                        <div className="mb-8 p-4 bg-brand-50 rounded-lg border border-brand-100 text-center">
                            <p className="text-brand-800 text-sm">
                                <Link to="/login" className="font-bold underline">Faça login</Link> para deixar uma avaliação para este profissional.
                            </p>
                        </div>
                    )}

                    {ad.reviews.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-400 italic">Este profissional ainda não recebeu nenhuma avaliação escrita.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {ad.reviews.map(review => (
                                <div key={review.id} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0 group">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center text-brand-700 font-bold text-sm mr-3 shadow-sm">
                                                {review.authorName.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">{review.authorName}</p>
                                                <p className="text-xs text-gray-400">{new Date(review.date).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <RatingStars rating={review.rating} size={14} />
                                    </div>
                                    <p className="text-gray-600 text-sm mt-2 leading-relaxed">{review.comment}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Sidebar / CTA */}
            <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-24 border-t-4 border-brand-500">
                    <div className="flex items-center justify-between mb-6">
                        <span className="text-gray-500 text-sm font-medium">Investimento</span>
                        <div className="text-right">
                             <span className="text-3xl font-extrabold text-gray-900">
                                {ad.price === 0 ? 'A combinar' : `R$ ${ad.price}`}
                            </span>
                            {ad.price > 0 && <div className="text-xs text-gray-400">por {ad.priceUnit === 'hour' ? 'hora' : 'serviço'}</div>}
                        </div>
                    </div>

                    <div className="space-y-4 mb-6">
                        {user?.id === ad.providerId ? (
                            <>
                                <button 
                                    onClick={() => navigate(`/edit-ad/${ad.id}`)}
                                    className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg flex items-center justify-center transition-all"
                                >
                                    Editar Meu Anúncio
                                </button>
                                <button 
                                    onClick={() => navigate('/chat')}
                                    className="w-full bg-brand-50 text-brand-700 hover:bg-brand-100 font-bold py-3.5 px-4 rounded-xl border border-brand-200 flex items-center justify-center transition-all"
                                >
                                    Ver Minhas Mensagens
                                </button>
                            </>
                        ) : (
                            <>
                                <button 
                                    onClick={() => {
                                        if (!user) { navigate('/login'); return; }
                                        setShowScheduleModal(true);
                                    }}
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg flex items-center justify-center transition-all transform active:scale-95"
                                >
                                    <CalendarCheck className="mr-2" size={20} /> Solicitar Agendamento
                                </button>

                                <button 
                                    onClick={handleInternalChat}
                                    className="w-full bg-brand-50 text-brand-700 hover:bg-brand-100 font-bold py-3.5 px-4 rounded-xl border border-brand-200 flex items-center justify-center transition-all"
                                >
                                    <MessageSquare className="mr-2" size={20} /> Chat no App
                                </button>
                                
                                <button 
                                    onClick={handleContact}
                                    className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg flex items-center justify-center transition-all"
                                >
                                    <MessageCircle className="mr-2" size={20} /> WhatsApp Direto
                                </button>
                            </>
                        )}
                    </div>

                    <div className="border-t border-gray-100 pt-6">
                        <div className="flex items-center mb-5">
                            <div className="w-14 h-14 bg-gray-100 rounded-full flex-shrink-0 mr-4 overflow-hidden border-2 border-brand-100">
                                {ad.providerId === 'u1' ? <img src="https://picsum.photos/100/100?random=1" className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center text-brand-600 font-bold text-xl">{ad.providerName.charAt(0)}</div>}
                            </div>
                            <div>
                                <p className="font-bold text-gray-900 text-lg leading-tight">{ad.providerName}</p>
                                <p className="text-xs text-gray-500 flex items-center mt-1">
                                    {ad.isCertified ? (
                                        <><CheckCircle size={12} className="mr-1 text-brand-500"/> Profissional Certificada Mais Beleza</>
                                    ) : (
                                        'Profissional Mais Beleza'
                                    )}
                                </p>
                            </div>
                        </div>
                        
                        <div className="space-y-3 text-sm text-gray-600 bg-gray-50 p-4 rounded-xl">
                             {ad.isCertified && <div className="flex items-center"><Shield size={16} className="mr-3 text-green-500"/> Identidade Verificada</div>}
                             <div className="flex items-center"><Clock size={16} className="mr-3 text-indigo-500"/> Responde em poucos minutos</div>
                             <div className="flex items-center"><Calendar size={16} className="mr-3 text-orange-500"/> {ad.availability || 'Consultar disponibilidade'}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Appointment Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform animate-in slide-in-from-bottom-4 duration-300">
                <div className="bg-indigo-600 p-5 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-white flex items-center tracking-tight">
                        <CalendarCheck size={22} className="mr-2" /> Agendar Serviço
                    </h3>
                    <button onClick={() => setShowScheduleModal(false)} className="text-white/80 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>
                
                <form onSubmit={handleScheduleSubmit} className="p-6 space-y-4">
                    <p className="text-sm text-gray-600 mb-4 bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                        Seu pedido será enviado via chat para <strong>{ad.providerName}</strong>.
                    </p>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Qual o melhor dia?</label>
                        <input 
                            type="date" 
                            required
                            className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={scheduleData.date}
                            onChange={(e) => setScheduleData(prev => ({...prev, date: e.target.value}))}
                            min={new Date().toISOString().split('T')[0]}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Qual o horário?</label>
                        <input 
                            type="time" 
                            required
                            className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={scheduleData.time}
                            onChange={(e) => setScheduleData(prev => ({...prev, time: e.target.value}))}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Alguma observação?</label>
                        <textarea 
                            className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                            rows={3}
                            placeholder="Descreva brevemente o que precisa ser feito..."
                            value={scheduleData.notes}
                            onChange={(e) => setScheduleData(prev => ({...prev, notes: e.target.value}))}
                        />
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button 
                            type="button" 
                            onClick={() => setShowScheduleModal(false)}
                            className="flex-1 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-bold transition-colors"
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit" 
                            disabled={isScheduling}
                            className="flex-1 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-bold shadow-lg transition-all flex items-center justify-center disabled:opacity-50"
                        >
                            {isScheduling ? <Loader2 className="animate-spin mr-2" size={18} /> : null}
                            {isScheduling ? 'Enviando...' : 'Confirmar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}

    </div>
  );
};

export default ServiceDetail;
