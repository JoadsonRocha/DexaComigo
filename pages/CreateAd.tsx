
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Sparkles, Wand2, Upload, X, Clock, Calendar, Loader2, MapPin, LocateFixed } from 'lucide-react';
import { store, uploadImage } from '../services/store';
import { generateServiceDescription, suggestCategory } from '../services/geminiService';
import { CATEGORIES } from '../constants';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const DAYS_OF_WEEK = [
  { id: 'seg', label: 'Seg' },
  { id: 'ter', label: 'Ter' },
  { id: 'qua', label: 'Qua' },
  { id: 'qui', label: 'Qui' },
  { id: 'sex', label: 'Sex' },
  { id: 'sab', label: 'Sáb' },
  { id: 'dom', label: 'Dom' },
];

const CreateAd: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    category: 'hair',
    price: '',
    priceUnit: 'job',
    location: '',
    whatsapp: '',
    description: '',
    keywords: '' 
  });

  // Availability State
  const [selectedDays, setSelectedDays] = useState<string[]>(['seg', 'ter', 'qua', 'qui', 'sex']);
  const [hoursStart, setHoursStart] = useState('08:00');
  const [hoursEnd, setHoursEnd] = useState('18:00');

  // Images State
  const [images, setImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<(File | null)[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState('');
  const [loadingAd, setLoadingAd] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);

  // Tags State
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;

  // Initial load for editing
  React.useEffect(() => {
    if (isEditing && user) {
        setLoadingAd(true);
        store.getAds().then(ads => {
            const ad = ads.find(a => a.id === id);
            if (ad && ad.providerId === user.id) {
                setFormData({
                    title: ad.title,
                    category: ad.category,
                    price: ad.price.toString(),
                    priceUnit: ad.priceUnit,
                    location: ad.location,
                    whatsapp: ad.whatsapp,
                    description: ad.description,
                    keywords: ''
                });
                setImages(ad.images || []);
                setTags(ad.tags || []);
                
                // Parse availability if possible, else leave defaults
                // Format was: "Seg, Ter, 08:00 - 18:00"
                if (ad.availability) {
                    const parts = ad.availability.split(',');
                    const timePart = parts[parts.length - 1].trim(); // "08:00 - 18:00"
                    if (timePart.includes('-')) {
                        const times = timePart.split('-');
                        setHoursStart(times[0].trim());
                        setHoursEnd(times[1].trim());
                    }
                }
            } else {
                navigate('/dashboard'); // Not authorized or doesn't exist
            }
            setLoadingAd(false);
        });
    }
  }, [id, isEditing, user, navigate]);

  // Redirect if not logged in
  if (!user) {
    return (
        <div className="flex-1 flex items-center justify-center bg-gray-50 px-4">
            <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">Você precisa estar logado</h2>
                <p className="mb-6 text-gray-600">Para anunciar seus serviços, faça login ou crie uma conta.</p>
                <button onClick={() => navigate('/login')} className="bg-brand-600 text-white px-6 py-2 rounded-md">Ir para Login</button>
            </div>
        </div>
    )
  }

  // Redirect if user is CLIENT
  if (user.role === 'CLIENT') {
    return (
        <div className="flex-1 flex items-center justify-center bg-gray-50 px-4">
            <div className="text-center max-w-md">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">Acesso Restrito</h2>
                <p className="mb-6 text-gray-600">Sua conta atual é de Cliente. Para criar anúncios e oferecer serviços, você precisa de uma conta de Profissional.</p>
                <button onClick={() => navigate('/')} className="bg-brand-600 text-white px-6 py-2 rounded-md">Voltar ao Início</button>
            </div>
        </div>
    )
  }

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast("Seu navegador não suporta geolocalização.", 'error');
      return;
    }

    setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`);
          const data = await response.json();
          
          if (data && data.address) {
            const addr = data.address;
            const neighborhood = addr.suburb || addr.neighbourhood || addr.district || '';
            const city = addr.city || addr.town || addr.village || '';
            const state = addr.state || '';
            
            let locationStr = '';
            if (neighborhood && city && state) {
              locationStr = `${neighborhood}, ${city} - ${state}`;
            } else if (city && state) {
              locationStr = `${city} - ${state}`;
            } else {
              locationStr = data.display_name.split(',').slice(0, 3).join(',');
            }
            
            setFormData(prev => ({ ...prev, location: locationStr }));
          }
        } catch (error) {
          console.error("Erro ao buscar endereço:", error);
          toast("Não foi possível buscar seu endereço automaticamente.", 'error');
        } finally {
          setLoadingLocation(false);
        }
      },
      (error) => {
        console.error("Erro de geolocalização:", error);
        toast("Permissão de localização negada ou indisponível.", 'error');
        setLoadingLocation(false);
      }
    );
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDayToggle = (dayId: string) => {
    setSelectedDays(prev => 
      prev.includes(dayId) ? prev.filter(d => d !== dayId) : [...prev, dayId]
    );
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      Array.from(e.target.files).forEach((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result) {
            setImages(prev => [...prev, reader.result as string]);
            setImageFiles(prev => [...prev, file]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (newTag && !tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleGenerateDescription = async () => {
    if (!formData.title) {
        setGenerationError('Digite um título primeiro.');
        return;
    }
    
    setIsGenerating(true);
    setGenerationError('');
    
    // Suggest category first
    const suggestedCat = await suggestCategory(formData.title);
    if (suggestedCat && CATEGORIES.some(c => c.id === suggestedCat)) {
        setFormData(prev => ({ ...prev, category: suggestedCat }));
    }

    // Generate text
    const desc = await generateServiceDescription(formData.title, formData.category, formData.keywords || formData.title);
    
    setFormData(prev => ({ ...prev, description: desc }));
    setIsGenerating(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setSubmitting(true);
    try {
      // Upload new images to Supabase Storage (keep existing URLs in edit mode)
      const finalImages: string[] = [];
      for (let i = 0; i < images.length; i++) {
        const file = imageFiles[i];
        if (file) {
          const url = await uploadImage(file);
          finalImages.push(url);
        } else {
          finalImages.push(images[i]);
        }
      }

      // Format availability string
      const selectedDayLabels = selectedDays.map(id => DAYS_OF_WEEK.find(d => d.id === id)?.label).join(', ');
      const availabilityString = selectedDays.length > 0 ? `${selectedDayLabels}, ${hoursStart} - ${hoursEnd}` : '';

      if (isEditing && id) {
          await store.updateAd(id, {
              title: formData.title,
              description: formData.description,
              category: formData.category,
              price: Number(formData.price) || 0,
              priceUnit: formData.priceUnit as 'job' | 'hour' | 'estimate',
              location: formData.location,
              whatsapp: formData.whatsapp,
              images: finalImages.length > 0 ? finalImages : undefined,
              availability: availabilityString,
              tags: tags
          });
          toast('Anúncio atualizado com sucesso!', 'success');
          navigate('/dashboard');
      } else {
          const newAd = await store.addAd({
              providerId: user.id,
              title: formData.title,
              description: formData.description,
              category: formData.category,
              price: Number(formData.price) || 0,
              priceUnit: formData.priceUnit as 'job' | 'hour' | 'estimate',
              location: formData.location,
              whatsapp: formData.whatsapp,
              images: finalImages.length > 0 ? finalImages : ['https://picsum.photos/400/300?random=' + Math.floor(Math.random() * 100)],
              isPremium: false,
              availability: availabilityString,
              tags: tags
          });
          toast('Anúncio criado com sucesso!', 'success');
          navigate('/dashboard');
      }
    } catch (err: any) {
      console.error("Erro ao salvar anúncio:", err);
      toast('Não foi possível salvar o anúncio. Tente novamente.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingAd) {
      return <div className="flex-1 flex items-center justify-center bg-gray-50"><Loader2 className="animate-spin text-brand-600" size={40} /></div>;
  }

  return (
    <div className="flex-1 bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-brand-700 py-6 px-8">
                <h1 className="text-2xl font-bold text-white">{isEditing ? 'Editar Anúncio' : 'Anunciar Serviço de Beleza'}</h1>
                <p className="text-brand-100">{isEditing ? 'Atualize as informações do seu serviço.' : 'Preencha os dados para que clientes te encontrem para atendimento em domicílio.'}</p>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                
                {/* Basic Info */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Título do Serviço</label>
                    <input 
                        type="text" 
                        name="title"
                        required
                        className="w-full border border-gray-300 rounded-md p-2 focus:ring-brand-500 focus:border-brand-500"
                        placeholder="Ex: Maquiagem para Noivas, Mechas e Luzes..."
                        value={formData.title}
                        onChange={handleInputChange}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                        <select 
                            name="category"
                            value={formData.category}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded-md p-2 focus:ring-brand-500 focus:border-brand-500"
                        >
                            {CATEGORIES.filter(c => c.id !== 'all').map(c => (
                                <option key={c.id} value={c.id}>{c.label}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-sm font-medium text-gray-700">Região de Atendimento (Domicílio)</label>
                            <button 
                                type="button"
                                onClick={handleGetLocation}
                                disabled={loadingLocation}
                                className="text-xs text-brand-600 hover:text-brand-700 font-semibold flex items-center disabled:opacity-50"
                            >
                                {loadingLocation ? <Loader2 size={12} className="animate-spin mr-1" /> : <LocateFixed size={12} className="mr-1" />}
                                Usar GPS
                            </button>
                        </div>
                        <div className="relative">
                            <input 
                                type="text" 
                                name="location"
                                required
                                className="w-full border border-gray-300 rounded-md p-2 pl-8 focus:ring-brand-500 focus:border-brand-500"
                                placeholder="Ex: Pinheiros, São Paulo - SP"
                                value={formData.location}
                                onChange={handleInputChange}
                            />
                            <MapPin className="absolute left-2.5 top-2.5 text-gray-400 w-4 h-4" />
                        </div>
                    </div>
                </div>

                {/* Photos Section */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fotos do Serviço</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-brand-400 transition-colors">
                        <input 
                            type="file" 
                            id="photo-upload" 
                            multiple 
                            accept="image/*"
                            className="hidden" 
                            onChange={handleImageUpload}
                        />
                        <label htmlFor="photo-upload" className="cursor-pointer flex flex-col items-center justify-center">
                            <Upload className="w-10 h-10 text-gray-400 mb-2" />
                            <span className="text-sm text-gray-600 font-medium">Clique para adicionar fotos</span>
                            <span className="text-xs text-gray-400 mt-1">PNG, JPG (Máx 5MB)</span>
                        </label>
                    </div>
                    
                    {images.length > 0 && (
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 mt-4">
                            {images.map((img, idx) => (
                                <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200">
                                    <img src={img} alt="Preview" className="w-full h-full object-cover" />
                                    <button 
                                        type="button"
                                        onClick={() => removeImage(idx)}
                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Tags Section */}
                <div className="bg-white">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tags do Serviço (Opcional)</label>
                    <p className="text-xs text-gray-500 mb-2">Digite uma característica (ex: vegano, domicílio) e aperte Enter ou Vírgula.</p>
                    <div className="border border-gray-300 rounded-md p-2 focus-within:ring-1 focus-within:ring-brand-500 focus-within:border-brand-500 flex flex-wrap gap-2 items-center bg-white">
                        {tags.map(tag => (
                            <span key={tag} className="flex items-center bg-brand-50 text-brand-700 text-sm px-2 py-1 rounded-md border border-brand-100">
                                {tag}
                                <button type="button" onClick={() => removeTag(tag)} className="ml-1 text-brand-500 hover:text-brand-800">
                                    <X size={14} />
                                </button>
                            </span>
                        ))}
                        <input 
                            type="text" 
                            className="flex-1 outline-none min-w-[120px] text-sm p-1"
                            placeholder={tags.length === 0 ? "Adicionar tag..." : ""}
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={handleTagKeyDown}
                        />
                    </div>
                </div>

                {/* AI Assistant Section */}
                <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 relative">
                    <div className="absolute -top-3 left-4 bg-indigo-600 text-white text-xs px-2 py-1 rounded-full flex items-center shadow-sm">
                        <Sparkles size={12} className="mr-1" /> IA Assistant
                    </div>
                    
                    <div className="mt-2 mb-3">
                         <label className="block text-sm font-medium text-indigo-900 mb-1">Palavras-chave (Opcional)</label>
                         <input 
                            type="text" 
                            name="keywords"
                            placeholder="Ex: vegano, hipoalergênico, material esterilizado"
                            className="w-full border border-indigo-200 rounded-md p-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                            value={formData.keywords}
                            onChange={handleInputChange}
                         />
                         <p className="text-xs text-indigo-600 mt-1">Ajuda a IA a criar uma descrição mais precisa.</p>
                    </div>

                    <button
                        type="button"
                        onClick={handleGenerateDescription}
                        disabled={isGenerating}
                        className="flex items-center justify-center w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium transition-colors disabled:opacity-50"
                    >
                        {isGenerating ? 'Gerando...' : (
                            <>
                                <Wand2 size={16} className="mr-2" /> Gerar Descrição com IA
                            </>
                        )}
                    </button>
                    {generationError && <p className="text-red-500 text-xs mt-2">{generationError}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descrição Detalhada</label>
                    <textarea 
                        name="description"
                        required
                        rows={6}
                        className="w-full border border-gray-300 rounded-md p-2 focus:ring-brand-500 focus:border-brand-500"
                        placeholder="Descreva seus serviços, diferenciais e experiência..."
                        value={formData.description}
                        onChange={handleInputChange}
                    />
                </div>

                {/* Availability Section */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                        <Calendar size={16} className="mr-2 text-brand-600"/> Disponibilidade
                    </h3>
                    
                    <div className="mb-4">
                        <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Dias de Atendimento</label>
                        <div className="flex flex-wrap gap-2">
                            {DAYS_OF_WEEK.map(day => (
                                <button
                                    type="button"
                                    key={day.id}
                                    onClick={() => handleDayToggle(day.id)}
                                    className={`
                                        px-3 py-1 text-sm rounded-full border transition-all
                                        ${selectedDays.includes(day.id) 
                                            ? 'bg-brand-600 text-white border-brand-600 shadow-sm' 
                                            : 'bg-white text-gray-600 border-gray-300 hover:border-brand-400'
                                        }
                                    `}
                                >
                                    {day.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Das</label>
                            <div className="relative">
                                <Clock className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" />
                                <input 
                                    type="time" 
                                    value={hoursStart}
                                    onChange={(e) => setHoursStart(e.target.value)}
                                    className="w-full pl-9 border border-gray-300 rounded-md p-2 text-sm"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Até as</label>
                            <div className="relative">
                                <Clock className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" />
                                <input 
                                    type="time" 
                                    value={hoursEnd}
                                    onChange={(e) => setHoursEnd(e.target.value)}
                                    className="w-full pl-9 border border-gray-300 rounded-md p-2 text-sm"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Preço (R$)</label>
                        <input 
                            type="number" 
                            name="price"
                            className="w-full border border-gray-300 rounded-md p-2 focus:ring-brand-500 focus:border-brand-500"
                            placeholder="0 para 'A combinar'"
                            value={formData.price}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cobrança</label>
                        <select 
                            name="priceUnit"
                            value={formData.priceUnit}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded-md p-2 focus:ring-brand-500 focus:border-brand-500"
                        >
                            <option value="job">Por Serviço</option>
                            <option value="hour">Por Hora</option>
                            <option value="estimate">Orçamento</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp (apenas números)</label>
                        <input 
                            type="text" 
                            name="whatsapp"
                            required
                            className="w-full border border-gray-300 rounded-md p-2 focus:ring-brand-500 focus:border-brand-500"
                            placeholder="5511999999999"
                            value={formData.whatsapp}
                            onChange={handleInputChange}
                        />
                    </div>
                </div>

                <div className="pt-4 border-t border-gray-200 flex justify-end">
                    <button 
                        type="button" 
                        onClick={() => navigate('/')}
                        className="mr-4 px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                        Cancelar
                    </button>
                    <button 
                        type="submit" 
                        disabled={submitting}
                        className="px-6 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-md font-bold shadow-sm disabled:opacity-50"
                    >
                        {submitting ? 'Salvando...' : (isEditing ? 'Salvar Alterações' : 'Publicar Anúncio')}
                    </button>
                </div>

            </form>
        </div>
      </div>
    </div>
  );
};

export default CreateAd;
