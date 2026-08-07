import { ServiceAd, User, UserRole } from './types';

export const CATEGORIES = [
  { id: 'all', label: 'Todas' },
  { id: 'hair', label: 'Cabelo', icon: 'Scissors' },
  { id: 'makeup', label: 'Maquiagem', icon: 'Brush' },
  { id: 'nails', label: 'Manicure & Pedicure', icon: 'Sparkles' },
  { id: 'hair-removal', label: 'Depilação', icon: 'Droplet' },
  { id: 'massage', label: 'Massagem', icon: 'Flower2' },
  { id: 'eyebrows', label: 'Sobrancelhas & Cílios', icon: 'Eye' },
];

export const MOCK_USERS: User[] = [
  {
    id: 'u1',
    name: 'Juliana Silva',
    email: 'juliana@example.com',
    role: UserRole.PROVIDER,
    location: 'São Paulo, SP',
    phone: '11999999999',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
    bio: 'Especialista em loiros e cortes modernos. Atendimento no conforto da sua casa.',
    isCertified: true
  },
  {
    id: 'u2',
    name: 'Ana Souza',
    email: 'ana@example.com',
    role: UserRole.CLIENT,
    location: 'Rio de Janeiro, RJ'
  },
  {
    id: 'u3',
    name: 'Marcia Costa',
    email: 'marcia@example.com',
    role: UserRole.PROVIDER,
    location: 'Curitiba, PR',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
    isCertified: true
  },
  {
    id: 'u4',
    name: 'Fernanda Lima',
    email: 'fernanda@example.com',
    role: UserRole.PROVIDER,
    location: 'São Paulo, SP',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    isCertified: true
  }
];

export const MOCK_ADS: ServiceAd[] = [
  {
    id: 'ad1',
    providerId: 'u1',
    providerName: 'Juliana Silva',
    title: 'Mechas, Coloração e Cortes',
    description: 'Transforme seu visual sem sair de casa. Utilizo apenas produtos profissionais (Wella, L\'Oréal). O valor inclui avaliação capilar prévia e deslocamento em SP capital.',
    category: 'hair',
    price: 350,
    priceUnit: 'estimate',
    location: 'São Paulo, SP',
    images: ['https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1605980776566-0486c3ac7617?auto=format&fit=crop&q=80&w=800'],
    rating: 4.9,
    reviewCount: 32,
    reviews: [],
    isPremium: true,
    createdAt: '2023-10-01',
    whatsapp: '5511999999999',
    isCertified: true
  },
  {
    id: 'ad2',
    providerId: 'u3',
    providerName: 'Marcia Costa',
    title: 'Maquiagem Social e Noivas',
    description: 'Maquiagem de longa duração para eventos, formaturas e casamentos. Produtos hipoalergênicos e à prova d\'água. Deslocamento incluso.',
    category: 'makeup',
    price: 180,
    priceUnit: 'job',
    location: 'Curitiba, PR',
    images: ['https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&q=80&w=800'],
    rating: 5.0,
    reviewCount: 15,
    reviews: [],
    isPremium: false,
    createdAt: '2023-10-05',
    whatsapp: '5541999999999',
    isCertified: true
  },
  {
    id: 'ad3',
    providerId: 'u4',
    providerName: 'Fernanda Lima',
    title: 'Manicure e Pedicure Spa',
    description: 'Spa dos pés e mãos com esmaltação tradicional ou em gel. Material 100% esterilizado em autoclave.',
    category: 'nails',
    price: 60,
    priceUnit: 'job',
    location: 'São Paulo, SP',
    images: ['https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&q=80&w=800'],
    rating: 4.8,
    reviewCount: 45,
    reviews: [],
    isPremium: true,
    createdAt: '2023-10-10',
    whatsapp: '5511988888888',
    isCertified: true
  }
];
