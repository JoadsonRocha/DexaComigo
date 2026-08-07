
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, User as UserIcon, MapPin, Phone, FileText, Save, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { store } from '../services/store';

const EditProfile: React.FC = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    location: '',
    phone: '',
    avatar: ''
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    setFormData({
      name: user.name || '',
      bio: user.bio || '',
      location: user.location || '',
      phone: user.phone || '',
      avatar: user.avatar || ''
    });
  }, [user, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setFormData(prev => ({ ...prev, avatar: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      await store.updateProfile(user.id, formData);
      // Recarregar os dados do usuário no contexto
      await login(user.email); 
      navigate('/dashboard');
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      alert("Houve um erro ao salvar as alterações.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="flex-1 bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center text-gray-600 hover:text-brand-600 mb-6 transition-colors font-medium"
        >
          <ArrowLeft size={18} className="mr-2" /> Voltar ao Painel
        </button>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-brand-600 h-32 relative">
            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden bg-gray-100 shadow-lg">
                  {formData.avatar ? (
                    <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <UserIcon size={40} />
                    </div>
                  )}
                </div>
                <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                  <Camera className="text-white" size={24} />
                  <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                </label>
              </div>
            </div>
          </div>

          <div className="pt-16 pb-10 px-8">
            <h1 className="text-2xl font-bold text-gray-900 text-center mb-1">Editar Perfil</h1>
            <p className="text-gray-500 text-center mb-8 text-sm">Atualize suas informações para os clientes</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="flex items-center text-sm font-semibold text-gray-700 mb-1">
                    <UserIcon size={16} className="mr-2 text-brand-500" /> Nome Completo
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all"
                    placeholder="Seu nome"
                  />
                </div>

                <div>
                  <label className="flex items-center text-sm font-semibold text-gray-700 mb-1">
                    <FileText size={16} className="mr-2 text-brand-500" /> Biografia Profissional
                  </label>
                  <textarea
                    name="bio"
                    rows={4}
                    value={formData.bio}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all"
                    placeholder="Conte um pouco sobre sua experiência e especialidades..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center text-sm font-semibold text-gray-700 mb-1">
                      <MapPin size={16} className="mr-2 text-brand-500" /> Localização
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all"
                      placeholder="Ex: São Paulo, SP"
                    />
                  </div>
                  <div>
                    <label className="flex items-center text-sm font-semibold text-gray-700 mb-1">
                      <Phone size={16} className="mr-2 text-brand-500" /> Telefone / WhatsApp
                    </label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all"
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100 flex gap-4">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="flex-1 py-3 px-4 border border-gray-300 rounded-xl text-gray-700 font-bold hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 px-4 bg-brand-600 text-white rounded-xl font-bold shadow-lg hover:bg-brand-700 transition-all flex items-center justify-center disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="animate-spin mr-2" size={20} />
                  ) : (
                    <Save className="mr-2" size={20} />
                  )}
                  {loading ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
