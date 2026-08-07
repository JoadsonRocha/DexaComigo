import React, { useEffect, useState } from 'react';
import { store } from '../services/store';
import { ServiceCard } from '../components/UI';
import { Link, useNavigate } from 'react-router-dom';
import { Settings, Plus, Trash2, Search, MessageSquare, LogOut, Calendar, Check, X, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ServiceAd, UserRole, Appointment, AppointmentStatus } from '../types';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [unreadCount, setUnreadCount] = useState(0);

  const handleLogout = async () => {
      navigate('/');
      await logout();
  };
  const [myAds, setMyAds] = useState<ServiceAd[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const loadAppointments = async (userId: string, role: UserRole) => {
      const data = await store.getMyAppointments(userId, role);
      setAppointments(data);
  };

  useEffect(() => {
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
    };
    loadData();
    } else {
        const loadClientData = async () => {
            const unread = await store.getGlobalUnreadCount(user.id);
            setUnreadCount(unread);
            await loadAppointments(user.id, user.role);
        };
        loadClientData();
    }
  }, [user, navigate]);

  const handleUpdateAppointmentStatus = async (id: string, status: AppointmentStatus) => {
      await store.updateAppointmentStatus(id, status);
      setAppointments(prev => prev.map(app => app.id === id ? { ...app, status } : app));
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este anúncio?')) {
        await store.deleteAd(id);
        setMyAds(prev => prev.filter(ad => ad.id !== id));
    }
  };

  if (!user) return null;

  const isClient = user.role === UserRole.CLIENT;

  return (
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
                
                {!isClient && (
                    <div className="mt-8 border-t border-gray-100 pt-6">
                        <h3 className="font-semibold text-gray-700 mb-4">Plano Atual</h3>
                        <div className="bg-brand-50 p-4 rounded-md border border-brand-100">
                            <div className="text-brand-800 font-bold">Gratuito</div>
                            <div className="text-xs text-brand-600 mt-1">Limite de 2 anúncios ativos.</div>
                            <button className="mt-3 text-xs bg-brand-600 text-white px-3 py-1 rounded w-full hover:bg-brand-700 transition-colors">Fazer Upgrade</button>
                        </div>
                    </div>
                )}
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-3">
                
                {isClient ? (
                    // CLIENT DASHBOARD
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 mb-6">O que você deseja fazer hoje?</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Link to="/search" className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group flex flex-col items-center text-center">
                                <div className="w-16 h-16 bg-brand-50 text-brand-600 rounded-full flex items-center justify-center mb-4 group-hover:bg-brand-100 transition-colors">
                                    <Search size={32} />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">Buscar Serviços</h3>
                                <p className="text-gray-500 text-sm">Encontre as melhores profissionais de beleza perto de você para atendimento em domicílio.</p>
                            </Link>

                            <Link to="/chat" className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group flex flex-col items-center text-center">
                                <div className="relative">
                                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                                        <MessageSquare size={32} />
                                    </div>
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 flex h-4 w-4">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500 border-2 border-white"></span>
                                        </span>
                                    )}
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">Minhas Mensagens</h3>
                                <p className="text-gray-500 text-sm">Acompanhe suas conversas e agendamentos com as profissionais.</p>
                            </Link>
                        </div>
                        
                        {/* Agendamentos Cliente */}
                        <div className="mt-8">
                            <h2 className="text-xl font-bold text-gray-800 mb-6">Meus Agendamentos</h2>
                            {appointments.length === 0 ? (
                                <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                                    Você ainda não tem serviços agendados.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {appointments.map(app => (
                                        <div key={app.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                                                        app.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                        app.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                                        app.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-red-100 text-red-700'
                                                    }`}>
                                                        {app.status === 'pending' ? 'Aguardando Confirmação' :
                                                         app.status === 'confirmed' ? 'Confirmado' :
                                                         app.status === 'completed' ? 'Concluído' : 'Cancelado'}
                                                    </span>
                                                    <span className="text-sm text-gray-500 flex items-center"><Calendar size={14} className="mr-1"/> {new Date(app.date).toLocaleDateString()} às {app.time}</span>
                                                </div>
                                                <h4 className="font-bold text-gray-900">{app.adTitle}</h4>
                                                <p className="text-sm text-gray-600 mt-1">Profissional: <span className="font-medium text-brand-600">{app.providerName}</span></p>
                                                {app.notes && <p className="text-xs text-gray-500 mt-2 bg-gray-50 p-2 rounded">Obs: {app.notes}</p>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    // PROVIDER DASHBOARD
                    <div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <Link to="/create-ad" className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group flex items-center">
                                <div className="w-12 h-12 bg-brand-50 text-brand-600 rounded-full flex items-center justify-center mr-4 group-hover:bg-brand-100 transition-colors">
                                    <Plus size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">Novo Anúncio</h3>
                                    <p className="text-gray-500 text-xs mt-1">Oferecer um novo serviço</p>
                                </div>
                            </Link>

                            <Link to="/chat" className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group flex items-center">
                                <div className="relative mr-4">
                                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                                        <MessageSquare size={24} />
                                    </div>
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 border-2 border-white"></span>
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">Minhas Mensagens</h3>
                                    <p className="text-gray-500 text-xs mt-1">Responder clientes e agendamentos</p>
                                </div>
                            </Link>
                        </div>

                        {/* Agendamentos Profissional */}
                        <div className="mb-8">
                            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                                Agendamentos Solicitados
                                {appointments.filter(a => a.status === 'pending').length > 0 && (
                                    <span className="ml-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                        {appointments.filter(a => a.status === 'pending').length} novos
                                    </span>
                                )}
                            </h2>
                            
                            {appointments.length === 0 ? (
                                <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500 border border-dashed border-gray-200">
                                    Nenhum agendamento no momento.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {appointments.map(app => (
                                        <div key={app.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                                                        app.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                        app.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                                        app.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-red-100 text-red-700'
                                                    }`}>
                                                        {app.status === 'pending' ? 'Pendente' :
                                                         app.status === 'confirmed' ? 'Confirmado' :
                                                         app.status === 'completed' ? 'Concluído' : 'Cancelado'}
                                                    </span>
                                                    <span className="text-sm text-gray-500 flex items-center"><Calendar size={14} className="mr-1"/> {new Date(app.date).toLocaleDateString()} às {app.time}</span>
                                                </div>
                                                <h4 className="font-bold text-gray-900">{app.adTitle}</h4>
                                                <div className="flex items-center gap-2 mt-2">
                                                    {app.clientAvatar ? (
                                                        <img src={app.clientAvatar} alt={app.clientName} className="w-6 h-6 rounded-full object-cover" />
                                                    ) : (
                                                        <div className="w-6 h-6 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center text-xs font-bold">
                                                            {app.clientName?.charAt(0) || 'U'}
                                                        </div>
                                                    )}
                                                    <p className="text-sm text-gray-600">Cliente: <span className="font-medium text-brand-600">{app.clientName}</span></p>
                                                </div>
                                                {app.notes && <p className="text-xs text-gray-500 mt-2 bg-gray-50 p-2 rounded">Obs: {app.notes}</p>}
                                            </div>
                                            
                                            {app.status === 'pending' && (
                                                <div className="flex flex-col sm:flex-row gap-2 mt-4 md:mt-0">
                                                    <button 
                                                        onClick={() => handleUpdateAppointmentStatus(app.id, 'confirmed')}
                                                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center justify-center transition-colors"
                                                    >
                                                        <Check size={16} className="mr-1" /> Confirmar
                                                    </button>
                                                    <button 
                                                        onClick={() => handleUpdateAppointmentStatus(app.id, 'cancelled')}
                                                        className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg text-sm font-bold flex items-center justify-center transition-colors"
                                                    >
                                                        <X size={16} className="mr-1" /> Recusar
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <h2 className="text-xl font-bold text-gray-800 mb-6">Meus Anúncios ({myAds.length})</h2>
                        {myAds.length === 0 ? (
                            <div className="bg-white rounded-lg shadow p-10 text-center">
                                <p className="text-gray-500 mb-4">Comece a gerar renda e autonomia. Crie seu primeiro anúncio de beleza em domicílio agora!</p>
                                <Link to="/create-ad" className="text-brand-600 font-medium hover:underline">Começar agora</Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {myAds.map(ad => (
                                    <div key={ad.id} className="relative group">
                                        <ServiceCard ad={ad} />
                                        <div className="absolute top-2 left-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Link to={`/edit-ad/${ad.id}`} className="bg-white/90 text-gray-800 text-xs px-2 py-1 rounded shadow hover:bg-white font-medium">Editar</Link>
                                            <button 
                                                onClick={(e) => { e.preventDefault(); handleDelete(ad.id); }}
                                                className="bg-red-500/90 text-white text-xs px-2 py-1 rounded shadow hover:bg-red-600 flex items-center"
                                            >
                                                <Trash2 size={12} className="mr-1" /> Excluir
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
