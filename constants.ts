import { ServiceAd, User, UserRole } from './types';

export const CATEGORIES = [
  { id: 'all', label: 'Todas' },
  { id: 'home', label: 'Casa & Construção', icon: 'Hammer' },
  { id: 'tech', label: 'Tecnologia', icon: 'Laptop' },
  { id: 'beauty', label: 'Beleza & Estética', icon: 'Sparkles' },
  { id: 'education', label: 'Aulas & Educação', icon: 'BookOpen' },
  { id: 'events', label: 'Festas & Eventos', icon: 'PartyPopper' },
  { id: 'health', label: 'Saúde', icon: 'Heart' },
  { id: 'transport', label: 'Transporte', icon: 'Truck' },
  { id: 'cleaning', label: 'Limpeza', icon: 'SprayCan' },
];

export const MOCK_USERS: User[] = [
  {
    id: 'u1',
    name: 'Carlos Silva',
    email: 'carlos@example.com',
    role: UserRole.PROVIDER,
    location: 'São Paulo, SP',
    phone: '11999999999',
    avatar: 'https://picsum.photos/100/100?random=1',
    bio: 'Eletricista com 10 anos de experiência.'
  },
  {
    id: 'u2',
    name: 'Ana Souza',
    email: 'ana@example.com',
    role: UserRole.CLIENT,
    location: 'Rio de Janeiro, RJ'
  }
];

export const MOCK_ADS: ServiceAd[] = [
  {
    id: 'ad1',
    providerId: 'u1',
    providerName: 'Carlos Silva',
    title: 'Eletricista Residencial e Predial',
    description: 'Realizo instalações elétricas, troca de fiação, instalação de chuveiros e tomadas. Atendo emergências 24h em toda a região central.',
    category: 'home',
    price: 150,
    priceUnit: 'job',
    location: 'São Paulo, SP',
    images: ['https://picsum.photos/400/300?random=10', 'https://picsum.photos/400/300?random=11'],
    rating: 4.8,
    reviewCount: 24,
    reviews: [],
    isPremium: true,
    createdAt: '2023-10-01',
    whatsapp: '5511999999999'
  },
  {
    id: 'ad2',
    providerId: 'u3',
    providerName: 'Mariana Costa',
    title: 'Aulas Particulares de Inglês',
    description: 'Aulas personalizadas para todos os níveis. Conversação, gramática e preparação para TOEFL/IELTS. Online ou presencial.',
    category: 'education',
    price: 80,
    priceUnit: 'hour',
    location: 'Online / Curitiba, PR',
    images: ['https://picsum.photos/400/300?random=12'],
    rating: 5.0,
    reviewCount: 12,
    reviews: [],
    isPremium: false,
    createdAt: '2023-10-05',
    whatsapp: '5541999999999'
  },
  {
    id: 'ad3',
    providerId: 'u4',
    providerName: 'DevSolutions',
    title: 'Desenvolvimento de Sites e Apps',
    description: 'Criação de landing pages, e-commerce e sistemas web. Tecnologias modernas e design responsivo.',
    category: 'tech',
    price: 0,
    priceUnit: 'estimate',
    location: 'Remoto',
    images: ['https://picsum.photos/400/300?random=13'],
    rating: 4.9,
    reviewCount: 8,
    reviews: [],
    isPremium: true,
    createdAt: '2023-10-10',
    whatsapp: '5511988888888'
  },
  {
    id: 'ad4',
    providerId: 'u5',
    providerName: 'Pedro Jardineiro',
    title: 'Jardinagem e Paisagismo',
    description: 'Manutenção de jardins, poda de árvores e projetos paisagísticos para casas e condomínios.',
    category: 'home',
    price: 200,
    priceUnit: 'job',
    location: 'Belo Horizonte, MG',
    images: ['https://picsum.photos/400/300?random=14'],
    rating: 4.5,
    reviewCount: 5,
    reviews: [],
    isPremium: false,
    createdAt: '2023-10-12',
    whatsapp: '5531999999999'
  },
];
