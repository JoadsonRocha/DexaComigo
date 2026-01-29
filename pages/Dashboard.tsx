
import React, { useEffect, useState } from 'react';
import { store } from '../services/store';
import { ServiceCard } from '../components/UI';
import { Link, useNavigate } from 'react-router-dom';
import { Settings, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ServiceAd } from '../types';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [myAds, setMyAds] = useState<ServiceAd[]>([]);

  useEffect(() => {
    if (!user) {
        navigate('/login');
        return;
    }
    // Fetch ads when user changes or component mounts
    const loadAds = async () => {
        // Fix: Await the async store call
        const ads = await store.getAds();
        setMyAds(ads.filter(ad => ad.providerId === user.id));
    };
    loadAds();
  }, [user, navigate]);

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este anúncio?')) {
        await store.deleteAd(id);
        setMyAds(prev => prev.filter(ad => ad.id !== id));
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Meu Painel</h1>
            <Link to="/create-ad" className="bg-brand-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-brand-700">
                <Plus size={18} className="mr-2" /> Novo Anúncio
            </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Profile */}
            <div className="bg-white rounded-lg shadow p-6 h-fit">
                <div className="flex flex-col items-center">
                    <img src={user.avatar || 'https://via.placeholder.com/100'} alt="Profile" className="w-24 h-24 rounded-full mb-4 object-cover" />
                    <h2 className="text-xl font-bold">{user.name}</h2>
                    <p className="text-gray-500 text-sm mb-4">{user.email}</p>
                    <Link to="/profile/edit" className="w-full border border-gray-300 text-gray-700 px-4 py-2 rounded-md flex items-center justify-center hover:bg-gray-50 transition-colors">
                        <Settings size={16} className="mr-2" /> Editar Perfil
                    </Link>
                </div>
                
                <div className="mt-8 border-t border-gray-100 pt-6">
                    <h3 className="font-semibold text-gray-700 mb-4">Plano Atual</h3>
                    <div className="bg-brand-50 p-4 rounded-md border border-brand-100">
                        <div className="text-brand-800 font-bold">Gratuito</div>
                        <div className="text-xs text-brand-600 mt-1">Limite de 2 anúncios ativos.</div>
                        <button className="mt-3 text-xs bg-brand-600 text-white px-3 py-1 rounded w-full hover:bg-brand-700 transition-colors">Fazer Upgrade</button>
                    </div>
                </div>
            </div>

            {/* Ads List */}
            <div className="lg:col-span-3">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Meus Anúncios ({myAds.length})</h2>
                
                {myAds.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-10 text-center">
                        <p className="text-gray-500 mb-4">Você ainda não tem nenhum anúncio publicado.</p>
                        <Link to="/create-ad" className="text-brand-600 font-medium hover:underline">Começar agora</Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {myAds.map(ad => (
                            <div key={ad.id} className="relative group">
                                <ServiceCard ad={ad} />
                                <div className="absolute top-2 left-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="bg-white/90 text-gray-800 text-xs px-2 py-1 rounded shadow hover:bg-white font-medium">Editar</button>
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
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
