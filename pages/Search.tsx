import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, X, Search, MapPin, Navigation } from 'lucide-react';
import { store } from '../services/store';
import { ServiceCard, CategoryPill } from '../components/UI';
import { CATEGORIES } from '../constants';
import { ServiceAd } from '../types';

const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [ads, setAds] = useState<ServiceAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const limit = 9;
  
  // Filters state
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [location, setLocation] = useState(searchParams.get('l') || '');
  const [category, setCategory] = useState(searchParams.get('c') || 'all');
  const [priceRange, setPriceRange] = useState<string>(searchParams.get('p') || 'all');
  const [showFilters, setShowFilters] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const handleGetLocation = () => {
      if (!navigator.geolocation) {
          alert('Geolocalização não suportada no seu navegador.');
          return;
      }
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(async (pos) => {
          try {
              const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${pos.coords.latitude}&longitude=${pos.coords.longitude}&localityLanguage=pt`);
              const data = await res.json();
              const loc = `${data.city || data.locality}, ${data.principalSubdivisionCode?.split('-')[1] || data.principalSubdivision}`;
              setLocation(loc);
              // auto search
              updateSearchParam('l', loc);
              setPage(1);
              loadData(1, true); // wait, loadData won't have the new location closure unless I call it inside handleSearch? Let's just set the location state and they can click search.
          } catch(e) {
              alert('Erro ao buscar localização.');
          } finally {
              setIsLocating(false);
          }
      }, () => {
          alert('Permissão de localização negada.');
          setIsLocating(false);
      });
  };

  const loadData = async (pageNum: number, overwrite = false) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      const data = await store.getAds({
          category,
          searchTerm: query,
          location,
          priceRange,
          page: pageNum,
          limit
      });
      
      if (data.length < limit) setHasMore(false);
      else setHasMore(true);

      if (overwrite) setAds(data);
      else setAds(prev => [...prev, ...data]);
    } catch (e) {
      console.error("Error loading ads:", e);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Trigger load when category or priceRange changes (instant filters)
  useEffect(() => {
    setPage(1);
    loadData(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, priceRange]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateSearchParam('q', query);
    updateSearchParam('l', location);
    setPage(1);
    loadData(1, true);
  };

  const handleLoadMore = () => {
      const nextPage = page + 1;
      setPage(nextPage);
      loadData(nextPage, false);
  };

  const updateSearchParam = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value && value !== 'all') {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const handleCategoryChange = (id: string) => {
    setCategory(id);
    updateSearchParam('c', id);
  };

  const handlePriceChange = (val: string) => {
    setPriceRange(val);
    updateSearchParam('p', val);
  }

  return (
    <div className="flex-1 bg-gray-50 flex flex-col">
      {/* Centered Search Header */}
      <div className="bg-white border-b border-gray-200 py-6 md:py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 tracking-tight">O que você está procurando?</h1>
            
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-2 max-w-3xl mx-auto">
                <div className="flex-1 relative">
                    <input 
                        type="text" 
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Maquiagem, Cabelo, Depilação..."
                        className="w-full border-gray-300 rounded-xl focus:ring-brand-500 focus:border-brand-500 p-3 pl-10 border shadow-sm"
                    />
                    <Search className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
                </div>
                <div className="flex-1 relative">
                    <input 
                        type="text" 
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Sua cidade ou bairro..."
                        className="w-full border-gray-300 rounded-xl focus:ring-brand-500 focus:border-brand-500 p-3 pl-10 pr-12 border shadow-sm"
                    />
                    <MapPin className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
                    <button 
                        type="button" 
                        onClick={handleGetLocation}
                        disabled={isLocating}
                        title="Usar minha localização"
                        className="absolute right-2 top-2 p-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-brand-600 transition-colors disabled:opacity-50"
                    >
                        <Navigation size={18} className={isLocating ? "animate-pulse" : ""} />
                    </button>
                </div>
                <button type="submit" className="bg-brand-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-brand-700 shadow-sm transition-colors active:scale-95">
                    Buscar
                </button>
            </form>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-8">
        
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Resultados da busca</h2>
            <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center px-4 py-2 border rounded-md shadow-sm text-sm transition-colors ${showFilters ? 'bg-gray-100 border-gray-300 text-gray-800' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
                <Filter size={16} className="mr-2"/> {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
            </button>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {showFilters && (
              <aside className="md:w-64 flex-shrink-0 animate-in fade-in slide-in-from-left-4 duration-300">
                <div className="bg-white p-5 rounded-xl shadow-sm sticky top-24 border border-gray-100">
                   <div className="flex justify-between items-center mb-6 md:hidden">
                        <h3 className="font-bold">Filtros</h3>
                        <button onClick={() => setShowFilters(false)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
                   </div>
    
                   <div className="mb-6">
                     <label className="block text-sm font-medium text-gray-700 mb-3">Preço</label>
                     <select 
                        value={priceRange} 
                        onChange={(e) => handlePriceChange(e.target.value)}
                        className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-brand-500 focus:border-brand-500 sm:text-sm p-2.5 border"
                     >
                        <option value="all">Qualquer preço</option>
                        <option value="estimate">A combinar</option>
                        <option value="low">Até R$ 100</option>
                        <option value="mid">R$ 100 - R$ 300</option>
                        <option value="high">Acima de R$ 300</option>
                     </select>
                   </div>
    
                   <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">Categorias</label>
                      <div className="space-y-3">
                        {CATEGORIES.filter(c => c.id !== 'all').map(cat => (
                            <div key={cat.id} className="flex items-center">
                                <input 
                                    id={`cat-${cat.id}`}
                                    type="radio" 
                                    checked={category === cat.id}
                                    onChange={() => handleCategoryChange(cat.id)}
                                    className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-300 cursor-pointer"
                                />
                                <label htmlFor={`cat-${cat.id}`} className="ml-3 block text-sm text-gray-700 cursor-pointer hover:text-brand-600">
                                    {cat.label}
                                </label>
                            </div>
                        ))}
                      </div>
                   </div>
                </div>
              </aside>
          )}

          <main className="flex-1">
            <div className="hidden md:flex overflow-x-auto space-x-2 mb-6 pb-2 scrollbar-hide">
                {CATEGORIES.map(cat => (
                    <CategoryPill 
                        key={cat.id} 
                        id={cat.id} 
                        label={cat.label} 
                        active={category === cat.id}
                        onClick={() => handleCategoryChange(cat.id)}
                    />
                ))}
            </div>

            {loading ? (
              <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div></div>
            ) : ads.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {ads.map(ad => (
                          <ServiceCard key={ad.id} ad={ad} compact />
                        ))}
                    </div>
                    {hasMore && (
                        <div className="mt-12 text-center">
                            <button 
                                onClick={handleLoadMore}
                                disabled={loadingMore}
                                className="bg-white border border-brand-200 text-brand-600 font-bold py-3 px-8 rounded-xl shadow-sm hover:bg-brand-50 transition-colors disabled:opacity-50"
                            >
                                {loadingMore ? 'Carregando...' : 'Carregar mais resultados'}
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
                    <div className="mx-auto w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center text-brand-400 mb-4">
                        <Search size={32} />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">Nenhum serviço encontrado</h3>
                    <p className="mt-2 text-gray-500">Tente ajustar seus filtros ou buscar por outro termo ou localização.</p>
                </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
