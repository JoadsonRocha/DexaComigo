import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  ArrowRight, 
  Sparkles, 
  Scissors,
  Brush,
  Droplet,
  Flower2,
  Eye,
  CheckCircle2,
  Users
} from 'lucide-react';
import { store } from '../services/store';
import { ServiceCard } from '../components/UI';
import { CATEGORIES } from '../constants';
import { ServiceAd } from '../types';

// Mapeamento de ícones para as categorias
const iconMap: Record<string, React.ReactNode> = {
  hair: <Scissors size={20} />,
  makeup: <Brush size={20} />,
  nails: <Sparkles size={20} />,
  'hair-removal': <Droplet size={20} />,
  eyebrows: <Eye size={20} />,
  facial: <Sparkles size={20} />,
  body: <Flower2 size={20} />,
};

const Home: React.FC = () => {
  const [featuredAds, setFeaturedAds] = useState<ServiceAd[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadAds = async () => {
        try {
            // Featured: All active ads, sorted by rating/reviews
            const ads = await store.getAds();
            // Sort locally by rating/reviews
            const featured = ads.sort((a, b) => {
                if (b.rating !== a.rating) return b.rating - a.rating;
                return b.reviewCount - a.reviewCount;
            });
            setFeaturedAds(featured);
        } catch (e) {
            console.error("Erro ao carregar anúncios:", e);
        } finally {
            setLoading(false);
        }
    };
    loadAds();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm.trim()) params.append('q', searchTerm.trim());
    navigate(params.toString() ? `/search?${params.toString()}` : `/search`);
  };

  return (
    <div className="flex-1 bg-white flex flex-col">
      {/* Hero Section */}
            <section role="banner" className="relative bg-brand-900 pt-24 pb-[84px] overflow-hidden h-[45vh] md:h-[55vh] lg:h-[60vh] max-h-[680px]">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-brand-900 mix-blend-multiply opacity-85"></div>
          <img 
                        src="https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" 
                        className="w-full h-full object-cover" 
                        alt="Profissional de beleza em atendimento"
                        loading="lazy"
                        aria-hidden="true"
          />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center py-1 px-4 rounded-full bg-brand-500/30 text-brand-200 text-xs font-bold uppercase tracking-widest mb-6 border border-brand-400/20 backdrop-blur-md">
            <Users size={14} className="mr-2" /> Profissionais Certificadas em Domicílio
          </div>
                    <h1 className="text-4xl md:text-7xl font-extrabold text-white tracking-tighter mb-6 leading-[1.02]">
                        Beleza que cuida.<br/>
                        <span className="text-brand-400">Liberdade que transforma.</span>
                    </h1>
          <p className="max-w-3xl mx-auto text-lg md:text-2xl text-brand-100 mb-12 leading-relaxed font-light">
            Conectamos você a profissionais de beleza certificadas. Atendimento especializado no conforto da sua casa, gerando impacto social e autonomia.
          </p>

          <div className="w-full max-w-3xl mx-auto">
             <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-2 bg-white p-1.5 rounded-3xl shadow-2xl border border-white/20">
                <div className="flex-1 relative">
                    <label htmlFor="home-search" className="sr-only">Pesquisar serviços</label>
                    <Search aria-hidden="true" className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
                    <input 
                        id="home-search"
                        name="q"
                        type="text" 
                        placeholder="Cabelo, Maquiagem..." 
                        className="w-full pl-11 pr-4 py-2.5 md:py-3 rounded-2xl border-none focus:ring-0 text-gray-900 placeholder-gray-500 text-base md:text-lg"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        aria-label="Pesquisar serviços"
                    />
                </div>
                <button 
                    type="submit"
                    aria-label="Pesquisar serviços"
                    className="px-6 md:px-10 py-2.5 md:py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-2xl transition-all shadow-xl hover:shadow-brand-500/40 flex items-center justify-center text-base md:text-lg active:scale-95"
                >
                    Encontrar agora
                </button>
             </form>
             <div className="mt-5 flex flex-wrap justify-center gap-6 text-brand-200 text-sm font-medium">
                <span className="flex items-center"><CheckCircle2 size={18} className="mr-2 text-brand-400" /> Sem custos de agenciamento</span>
                <span className="flex items-center"><CheckCircle2 size={18} className="mr-2 text-brand-400" /> WhatsApp Direto</span>
                <span className="flex items-center"><CheckCircle2 size={18} className="mr-2 text-brand-400" /> Histórico de confiança</span>
             </div>
          </div>
        </div>
      </section>

      {/* Categories OLX Style */}
      <section className="py-8 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex overflow-x-auto pb-4 pt-2 gap-4 md:gap-8 scrollbar-hide snap-x md:justify-center">
                {CATEGORIES.filter(c => c.id !== 'all').map(cat => (
                    <Link 
                        key={cat.id} 
                        to={`/categoria/${cat.id}`}
                        className="group flex flex-col items-center min-w-[84px] md:min-w-[100px] snap-start"
                    >
                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center mb-3 group-hover:bg-brand-600 group-hover:text-white transition-all duration-300 shadow-sm border border-brand-100 group-hover:shadow-md group-hover:scale-105">
                            {iconMap[cat.id] || <ArrowRight size={28} className="md:w-8 md:h-8" />}
                        </div>
                        <h3 className="font-medium text-gray-700 text-[11px] md:text-sm text-center whitespace-normal leading-tight w-20 md:w-24 group-hover:text-brand-600">{cat.label}</h3>
                    </Link>
                ))}
            </div>
        </div>
      </section>

      {/* Featured Services (Destaques) */}
      <section id="featured-services" aria-labelledby="featured-heading" className="py-16 md:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-end mb-10 md:mb-12 gap-4">
                <div className="text-left">
                    <h2 id="featured-heading" className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">Serviços em destaque</h2>
                    <p className="text-gray-500 mt-1 text-sm md:text-sm font-light">Conheça as profissionais que são referência.</p>
                </div>
                <Link to="/search" className="group text-brand-600 font-bold flex items-center hover:text-brand-700 bg-white px-5 md:px-6 py-2.5 md:py-3 rounded-xl shadow-sm border border-gray-100 transition-all active:scale-95 text-sm md:text-base">
                    Ver todos <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>
            
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-[380px] bg-gray-200 rounded-2xl"></div>)}
                </div>
            ) : featuredAds.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {featuredAds.map(ad => (
                        <div key={ad.id} className="scale-95 origin-top">
                           <ServiceCard ad={ad} compact />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
                    <p className="text-gray-400">Nenhum anúncio em destaque no momento.</p>
                </div>
            )}
        </div>
      </section>



      {/* How it Works Section (Explanation) */}
      <section className="py-28 bg-gray-900 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-600/10 blur-[120px] rounded-full -mr-64 -mt-64"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-400/5 blur-[120px] rounded-full -ml-64 -mb-64"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-20">
                <h2 className="text-4xl font-bold mb-4 tracking-tight">Transparência do início ao fim</h2>
                <p className="text-gray-400 text-lg max-w-2xl mx-auto font-light">Entenda como o Mais Beleza facilita a conexão entre você e a profissional de beleza.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
                <div className="relative group">
                    <div className="w-12 h-12 md:w-14 md:h-14 bg-brand-600 rounded-2xl flex items-center justify-center mb-6 md:mb-8 text-white font-bold text-xl md:text-2xl group-hover:rotate-12 transition-transform shadow-[0_10px_30px_rgba(124,58,237,0.3)]">
                        1
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Busca Facilitada</h3>
                    <p className="text-gray-400 leading-relaxed font-light text-sm md:text-base">
                        Use filtros de categoria, preço e localização para achar exatamente quem você precisa. Sem anúncios irrelevantes.
                    </p>
                </div>

                <div className="relative group">
                    <div className="w-12 h-12 md:w-14 md:h-14 bg-brand-600 rounded-2xl flex items-center justify-center mb-6 md:mb-8 text-white font-bold text-xl md:text-2xl group-hover:rotate-12 transition-transform shadow-[0_10px_30px_rgba(124,58,237,0.3)]">
                        2
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Contato Direto</h3>
                    <p className="text-gray-400 leading-relaxed font-light text-sm md:text-base">
                        Não intermediamos o seu dinheiro. Converse via chat interno ou vá direto para o WhatsApp do profissional para fechar o orçamento.
                    </p>
                </div>

                <div className="relative group">
                    <div className="w-12 h-12 md:w-14 md:h-14 bg-brand-600 rounded-2xl flex items-center justify-center mb-6 md:mb-8 text-white font-bold text-xl md:text-2xl group-hover:rotate-12 transition-transform shadow-[0_10px_30px_rgba(124,58,237,0.3)]">
                        3
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Avaliação Real</h3>
                    <p className="text-gray-400 leading-relaxed font-light text-sm md:text-base">
                        Após o serviço, deixe sua opinião. Isso ajuda outros usuários a contratarem com segurança e premia os melhores profissionais.
                    </p>
                </div>
            </div>
        </div>
      </section>



      {/* Demo Call to Action */}
      <section className="py-8 md:py-12 mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-brand-600 rounded-3xl md:rounded-[3rem] p-6 md:p-12 text-center text-white relative overflow-hidden shadow-[0_30px_60px_-15px_rgba(124,58,237,0.4)]">
                <div className="absolute top-0 right-0 w-[200px] md:w-[300px] h-[200px] md:h-[300px] bg-white/10 rounded-full -mr-16 -mt-16 blur-[60px]"></div>
                <div className="absolute bottom-0 left-0 w-[200px] md:w-[300px] h-[200px] md:h-[300px] bg-black/10 rounded-full -ml-16 -mb-16 blur-[60px]"></div>
                
                <h2 className="text-2xl md:text-5xl font-bold mb-4 md:mb-6 relative z-10 tracking-tight leading-tight">Quer fazer parte da<br/>nossa rede?</h2>
                <p className="text-brand-100 text-base md:text-xl mb-8 md:mb-10 max-w-3xl mx-auto relative z-10 font-light leading-relaxed">
                    Estamos em fase beta (Demo). Você pode anunciar seus serviços agora mesmo e testar todas as funcionalidades gratuitamente.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4 md:gap-6 relative z-10">
                    <Link to="/create-ad" className="bg-white text-brand-600 font-bold px-8 md:px-12 py-4 md:py-5 rounded-2xl md:rounded-[2rem] hover:bg-gray-50 transition-all text-lg md:text-xl shadow-2xl active:scale-95">
                        Criar meu anúncio
                    </Link>
                    <Link to="/login" className="bg-brand-700 text-white font-bold px-8 md:px-12 py-4 md:py-5 rounded-2xl md:rounded-[2rem] hover:bg-brand-800 transition-all text-lg md:text-xl border border-brand-500/50 active:scale-95">
                        Testar como profissional
                    </Link>
                </div>
            </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
