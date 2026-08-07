import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { store } from '../services/store';
import { User, ServiceAd } from '../types';
import { ServiceCard } from '../components/UI';
import { MessageSquare, MapPin, Star, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const PublicProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<User | null>(null);
  const [ads, setAds] = useState<ServiceAd[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const loadProfile = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const p = await store.getUserProfile(id);
        setProfile(p);
        
        if (p) {
            const userAds = await store.getAds({ providerId: id });
            setAds(userAds);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [id]);

  const handleStartChat = async (adId: string) => {
    if (!user) {
        navigate('/login');
        return;
    }
    if (user.id === id) return; // Can't chat with self

    try {
        const chatId = await store.startChat(user.id, id!, adId);
        navigate(`/dashboard/chat/${chatId}`);
    } catch (e) {
        alert("Erro ao iniciar chat.");
    }
  };

  if (loading) {
      return (
          <div className="flex-1 flex justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
          </div>
      );
  }

  if (!profile) {
      return (
          <div className="flex-1 flex flex-col items-center justify-center py-20">
              <UserIcon size={48} className="text-gray-300 mb-4" />
              <h2 className="text-2xl font-bold text-gray-800">Perfil não encontrado</h2>
              <p className="text-gray-500">Este usuário não existe ou foi removido.</p>
          </div>
      );
  }

  const averageRating = ads.length > 0 
      ? (ads.reduce((acc, ad) => acc + ad.rating, 0) / ads.length).toFixed(1)
      : '0.0';
      
  const totalReviews = ads.reduce((acc, ad) => acc + ad.reviewCount, 0);

  return (
    <div className="flex-1 bg-gray-50 pb-12">
      {/* Cover and Profile Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="h-32 md:h-48 bg-gradient-to-r from-brand-600 to-brand-400"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative flex flex-col md:flex-row md:items-end -mt-12 md:-mt-16 pb-8">
                <img 
                    src={profile.avatar || "https://via.placeholder.com/150"} 
                    alt={profile.name}
                    className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white shadow-lg object-cover bg-white"
                />
                
                <div className="mt-4 md:mt-0 md:ml-6 flex-1">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{profile.name}</h1>
                    <div className="flex flex-wrap items-center mt-2 text-sm text-gray-600 gap-4">
                        {profile.location && (
                            <span className="flex items-center">
                                <MapPin size={16} className="mr-1 text-gray-400" /> {profile.location}
                            </span>
                        )}
                        <span className="flex items-center text-yellow-600 font-medium">
                            <Star size={16} className="mr-1 fill-yellow-500 text-yellow-500" /> 
                            {averageRating} <span className="text-gray-400 ml-1">({totalReviews} avaliações)</span>
                        </span>
                    </div>
                </div>

                <div className="mt-6 md:mt-0 md:ml-6 flex items-center space-x-3">
                    {user?.id !== profile.id && ads.length > 0 && (
                        <button 
                            onClick={() => handleStartChat(ads[0].id)}
                            className="bg-brand-600 text-white font-bold py-2 px-6 rounded-lg shadow-sm hover:bg-brand-700 transition-colors flex items-center"
                        >
                            <MessageSquare size={18} className="mr-2" /> Falar com {profile.name.split(' ')[0]}
                        </button>
                    )}
                </div>
            </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Info */}
        <aside className="md:w-1/3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
                <h3 className="font-bold text-gray-900 text-lg mb-4">Sobre a profissional</h3>
                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                    {profile.bio || "Esta profissional ainda não adicionou uma biografia."}
                </p>
            </div>
        </aside>

        {/* Ads Showcase */}
        <main className="md:w-2/3">
            <h3 className="font-bold text-gray-900 text-xl mb-6">Serviços ({ads.length})</h3>
            
            {ads.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-500">
                    Nenhum anúncio publicado no momento.
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {ads.map(ad => (
                        <ServiceCard key={ad.id} ad={ad} />
                    ))}
                </div>
            )}
        </main>
      </div>
    </div>
  );
};

export default PublicProfile;
