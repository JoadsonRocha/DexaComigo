
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, User as UserIcon, ArrowLeft, CheckCheck, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { store, supabase } from '../services/store';
import { ChatSession, Message } from '../types';

const Chat: React.FC = () => {
  const { user, loading } = useAuth();
  const { id: routeChatId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [chats, setChats] = useState<ChatSession[]>([]);
  const [activeChat, setActiveChat] = useState<ChatSession | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

  // Initial load
  useEffect(() => {
    if (loading) return;
    if (!user) {
        navigate('/login');
        return;
    }

    const loadChats = async () => {
        const userChats = await store.getChats(user.id);
        setChats(userChats);

        if (routeChatId) {
            const found = await store.getChatById(routeChatId, user.id);
            if (found) {
                if (found.unreadCount && found.unreadCount > 0) {
                    await store.markMessagesAsRead(found.id, user.id);
                    const refreshed = await store.getChatById(routeChatId, user.id);
                    if (refreshed) {
                        setActiveChat(refreshed);
                        setChats(prev => prev.map(c => c.id === refreshed.id ? refreshed : c));
                    }
                } else {
                    setActiveChat(found);
                }
            }
        } else if (userChats.length > 0 && window.innerWidth >= 768) {
            navigate(`/dashboard/chat/${userChats[0].id}`);
        }
    };
    loadChats();
  }, [user, routeChatId, navigate]);

  // Realtime: recebe novas mensagens em tempo real
  useEffect(() => {
    if (!user || !activeChat?.id) return;

    const channel = supabase
      .channel(`chat-${activeChat.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `session_id=eq.${activeChat.id}`
      }, async (payload: any) => {
        const msg = payload.new;
        if (msg.sender_id === user.id) return;

        await store.markMessagesAsRead(activeChat.id, user.id);
        const updated = await store.getChatById(activeChat.id, user.id);
        if (updated) {
          setActiveChat(updated);
          setChats(prev => prev.map(c => c.id === updated.id ? updated : c)
            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, activeChat?.id]);

  // Realtime: atualiza lista de chats quando chega mensagem em outra conversa
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`chats-${user.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'messages'
      }, async () => {
        if (activeChat) return;
        const userChats = await store.getChats(user.id);
        setChats(userChats);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, activeChat]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat?.messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat || !user) return;

    setSending(true);
    try {
      await store.sendMessage(activeChat.id, user.id, newMessage);
      const updatedChat = await store.getChatById(activeChat.id, user.id);
      if (updatedChat) {
          setActiveChat({ ...updatedChat });
          setChats(prev => prev.map(c => c.id === updatedChat.id ? updatedChat : c).sort((a,b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
      }
      setNewMessage('');
    } catch (err) {
      console.error("Erro ao enviar mensagem:", err);
    } finally {
      setSending(false);
    }
  };

  const handleChatSelect = (chatId: string) => {
      navigate(`/dashboard/chat/${chatId}`);
  };

  // Formata a hora e o dia da mensagem
  const formatTime = (ts: string) =>
      new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const formatDayLabel = (ts: string) => {
      const d = new Date(ts);
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);
      if (d.toDateString() === today.toDateString()) return 'Hoje';
      if (d.toDateString() === yesterday.toDateString()) return 'Ontem';
      return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  if (!user) return null;

  // Separa as mensagens por dia para exibir marcadores de data
  const groupedMessages = (msgs: Message[]) => {
      const groups: { label: string; messages: Message[] }[] = [];
      for (const msg of msgs) {
          const label = formatDayLabel(msg.timestamp);
          const last = groups[groups.length - 1];
          if (last && last.label === label) {
              last.messages.push(msg);
          } else {
              groups.push({ label, messages: [msg] });
          }
      }
      return groups;
  };

  return (
    <div className="flex flex-1 h-full overflow-hidden bg-gray-100">
      
      {/* Sidebar List */}
      <div className={`w-full md:w-80 bg-white border-r border-gray-200 flex flex-col ${activeChat && 'hidden md:flex'}`}>
        <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-xl font-bold text-gray-800">Mensagens</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto">
            {chats.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                    <p>Nenhuma conversa iniciada.</p>
                </div>
            ) : (
                <ul className="divide-y divide-gray-100">
                    {chats.map(chat => (
                        <li 
                            key={chat.id}
                            onClick={() => handleChatSelect(chat.id)}
                            className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${activeChat?.id === chat.id ? 'bg-brand-50 border-l-4 border-brand-600' : ''}`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className="font-semibold text-gray-900 line-clamp-1 flex items-center">
                                    {chat.otherUserName || 'Usuário'}
                                    {chat.unreadCount ? (
                                        <span className="ml-2 w-2.5 h-2.5 rounded-full bg-green-500 flex-shrink-0" title={`${chat.unreadCount} nova(s) mensagem(ns)`}></span>
                                    ) : null}
                                </span>
                                <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                                    {new Date(chat.updatedAt).toLocaleDateString([], {hour: '2-digit', minute:'2-digit'})}
                                </span>
                            </div>
                            <p className="text-xs text-brand-600 mb-1 font-medium">{chat.adTitle}</p>
                            <p className={`text-sm line-clamp-1 ${chat.unreadCount ? 'text-gray-900 font-bold' : 'text-gray-500'}`}>
                                {chat.lastMessage || 'Nenhuma mensagem.'}
                            </p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
      </div>

      {/* Chat Window */}
      <div className={`flex-1 flex flex-col bg-gray-50 ${!activeChat && 'hidden md:flex'}`}>
        {activeChat ? (
            <>
                {/* Chat Header */}
                <div className="p-4 bg-white border-b border-gray-200 shadow-sm flex items-center">
                    <button onClick={() => navigate('/dashboard/chat')} className="mr-3 md:hidden text-gray-500">
                        <ArrowLeft />
                    </button>
                    <div className="flex items-center">
                        {activeChat.providerName ? (
                            <div className="w-10 h-10 bg-brand-600 text-white rounded-full flex items-center justify-center font-bold mr-3">
                                {(activeChat.otherUserName || activeChat.providerName || 'P').charAt(0).toUpperCase()}
                            </div>
                        ) : null}
                        <div>
                            <h3 className="font-bold text-gray-800 text-sm md:text-base flex flex-col md:flex-row md:items-center">
                                <span><span className="text-brand-600 font-semibold text-xs uppercase tracking-wider">Profissional:</span> {activeChat.providerName || 'Não Informado'}</span>
                                <span className="hidden md:inline mx-2 text-gray-300">|</span>
                                <span><span className="text-gray-500 font-semibold text-xs uppercase tracking-wider">Cliente:</span> {activeChat.clientName || 'Não Informado'}</span>
                            </h3>
                            <p className="text-xs text-gray-600 font-medium bg-gray-100 inline-block px-2 py-1 rounded mt-1">Serviço: {activeChat.adTitle}</p>
                        </div>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {activeChat.messages.length === 0 && (
                        <div className="text-center text-gray-400 mt-10 text-sm">
                            <p>Comece a conversa com o prestador.</p>
                            <p>Tire dúvidas sobre o serviço anunciado.</p>
                        </div>
                    )}
                    
                    {groupedMessages(activeChat.messages).map(group => (
                        <div key={group.label}>
                            <div className="flex justify-center mb-4">
                                <span className="text-xs bg-gray-200 text-gray-600 px-3 py-1 rounded-full font-medium">
                                    {group.label}
                                </span>
                            </div>
                            <div className="space-y-3">
                                {group.messages.map((msg, idx) => {
                                    const isMe = msg.senderId === user.id;
                                    const showAvatar = !isMe;
                                    return (
                                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} items-end`}>
                                            {showAvatar && (
                                                <div className="w-7 h-7 bg-gray-300 text-gray-700 rounded-full flex items-center justify-center text-xs font-bold mr-2 flex-shrink-0">
                                                    {(activeChat.otherUserName || 'U').charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <div className={`
                                                max-w-[75%] rounded-2xl px-4 py-2 shadow-sm
                                                ${isMe ? 'bg-brand-600 text-white rounded-br-md' : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md'}
                                            `}>
                                                <p className="text-sm whitespace-pre-wrap break-words">{msg.text}</p>
                                                <span className={`text-[10px] flex items-center justify-end mt-1 gap-1 ${isMe ? 'text-brand-200' : 'text-gray-400'}`}>
                                                    {formatTime(msg.timestamp)}
                                                    {isMe && (
                                                        msg.read
                                                            ? <CheckCheck size={13} className="text-brand-200" />
                                                            : <Check size={13} className="text-brand-200/70" />
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-200">
                    <div className="flex items-center space-x-2">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Digite sua mensagem..."
                            className="flex-1 border-gray-300 rounded-full focus:ring-brand-500 focus:border-brand-500 px-4 py-2 border shadow-sm"
                        />
                        <button 
                            type="submit" 
                            disabled={!newMessage.trim() || sending}
                            className="bg-brand-600 text-white p-2 rounded-full hover:bg-brand-700 disabled:opacity-50 transition-colors shadow-sm"
                        >
                            <Send size={20} />
                        </button>
                    </div>
                </form>
            </>
        ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                    <UserIcon size={32} />
                </div>
                <p className="text-lg font-medium">Selecione uma conversa</p>
                <p className="text-sm">Ou inicie um chat através de um anúncio</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
