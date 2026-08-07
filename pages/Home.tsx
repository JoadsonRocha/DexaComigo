
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
  MessageSquare,
  CalendarCheck,
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
  massage: <Flower2 size={20} />,
  eyebrows: <Eye size={20} />,
};

const Home: React.FC = () => {
  const [featuredAds, setFeaturedAds] = useState<ServiceAd[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadAds = async () => {
        try {
            const ads = await store.getAds();
            // Featured: Highest rated with most feedback
            const featured = ads
              .sort((a, b) => {
                // Primary sort: Rating (descending)
                if (b.rating !== a.rating) return b.rating - a.rating;
                // Secondary sort: Number of reviews (descending)
                return b.reviewCount - a.reviewCount;
              })
              .slice(0, 4);
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
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
    } else {
      navigate(`/search`);
    }
  };

  return (
    <div className="flex-1 bg-white flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-brand-900 pt-24 pb-36 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-brand-900 mix-blend-multiply opacity-85"></div>
          <img 
            src="https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" 
            className="w-full h-full object-cover" 
            alt="Profissional de beleza em atendimento"
          />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center py-1 px-4 rounded-full bg-brand-500/30 text-brand-200 text-xs font-bold uppercase tracking-widest mb-6 border border-brand-400/20 backdrop-blur-md">
            <Users size={14} className="mr-2" /> Profissionais Certificadas em Domicílio
          </div>
          <h1 className="text-4xl md:text-7xl font-extrabold text-white tracking-tight mb-8 leading-[1.1]">
            Beleza que cuida.<br/>
            <span className="text-brand-400">Liberdade que transforma.</span>
          </h1>
          <p className="max-w-3xl mx-auto text-lg md:text-2xl text-brand-100 mb-12 leading-relaxed font-light">
            Conectamos você a profissionais de beleza certificadas. Atendimento especializado no conforto da sua casa, gerando impacto social e autonomia.
          </p>

          <div className="w-full max-w-3xl mx-auto">
             <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3 bg-white p-2 rounded-3xl shadow-2xl border border-white/20">
                <div className="flex-1 relative">
                    <Search className="absolute left-5 top-4 text-gray-400 w-6 h-6" />
                    <input 
                        type="text" 
                        placeholder="Ex: Cabelo, Maquiagem, Manicure..." 
                        className="w-full pl-12 md:pl-14 pr-4 py-3 md:py-4 rounded-2xl border-none focus:ring-0 text-gray-900 placeholder-gray-500 text-base md:text-lg"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button 
                    type="submit"
                    className="px-6 md:px-10 py-3 md:py-4 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-2xl transition-all shadow-xl hover:shadow-brand-500/40 flex items-center justify-center text-base md:text-lg active:scale-95"
                >
                    Encontrar agora
                </button>
             </form>
             <div className="mt-6 flex flex-wrap justify-center gap-6 text-brand-200 text-sm font-medium">
                <span className="flex items-center"><CheckCircle2 size={18} className="mr-2 text-brand-400" /> Sem custos de agenciamento</span>
                <span className="flex items-center"><CheckCircle2 size={18} className="mr-2 text-brand-400" /> WhatsApp Direto</span>
                <span className="flex items-center"><CheckCircle2 size={18} className="mr-2 text-brand-400" /> Histórico de confiança</span>
             </div>
          </div>
        </div>
      </section>

      {/* Featured Services (Destaques) */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
                <div className="text-left">
                    <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Destaques da Comunidade</h2>
                    <p className="text-gray-500 mt-2 text-base font-light">Conheça as profissionais que são referência.</p>
                </div>
                <Link to="/search" className="group text-brand-600 font-bold flex items-center hover:text-brand-700 bg-white px-6 py-3 rounded-xl shadow-sm border border-gray-100 transition-all active:scale-95">
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
                           <ServiceCard ad={ad} />
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

      {/* Categories Explanation */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">Categorias</h2>
                <p className="text-gray-500 text-base max-w-2xl mx-auto font-light">Encontre exatamente o que você precisa.</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {CATEGORIES.filter(c => c.id !== 'all').slice(0, 6).map(cat => (
                    <Link 
                        key={cat.id} 
                        to={`/search?c=${cat.id}`}
                        className="group flex flex-col items-center p-4 bg-white rounded-2xl border border-gray-100 hover:shadow-md hover:border-brand-200 transition-all duration-300"
                    >
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-3 group-hover:bg-brand-600 group-hover:text-white transition-all duration-300">
                            {iconMap[cat.id] || <ArrowRight size={20} />}
                        </div>
                        <h3 className="font-bold text-gray-800 text-xs md:text-sm text-center mb-1">{cat.label}</h3>
                    </Link>
                ))}
            </div>
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
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-brand-600 rounded-3xl md:rounded-[4rem] p-8 md:p-24 text-center text-white relative overflow-hidden shadow-[0_50px_100px_-20px_rgba(124,58,237,0.5)]">
                <div className="absolute top-0 right-0 w-[300px] md:w-[400px] h-[300px] md:h-[400px] bg-white/10 rounded-full -mr-32 -mt-32 blur-[80px]"></div>
                <div className="absolute bottom-0 left-0 w-[300px] md:w-[400px] h-[300px] md:h-[400px] bg-black/10 rounded-full -ml-32 -mb-32 blur-[80px]"></div>
                
                <h2 className="text-3xl md:text-6xl font-bold mb-6 md:mb-8 relative z-10 tracking-tight leading-tight">Quer fazer parte da<br/>nossa rede?</h2>
                <p className="text-brand-100 text-lg md:text-2xl mb-10 md:mb-12 max-w-3xl mx-auto relative z-10 font-light leading-relaxed">
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
