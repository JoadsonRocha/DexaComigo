import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, PlusCircle, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { store } from '../services/store';

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
        store.getGlobalUnreadCount(user.id).then(setUnreadCount);
    }
  }, [user, location.pathname]); // Refresh when navigating

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);


  const handleLogout = async () => {
    navigate('/');
    await logout();
  };

  const isActive = (path: string) => location.pathname === path ? 'text-brand-600 font-semibold' : 'text-gray-600 hover:text-brand-600';
  const isChatActive = location.pathname.startsWith('/dashboard/chat');

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-brand-600 tracking-tight">Dexa<span className="text-gray-800">Comigo</span></span>
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link to="/" className={`${isActive('/')} inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium`}>
                Início
              </Link>
              <Link to="/search" className={`${isActive('/search')} inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium`}>
                Buscar Serviços
              </Link>
              <div className="relative flex items-center group">
                <button className="text-gray-600 hover:text-brand-600 inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium">
                    Categorias
                </button>
                <div className="absolute left-0 top-full mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-1">
                    <Link to="/categoria/cabelo" className="block px-4 py-2 text-sm text-gray-700 hover:bg-brand-50 hover:text-brand-600">Cabelo</Link>
                    <Link to="/categoria/maquiagem" className="block px-4 py-2 text-sm text-gray-700 hover:bg-brand-50 hover:text-brand-600">Maquiagem</Link>
                    <Link to="/categoria/unhas" className="block px-4 py-2 text-sm text-gray-700 hover:bg-brand-50 hover:text-brand-600">Manicure/Pedicure</Link>
                    <Link to="/categoria/estetica" className="block px-4 py-2 text-sm text-gray-700 hover:bg-brand-50 hover:text-brand-600">Estética</Link>
                </div>
              </div>
            </div>
          </div>
          
          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
            {(!user || user.role !== 'CLIENT') && (
              <Link 
                to="/create-ad" 
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-colors"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                Anunciar
              </Link>
            )}

            {user ? (
              <div className="relative ml-3 flex items-center space-x-4">
                <Link to="/dashboard/chat" className={`${isChatActive ? 'text-brand-600' : 'text-gray-500 hover:text-brand-600'} relative`} title="Mensagens">
                    <MessageSquare className="w-6 h-6" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </span>
                    )}
                </Link>
                <Link to="/dashboard" className="flex items-center space-x-2 text-sm text-gray-700 hover:text-brand-600">
                   <img loading="lazy" decoding="async" className="h-8 w-8 rounded-full object-cover border border-gray-200" src={user.avatar || "https://via.placeholder.com/100"} alt="" />
                   <span className="font-medium">{user.name}</span>
                </Link>
              </div>
            ) : (
              <Link to="/login" className="text-brand-600 font-medium hover:text-brand-800">
                Entrar / Cadastrar
              </Link>
            )}
          </div>

          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
            >
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="sm:hidden bg-white border-t border-gray-200">
          <div className="pt-2 pb-3 space-y-1">
            <Link to="/" className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-brand-300 hover:text-brand-700">Início</Link>
            <Link to="/search" className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-brand-300 hover:text-brand-700">Buscar</Link>
            {(!user || user.role !== 'CLIENT') && (
              <Link to="/create-ad" className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-brand-600 hover:bg-brand-50 hover:border-brand-300">Anunciar Serviço</Link>
            )}
             {user && (
                 <Link to="/dashboard/chat" className="flex items-center justify-between pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-brand-300">
                     Mensagens
                     {unreadCount > 0 && (
                         <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">{unreadCount}</span>
                     )}
                 </Link>
             )}
          </div>
          <div className="pt-4 pb-4 border-t border-gray-200">
            {user ? (
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  <img loading="lazy" decoding="async" className="h-10 w-10 rounded-full" src={user.avatar} alt="" />
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">{user.name}</div>
                  <div className="text-sm font-medium text-gray-500">{user.email}</div>
                </div>
              </div>
            ) : (
              <div className="px-4">
                 <Link to="/login" className="block text-center w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-brand-600 hover:bg-brand-700">
                    Entrar
                 </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold text-brand-400 mb-4">DexaComigo</h3>
            <p className="text-gray-400 text-sm">
              Conectando profissionais de beleza certificadas a clientes que desejam atendimento em domicílio. Beleza que cuida, liberdade que transforma.
            </p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Links Rápidos</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><Link to="/search" className="hover:text-white">Buscar Serviços</Link></li>
              <li><Link to="/create-ad" className="hover:text-white">Anunciar</Link></li>
              <li><Link to="/terms" className="hover:text-white">Termos de Uso</Link></li>
              <li><Link to="/privacy" className="hover:text-white">Política de Privacidade</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Contato</h4>
            <p className="text-gray-400 text-sm">suporte@dexacomigo.com.br</p>
            <p className="text-gray-400 text-sm mt-2">São Paulo, Brasil</p>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
          &copy; {new Date().getFullYear()} DexaComigo. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
};