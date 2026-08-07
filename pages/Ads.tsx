import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Trash2, Clock, ArrowLeft, Star, Megaphone, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { store } from '../services/store';
import { ServiceAd, UserRole } from '../types';
import { ServiceCard } from '../components/UI';

const Ads: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [ads, setAds] = useState<ServiceAd[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== UserRole.PROVIDER) {
      navigate('/dashboard');
      return;
    }

    const load = async () => {
      try {
        const data = await store.getAds({ providerId: user.id });
        setAds(data);
      } catch (e) {
        console.error("Erro ao carregar anúncios:", e);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [user, loading]);

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este anúncio?')) {
      await store.deleteAd(id);
      setAds(prev => prev.filter(ad => ad.id !== id));
    }
  };

  if (loading || isLoading) {
    return (
      <div className="flex-1 bg-gray-50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center p-20">
          <Clock className="animate-spin text-brand-600" size={32} />
        </div>
      </div>
    );
  }

  const totalAds = ads.length;
  const premiumAds = ads.filter(a => a.isPremium).length;
  const categories = new Set(ads.map(a => a.category)).size;
  const avgRating = ads.length
    ? (ads.reduce((acc, a) => acc + (a.rating || 0), 0) / ads.length).toFixed(1)
    : '0';

  const stats = [
    { label: 'Total de Anúncios', value: totalAds, icon: Megaphone, color: 'bg-brand-50 text-brand-600' },
    { label: 'Anúncios Premium', value: premiumAds, icon: Star, color: 'bg-yellow-50 text-yellow-600' },
    { label: 'Categorias', value: categories, icon: TrendingUp, color: 'bg-blue-50 text-blue-600' },
    { label: 'Avaliação Média', value: avgRating, icon: Star, color: 'bg-purple-50 text-purple-600' },
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
              <h1 className="text-3xl font-bold text-gray-900">Meus Anúncios</h1>
              <p className="text-gray-500 mt-1">Gerencie e acompanhe todos os seus serviços publicados</p>
            </div>
          </div>
          <Link to="/create-ad" className="bg-brand-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-brand-700 transition-colors">
            <Plus size={18} className="mr-2" /> Novo Anúncio
          </Link>
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

        {/* Ads List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Seus Anúncios ({ads.length})</h2>
          </div>

          {ads.length === 0 ? (
            <div className="p-10 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Megaphone size={28} className="text-gray-400" />
              </div>
              <p className="text-gray-500">Nenhum anúncio publicado ainda.</p>
              <p className="text-gray-400 text-sm mt-1">Comece a gerar renda e autonomia. Crie seu primeiro anúncio de beleza em domicílio agora!</p>
              <Link to="/create-ad" className="inline-block mt-4 text-brand-600 font-medium hover:underline">Criar meu primeiro anúncio</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-6">
              {ads.map(ad => (
                <div key={ad.id} className="relative group">
                  <ServiceCard ad={ad} />
                  <div className="absolute top-2 left-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link to={`/edit-ad/${ad.id}`} className="bg-white/90 text-gray-800 text-xs px-2 py-1 rounded shadow hover:bg-white font-medium">Editar</Link>
                    <button
                      onClick={() => handleDelete(ad.id)}
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
  );
};

export default Ads;
