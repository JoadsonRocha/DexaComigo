
import React, { Suspense, lazy } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
import { AuthProvider } from './context/AuthContext';

const MainLayout: React.FC = () => {
  const location = useLocation();
  const isDashboardRoute = location.pathname.startsWith('/dashboard');

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
    <AuthProvider>
      <Router>
        <MainLayout />
      </Router>
    </AuthProvider>
  );
};

export default App;
