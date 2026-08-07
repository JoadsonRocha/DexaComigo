import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MessageSquare, Mail, Calendar, CheckCircle2, ArrowLeft, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { store } from '../services/store';
import { ChatSession, Appointment } from '../types';

const Enquiries: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [chats, setChats] = useState<ChatSession[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate('/login');
      return;
    }

    const load = async () => {
      try {
        const userChats = await store.getChats(user.id);
        const userAppointments = await store.getMyAppointments(user.id, user.role);
        setChats(userChats);
        setAppointments(userAppointments);
      } catch (e) {
        console.error("Erro ao carregar consultas:", e);
      } finally {
        setIsLoading(false);
      }
    };
    load();
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

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const totalEnquiries = chats.length;
  const newMessages = chats.reduce((acc, c) => acc + (c.unreadCount || 0), 0);
  const thisWeek = chats.filter(c => new Date(c.updatedAt) >= weekAgo).length;
  const totalResolved = appointments.filter(a => a.status === 'completed').length;

  const stats = [
    { label: 'Total de Consultas', value: totalEnquiries, icon: MessageSquare, color: 'bg-brand-50 text-brand-600' },
    { label: 'Novas Mensagens', value: newMessages, icon: Mail, color: 'bg-green-50 text-green-600' },
    { label: 'Esta Semana', value: thisWeek, icon: Calendar, color: 'bg-blue-50 text-blue-600' },
    { label: 'Total Resolvidas', value: totalResolved, icon: CheckCircle2, color: 'bg-purple-50 text-purple-600' },
  ];

  return (
    <div className="flex-1 bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <button onClick={() => navigate('/dashboard')} className="mr-3 text-gray-500 hover:text-gray-700">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Minhas Consultas</h1>
              <p className="text-gray-500 mt-1">Acompanhe e gerencie todas as suas mensagens recebidas</p>
            </div>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map(stat => (
            <div key={stat.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${stat.color}`}>
                <stat.icon size={22} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Enquiries List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">Conversas</h2>
          </div>

          {chats.length === 0 ? (
            <div className="p-10 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare size={28} className="text-gray-400" />
              </div>
              <p className="text-gray-500">Nenhuma consulta recebida ainda.</p>
              <p className="text-gray-400 text-sm mt-1">Quando alguém iniciar uma conversa com você, ela aparecerá aqui.</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {chats.map(chat => (
                <li key={chat.id}>
                  <Link to={`/chat/${chat.id}`} className="flex items-center justify-between p-5 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center flex-1 min-w-0">
                      {chat.otherUserName ? (
                        <div className="w-10 h-10 bg-brand-600 text-white rounded-full flex items-center justify-center font-bold mr-3 flex-shrink-0">
                          {chat.otherUserName.charAt(0).toUpperCase()}
                        </div>
                      ) : (
                        <div className="w-10 h-10 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                          <MessageSquare size={18} />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-gray-900 truncate">{chat.otherUserName || 'Usuário'}</p>
                          <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                            {new Date(chat.updatedAt).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        <p className="text-xs text-brand-600 font-medium mt-0.5">{chat.adTitle}</p>
                        <p className={`text-sm mt-0.5 truncate ${chat.unreadCount ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>
                          {chat.lastMessage || 'Nenhuma mensagem.'}
                        </p>
                      </div>
                    </div>
                    {chat.unreadCount ? (
                      <span className="ml-3 bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0">
                        {chat.unreadCount} nova{chat.unreadCount > 1 ? 's' : ''}
                      </span>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Enquiries;
