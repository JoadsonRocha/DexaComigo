
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Navbar, Footer } from './components/Layout';
import Home from './pages/Home';
import SearchPage from './pages/Search';
import ServiceDetail from './pages/ServiceDetail';
import CreateAd from './pages/CreateAd';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Chat from './pages/Chat';
import EditProfile from './pages/EditProfile';
import { AuthProvider } from './context/AuthContext';

const MainLayout: React.FC = () => {
  const location = useLocation();
  const isChatRoute = location.pathname.startsWith('/chat');

  return (
    <div className={`flex flex-col bg-gray-50 ${isChatRoute ? 'h-screen overflow-hidden' : 'min-h-screen'}`}>
      <Navbar />
      <main className="flex-grow flex flex-col overflow-hidden">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/service/:id" element={<ServiceDetail />} />
          <Route path="/create-ad" element={<CreateAd />} />
          <Route path="/edit-ad/:id" element={<CreateAd />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile/edit" element={<EditProfile />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/chat/:id" element={<Chat />} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      {!isChatRoute && <Footer />}
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
