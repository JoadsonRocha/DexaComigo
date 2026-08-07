import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { store } from '../services/store';
import { ServiceAd } from '../types';
import { ServiceCard } from '../components/UI';
import { CATEGORIES } from '../constants';
import { Search, ArrowRight } from 'lucide-react';

const CategoryPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [ads, setAds] = useState<ServiceAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const limit = 12;
  const navigate = useNavigate();

  const categoryObj = CATEGORIES.find(c => c.id === id);

  const loadData = async (pageNum: number, overwrite = false) => {
    if (!id || id === 'all') return;
    
    if (pageNum === 1) setLoading(true);
    try {
      const data = await store.getAds({
          category: id,
          page: pageNum,
          limit
      });
      
      if (data.length < limit) setHasMore(false);
      else setHasMore(true);

      if (overwrite) setAds(data);
      else setAds(prev => [...prev, ...data]);
    } catch (e) {
      console.error("Error loading category ads:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!categoryObj) {
        navigate('/search');
        return;
    }
    setPage(1);
    loadData(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleLoadMore = () => {
      const nextPage = page + 1;
      setPage(nextPage);
      loadData(nextPage, false);
  };

  if (!categoryObj) return null;

  return (
    <div className="flex-1 bg-gray-50 flex flex-col pb-12">
      {/* Category Header */}
      <div className="bg-brand-900 text-white py-16 md:py-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-600/30 rounded-full blur-[80px] -mr-32 -mt-32"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-2xl backdrop-blur-sm mb-6 border border-white/20">
                {/* Dynamically render icon if available, otherwise fallback */}
                {categoryObj.icon && <span className="text-3xl text-brand-100">✨</span>}
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">Especialistas em {categoryObj.label}</h1>
            <p className="text-brand-100 text-lg md:text-xl max-w-2xl mx-auto font-light">
                Encontre as melhores profissionais da área, avalie seus trabalhos e contrate com segurança.
            </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full mt-12">
        <div className="flex justify-between items-end mb-8">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Anúncios disponíveis</h2>
                <p className="text-gray-500 mt-1">Navegue pelas opções e escolha a melhor para você.</p>
            </div>
            <button 
                onClick={() => navigate(`/search?c=${id}`)}
                className="hidden md:flex text-brand-600 font-bold items-center hover:text-brand-700 transition-colors"
            >
                Filtrar por preço/local <ArrowRight size={18} className="ml-2" />
            </button>
        </div>

        {loading && page === 1 ? (
            <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div></div>
        ) : ads.length > 0 ? (
            <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {ads.map(ad => (
                        <ServiceCard key={ad.id} ad={ad} compact />
                    ))}
                </div>
                {hasMore && (
                    <div className="mt-12 text-center">
                        <button 
                            onClick={handleLoadMore}
                            disabled={loading}
                            className="bg-white border border-brand-200 text-brand-600 font-bold py-3 px-8 rounded-xl shadow-sm hover:bg-brand-50 transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Carregando...' : 'Ver mais'}
                        </button>
                    </div>
                )}
            </>
        ) : (
            <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="mx-auto w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center text-brand-400 mb-4">
                    <Search size={32} />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Nenhum serviço de {categoryObj.label}</h3>
                <p className="mt-2 text-gray-500">Ainda não temos profissionais cadastradas nesta categoria.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;
