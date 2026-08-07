
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
  hair: <Scissors size={24} />,
  makeup: <Brush size={24} />,
  nails: <Sparkles size={24} />,
  'hair-removal': <Droplet size={24} />,
  massage: <Flower2 size={24} />,
  eyebrows: <Eye size={24} />,
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
            // Featured: Premium or high rated
            const featured = ads.filter(ad => ad.isPremium || ad.rating >= 4.0).slice(0, 4);
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
          <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-8 leading-[1.1]">
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
                        className="w-full pl-14 pr-4 py-4 rounded-2xl border-none focus:ring-0 text-gray-900 placeholder-gray-500 text-lg"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button 
                    type="submit"
                    className="px-10 py-4 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-2xl transition-all shadow-xl hover:shadow-brand-500/40 flex items-center justify-center text-lg active:scale-95"
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

      {/* Categories Explanation */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">O que você está procurando?</h2>
                <p className="text-gray-500 text-lg max-w-2xl mx-auto font-light">Profissionais de beleza certificadas, prontas para te atender no conforto da sua casa.</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
                {CATEGORIES.filter(c => c.id !== 'all').map(cat => (
                    <Link 
                        key={cat.id} 
                        to={`/search?c=${cat.id}`}
                        className="group flex flex-col items-center p-8 bg-white rounded-[2.5rem] border border-gray-100 hover:shadow-[0_20px_50px_rgba(124,58,237,0.1)] hover:border-brand-200 transition-all duration-500"
                    >
                        <div className="w-20 h-20 rounded-3xl bg-brand-50 text-brand-600 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-brand-600 group-hover:text-white transition-all duration-500 shadow-sm">
                            {iconMap[cat.id] || <ArrowRight size={28} />}
                        </div>
                        <h3 className="font-bold text-gray-800 text-lg text-center mb-2">{cat.label}</h3>
                        <div className="h-1 w-8 bg-brand-200 rounded-full mb-3 group-hover:w-16 transition-all duration-500"></div>
                        <p className="text-xs text-gray-400 text-center opacity-0 group-hover:opacity-100 transition-all duration-500">Explorar serviços</p>
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
                    <div className="w-14 h-14 bg-brand-600 rounded-2xl flex items-center justify-center mb-8 text-white font-bold text-2xl group-hover:rotate-12 transition-transform shadow-[0_10px_30px_rgba(124,58,237,0.3)]">
                        1
                    </div>
                    <h3 className="text-2xl font-bold mb-4">Busca Facilitada</h3>
                    <p className="text-gray-400 leading-relaxed font-light">
                        Use filtros de categoria, preço e localização para achar exatamente quem você precisa. Sem anúncios irrelevantes.
                    </p>
                </div>

                <div className="relative group">
                    <div className="w-14 h-14 bg-brand-600 rounded-2xl flex items-center justify-center mb-8 text-white font-bold text-2xl group-hover:rotate-12 transition-transform shadow-[0_10px_30px_rgba(124,58,237,0.3)]">
                        2
                    </div>
                    <h3 className="text-2xl font-bold mb-4">Contato Direto</h3>
                    <p className="text-gray-400 leading-relaxed font-light">
                        Não intermediamos o seu dinheiro. Converse via chat interno ou vá direto para o WhatsApp do profissional para fechar o orçamento.
                    </p>
                </div>

                <div className="relative group">
                    <div className="w-14 h-14 bg-brand-600 rounded-2xl flex items-center justify-center mb-8 text-white font-bold text-2xl group-hover:rotate-12 transition-transform shadow-[0_10px_30px_rgba(124,58,237,0.3)]">
                        3
                    </div>
                    <h3 className="text-2xl font-bold mb-4">Avaliação Real</h3>
                    <p className="text-gray-400 leading-relaxed font-light">
                        Após o serviço, deixe sua opinião. Isso ajuda outros usuários a contratarem com segurança e premia os melhores profissionais.
                    </p>
                </div>
            </div>
        </div>
      </section>

      {/* Featured Services (Demo Section) */}
      <section className="py-28 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-4">
                <div className="text-left">
                    <h2 className="text-4xl font-bold text-gray-900 tracking-tight">Destaques da Comunidade</h2>
                    <p className="text-gray-500 mt-3 text-lg font-light">Conheça algumas das profissionais que são referência no Mais Beleza.</p>
                </div>
                <Link to="/search" className="group text-brand-600 font-bold flex items-center hover:text-brand-700 bg-white px-8 py-4 rounded-2xl shadow-sm border border-gray-100 transition-all active:scale-95">
                    Ver todos os profissionais <ArrowRight size={20} className="ml-3 group-hover:translate-x-2 transition-transform" />
                </Link>
            </div>
            
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 animate-pulse">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-[420px] bg-gray-200 rounded-[2.5rem]"></div>)}
                </div>
            ) : featuredAds.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {featuredAds.map(ad => (
                        <ServiceCard key={ad.id} ad={ad} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-gray-200">
                    <p className="text-gray-400">Nenhum anúncio em destaque no momento.</p>
                </div>
            )}
        </div>
      </section>

      {/* Demo Call to Action */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-brand-600 rounded-[4rem] p-12 md:p-24 text-center text-white relative overflow-hidden shadow-[0_50px_100px_-20px_rgba(124,58,237,0.5)]">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 rounded-full -mr-32 -mt-32 blur-[80px]"></div>
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-black/10 rounded-full -ml-32 -mb-32 blur-[80px]"></div>
                
                <h2 className="text-4xl md:text-6xl font-bold mb-8 relative z-10 tracking-tight leading-tight">Quer fazer parte da<br/>nossa rede?</h2>
                <p className="text-brand-100 text-xl md:text-2xl mb-12 max-w-3xl mx-auto relative z-10 font-light leading-relaxed">
                    Estamos em fase beta (Demo). Você pode anunciar seus serviços agora mesmo e testar todas as funcionalidades gratuitamente.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-6 relative z-10">
                    <Link to="/create-ad" className="bg-white text-brand-600 font-bold px-12 py-5 rounded-[2rem] hover:bg-gray-50 transition-all text-xl shadow-2xl active:scale-95">
                        Criar meu anúncio
                    </Link>
                    <Link to="/login" className="bg-brand-700 text-white font-bold px-12 py-5 rounded-[2rem] hover:bg-brand-800 transition-all text-xl border border-brand-500/50 active:scale-95">
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
