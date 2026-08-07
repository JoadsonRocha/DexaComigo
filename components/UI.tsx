import React from 'react';
import { Star, MapPin, CheckCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { CATEGORIES } from '../constants';
import { ServiceAd } from '../types';

export const Badge: React.FC<{ children: React.ReactNode; variant?: 'primary' | 'secondary' | 'outline' }> = ({ children, variant = 'primary' }) => {
  const styles = {
    primary: 'bg-brand-100 text-brand-800',
    secondary: 'bg-gray-100 text-gray-800',
    outline: 'border border-gray-200 text-gray-600',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[variant]}`}>
      {children}
    </span>
  );
};

export const RatingStars: React.FC<{ rating: number; count?: number; size?: number }> = ({ rating, count, size = 16 }) => {
  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          className={`${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
        />
      ))}
      {count !== undefined && (
        <span className="ml-1 text-xs text-gray-500">({count})</span>
      )}
    </div>
  );
};

export const ServiceCard: React.FC<{ ad: ServiceAd; compact?: boolean }> = ({ ad, compact = false }) => {
  const navigate = useNavigate();
  return (
    <Link to={`/service/${ad.id}`} className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-gray-100 flex flex-col h-full">
      <div className={`relative ${compact ? 'h-[140px] md:h-[188px]' : 'aspect-video'} overflow-hidden bg-gray-100`}>
        <img 
          src={ad.images[0]} 
          alt={ad.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {ad.isPremium && (
          <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-md shadow-sm flex items-center">
            <Star size={12} className="mr-1 fill-current" /> Destaque
          </div>
        )}
        <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded">
            {CATEGORIES.find(c => c.id === ad.category)?.label || ad.category}
        </div>
      </div>
      
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-1 group-hover:text-brand-600 transition-colors">
            {ad.title}
            </h3>
        </div>
        
        {ad.tags && ad.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
                {ad.tags.slice(0, 2).map(tag => (
                    <span key={tag} className="text-[10px] font-medium bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full border border-brand-100">
                        {tag}
                    </span>
                ))}
                {ad.tags.length > 2 && (
                    <span className="text-[10px] font-medium bg-gray-50 text-gray-500 px-2 py-0.5 rounded-full border border-gray-100">
                        +{ad.tags.length - 2}
                    </span>
                )}
            </div>
        )}

        <p className="text-sm text-gray-500 line-clamp-2 mb-3 flex-1">
          {ad.description}
        </p>

        <div className="mt-auto space-y-3">
             <div className="flex items-center text-xs text-gray-500">
                <MapPin size={14} className="mr-1 text-gray-400" />
                {ad.location}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <button 
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        navigate(`/profissional/${ad.providerId}`);
                    }}
                    className="flex items-center space-x-2 group/profile hover:bg-gray-50 p-1 -ml-1 rounded-lg transition-colors text-left"
                >
                    <div className="w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 text-xs font-bold group-hover/profile:bg-brand-600 group-hover/profile:text-white transition-colors overflow-hidden">
                        {ad.providerAvatar ? (
                            <img src={ad.providerAvatar} alt={ad.providerName} className="w-full h-full object-cover" />
                        ) : (
                            ad.providerName.charAt(0)
                        )}
                    </div>
                    <span className="text-xs text-gray-600 group-hover/profile:text-brand-600 truncate max-w-[100px] flex items-center transition-colors">
                        {ad.providerName}
                        {ad.isCertified && <CheckCircle size={12} className="ml-1 text-brand-500" title="Profissional Certificada" />}
                    </span>
                </button>
                <div className="text-right">
                    <span className="text-sm font-bold text-gray-900">
                        {ad.price === 0 ? 'A combinar' : `R$ ${ad.price}`}
                    </span>
                    {ad.price > 0 && <span className="text-xs text-gray-500 ml-1">/{ad.priceUnit === 'hour' ? 'h' : 'serviço'}</span>}
                </div>
            </div>
        </div>
      </div>
    </Link>
  );
};

export const CategoryPill: React.FC<{ id: string; label: string; active?: boolean; onClick: () => void; icon?: React.ReactNode }> = ({ id, label, active, onClick, icon }) => {
    return (
        <button
            onClick={onClick}
            className={`
                whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border
                ${active 
                    ? 'bg-brand-600 text-white border-brand-600 shadow-md transform scale-105' 
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                }
            `}
        >
            <div className="flex items-center space-x-2">
                {icon && <span>{icon}</span>}
                <span>{label}</span>
            </div>
        </button>
    )
}
