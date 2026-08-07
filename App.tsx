
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Navbar, Footer } from './components/Layout';
import Home from './pages/Home';
import SearchPage from './pages/Search';
import ServiceDetail from './pages/ServiceDetail';
import CreateAd from './pages/CreateAd';
import Dashboard from './pages/Dashboard';
import DashboardHome from './pages/DashboardHome';
import Appointments from './pages/Appointments';
import Ads from './pages/Ads';
import Login from './pages/Login';
import Chat from './pages/Chat';
import EditProfile from './pages/EditProfile';
import CategoryPage from './pages/CategoryPage';
import PublicProfile from './pages/PublicProfile';
import { AuthProvider } from './context/AuthContext';

const MainLayout: React.FC = () => {
  const location = useLocation();
  const isDashboardRoute = location.pathname.startsWith('/dashboard');

  return (
    <div className={`flex flex-col bg-gray-50 ${isDashboardRoute ? 'h-screen overflow-hidden' : 'min-h-screen'}`}>
      <Navbar />
      <main id="main-content" className="flex-grow flex flex-col overflow-hidden">
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
