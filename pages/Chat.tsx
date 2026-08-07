
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, User as UserIcon, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { store } from '../services/store';
import { ChatSession } from '../types';

const Chat: React.FC = () => {
  const { user } = useAuth();
  const { id: routeChatId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [chats, setChats] = useState<ChatSession[]>([]);
  const [activeChat, setActiveChat] = useState<ChatSession | null>(null);
  const [newMessage, setNewMessage] = useState('');

  // Initial load
  useEffect(() => {
    if (!user) {
        navigate('/login');
        return;
    }

    const loadChats = async () => {
        // Fix: Await the async store call
        const userChats = await store.getChats(user.id);
        setChats(userChats);

        if (routeChatId) {
            // Fix: Await the async store call and use correct method name
            const found = await store.getChatById(routeChatId, user.id);
            if (found) {
                if (found.unreadCount && found.unreadCount > 0) {
                    await store.markMessagesAsRead(found.id, user.id);
                    // Refresh chat state to reflect read messages
                    const refreshed = await store.getChatById(routeChatId, user.id);
                    if (refreshed) {
                        setActiveChat(refreshed);
                        // Also update in list
                        setChats(prev => prev.map(c => c.id === refreshed.id ? refreshed : c));
                    }
                } else {
                    setActiveChat(found);
                }
            }
        } else if (userChats.length > 0 && window.innerWidth >= 768) {
            // Auto select first chat on desktop if none selected
            navigate(`/chat/${userChats[0].id}`);
        }
    };
    loadChats();
  }, [user, routeChatId, navigate]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat?.messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat || !user) return;

    // Fix: Await the async store call
    await store.sendMessage(activeChat.id, user.id, newMessage);
    
    // Refresh local state
    // Fix: Await the async store call and use correct method name
    const updatedChat = await store.getChatById(activeChat.id, user.id);
    if (updatedChat) {
        setActiveChat({ ...updatedChat });
        // Update list as well
        setChats(prev => prev.map(c => c.id === updatedChat.id ? updatedChat : c).sort((a,b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
    }
    
    setNewMessage('');
  };

  const handleChatSelect = (chatId: string) => {
      navigate(`/chat/${chatId}`);
  };

  if (!user) return null;

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
                                    {chat.adTitle}
                                    {chat.unreadCount ? (
                                        <span className="ml-2 w-2.5 h-2.5 rounded-full bg-green-500 flex-shrink-0" title={`${chat.unreadCount} nova(s) mensagem(ns)`}></span>
                                    ) : null}
                                </span>
                                <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                                    {new Date(chat.updatedAt).toLocaleDateString([], {hour: '2-digit', minute:'2-digit'})}
                                </span>
                            </div>
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
                    <button onClick={() => navigate('/chat')} className="mr-3 md:hidden text-gray-500">
                        <ArrowLeft />
                    </button>
                    <div>
                        <h3 className="font-bold text-gray-800">{activeChat.otherUserName || 'Usuário'}</h3>
                        <p className="text-xs text-gray-500">{activeChat.adTitle}</p>
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
                    
                    {activeChat.messages.map((msg) => {
                        const isMe = msg.senderId === user.id;
                        return (
                            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`
                                    max-w-[80%] rounded-lg px-4 py-2 shadow-sm
                                    ${isMe ? 'bg-brand-600 text-white rounded-br-none' : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'}
                                `}>
                                    <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                                    <span className={`text-[10px] block text-right mt-1 ${isMe ? 'text-brand-200' : 'text-gray-400'}`}>
                                        {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </span>
                                </div>
                            </div>
                        )
                    })}
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
                            disabled={!newMessage.trim()}
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
