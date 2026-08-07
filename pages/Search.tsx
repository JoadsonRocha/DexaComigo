
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, X, Search, MapPin } from 'lucide-react';
import { store } from '../services/store';
import { ServiceCard, CategoryPill } from '../components/UI';
import { CATEGORIES } from '../constants';
import { ServiceAd } from '../types';

const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [ads, setAds] = useState<ServiceAd[]>([]);
  const [filteredAds, setFilteredAds] = useState<ServiceAd[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters state
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [location, setLocation] = useState(searchParams.get('l') || '');
  const [category, setCategory] = useState(searchParams.get('c') || 'all');
  const [priceRange, setPriceRange] = useState<string>('all'); // all, low, mid, high
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await store.getAds();
        setAds(data);
      } catch (e) {
        console.error("Error loading ads:", e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    // Apply filters
    let result = ads;

    if (query) {
      const lowerQ = query.toLowerCase();
      result = result.filter(ad => 
        ad.title.toLowerCase().includes(lowerQ) || 
        ad.description.toLowerCase().includes(lowerQ) ||
        ad.location.toLowerCase().includes(lowerQ)
      );
    }

    if (location) {
      const lowerLoc = location.toLowerCase();
      result = result.filter(ad => ad.location.toLowerCase().includes(lowerLoc));
    }

    if (category && category !== 'all') {
      result = result.filter(ad => ad.category === category);
    }

    if (priceRange !== 'all') {
      if (priceRange === 'low') result = result.filter(ad => ad.price > 0 && ad.price <= 100);
      if (priceRange === 'mid') result = result.filter(ad => ad.price > 100 && ad.price <= 300);
      if (priceRange === 'high') result = result.filter(ad => ad.price > 300);
      if (priceRange === 'estimate') result = result.filter(ad => ad.price === 0);
    }

    setFilteredAds(result);
  }, [ads, query, category, priceRange, location]);

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

  return (
    <div className="flex-1 bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="md:hidden flex justify-between items-center mb-4">
            <h1 className="text-xl font-bold text-gray-800">Resultados</h1>
            <button 
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-4 py-2 bg-white border rounded-md shadow-sm text-sm"
            >
                <Filter size={16} className="mr-2"/> Filtros
            </button>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          <aside className={`md:w-64 flex-shrink-0 ${showFilters ? 'block' : 'hidden md:block'}`}>
            <div className="bg-white p-5 rounded-lg shadow-sm sticky top-24">
               <div className="flex justify-between items-center mb-4 md:hidden">
                    <h3 className="font-bold">Filtros</h3>
                    <button onClick={() => setShowFilters(false)}><X size={20}/></button>
               </div>

               <div className="mb-6">
                 <label className="block text-sm font-medium text-gray-700 mb-2">Busca</label>
                 <input 
                    type="text" 
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        updateSearchParam('q', e.target.value);
                    }}
                    placeholder="Ex: Maquiagem, Cabelo, Depilação"
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-500 focus:border-brand-500 sm:text-sm p-2 border"
                 />
               </div>

               <div className="mb-6">
                 <label className="block text-sm font-medium text-gray-700 mb-2">Localização</label>
                 <div className="relative">
                    <input 
                        type="text" 
                        value={location}
                        onChange={(e) => {
                            setLocation(e.target.value);
                            updateSearchParam('l', e.target.value);
                        }}
                        placeholder="Cidade ou Bairro"
                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-500 focus:border-brand-500 sm:text-sm p-2 border pl-8"
                    />
                    <MapPin className="absolute left-2.5 top-2.5 text-gray-400 w-4 h-4" />
                 </div>
               </div>

               <div className="mb-6">
                 <label className="block text-sm font-medium text-gray-700 mb-2">Preço</label>
                 <select 
                    value={priceRange} 
                    onChange={(e) => setPriceRange(e.target.value)}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-500 focus:border-brand-500 sm:text-sm p-2 border"
                 >
                    <option value="all">Qualquer preço</option>
                    <option value="estimate">A combinar</option>
                    <option value="low">Até R$ 100</option>
                    <option value="mid">R$ 100 - R$ 300</option>
                    <option value="high">Acima de R$ 300</option>
                 </select>
               </div>

               <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Categorias</label>
                  <div className="space-y-2">
                    {CATEGORIES.filter(c => c.id !== 'all').map(cat => (
                        <div key={cat.id} className="flex items-center">
                            <input 
                                id={`cat-${cat.id}`}
                                type="radio" 
                                checked={category === cat.id}
                                onChange={() => handleCategoryChange(cat.id)}
                                className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-300"
                            />
                            <label htmlFor={`cat-${cat.id}`} className="ml-2 block text-sm text-gray-700">
                                {cat.label}
                            </label>
                        </div>
                    ))}
                  </div>
               </div>
            </div>
          </aside>

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
            ) : filteredAds.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAds.map(ad => (
                        <ServiceCard key={ad.id} ad={ad} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-white rounded-lg shadow-sm">
                    <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4">
                        <Search size={32} />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">Nenhum serviço encontrado</h3>
                    <p className="mt-2 text-gray-500">Tente ajustar seus filtros ou buscar por outro termo.</p>
                </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
