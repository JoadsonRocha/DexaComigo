
import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Navbar, Footer } from './components/Layout';
const Home = lazy(() => import('./pages/Home'));
const SearchPage = lazy(() => import('./pages/Search'));
const ServiceDetail = lazy(() => import('./pages/ServiceDetail'));
const CreateAd = lazy(() => import('./pages/CreateAd'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const DashboardHome = lazy(() => import('./pages/DashboardHome'));
const Appointments = lazy(() => import('./pages/Appointments'));
const Ads = lazy(() => import('./pages/Ads'));
const Login = lazy(() => import('./pages/Login'));
const Chat = lazy(() => import('./pages/Chat'));
const EditProfile = lazy(() => import('./pages/EditProfile'));
const CategoryPage = lazy(() => import('./pages/CategoryPage'));
const PublicProfile = lazy(() => import('./pages/PublicProfile'));
const Terms = lazy(() => import('./pages/Terms'));
const Privacy = lazy(() => import('./pages/Privacy'));
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

const PAGE_TITLES: { match: RegExp; title: string }[] = [
  { match: /^\/$/, title: 'Início' },
  { match: /^\/search/, title: 'Buscar Serviços' },
  { match: /^\/categoria\//, title: 'Categorias' },
  { match: /^\/service\//, title: 'Detalhes do Serviço' },
  { match: /^\/profissional\//, title: 'Profissional' },
  { match: /^\/create-ad/, title: 'Anunciar Serviço' },
  { match: /^\/edit-ad/, title: 'Editar Anúncio' },
  { match: /^\/dashboard\/chat/, title: 'Mensagens' },
  { match: /^\/dashboard\/appointments/, title: 'Meus Agendamentos' },
  { match: /^\/dashboard\/ads/, title: 'Meus Anúncios' },
  { match: /^\/dashboard/, title: 'Meu Painel' },
  { match: /^\/profile\/edit/, title: 'Editar Perfil' },
  { match: /^\/login/, title: 'Entrar' },
  { match: /^\/terms/, title: 'Termos de Uso' },
  { match: /^\/privacy/, title: 'Política de Privacidade' },
];

const MainLayout: React.FC = () => {
  const location = useLocation();
  const isDashboardRoute = location.pathname.startsWith('/dashboard');

  useEffect(() => {
    const found = PAGE_TITLES.find(p => p.match.test(location.pathname));
    document.title = found ? `${found.title} | DexaComigo` : 'DexaComigo';
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className={`flex flex-col bg-gray-50 ${isDashboardRoute ? 'h-screen overflow-hidden' : 'min-h-screen'}`}>
      <Navbar />
      <main id="main-content" className="flex-grow flex flex-col overflow-hidden">
        <Suspense fallback={<div className="flex items-center justify-center p-8">Carregando...</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/categoria/:id" element={<CategoryPage />} />
          <Route path="/service/:id" element={<ServiceDetail />} />
          <Route path="/profissional/:id" element={<PublicProfile />} />
          <Route path="/create-ad" element={<CreateAd />} />
          <Route path="/edit-ad/:id" element={<CreateAd />} />
          <Route path="/dashboard" element={<Dashboard />}>
            <Route index element={<DashboardHome />} />
            <Route path="appointments" element={<Appointments />} />
            <Route path="ads" element={<Ads />} />
            <Route path="chat" element={<Chat />} />
            <Route path="chat/:id" element={<Chat />} />
          </Route>
          <Route path="/profile/edit" element={<EditProfile />} />
          <Route path="/chat" element={<Navigate to="/dashboard/chat" replace />} />
          <Route path="/chat/:id" element={<Navigate to="/dashboard/chat/:id" replace />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        </Suspense>
      </main>
      {!isDashboardRoute && <Footer />}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <Router>
          <MainLayout />
        </Router>
      </AuthProvider>
    </ToastProvider>
  );
};

export default App;
