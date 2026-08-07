export enum UserRole {
  CLIENT = 'CLIENT',
  PROVIDER = 'PROVIDER',
  ADMIN = 'ADMIN'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  location?: string;
  phone?: string;
  bio?: string;
  isCertified?: boolean;
}

export interface Review {
  id: string;
  authorId: string;
  authorName: string;
  rating: number; // 1-5
  comment: string;
  date: string;
}

export interface ServiceAd {
  id: string;
  providerId: string;
  providerName: string;
  title: string;
  description: string;
  category: string;
  price: number;
  priceUnit: 'hour' | 'job' | 'estimate';
  location: string;
  images: string[];
  rating: number;
  reviewCount: number;
  reviews: Review[];
  isPremium?: boolean;
  createdAt: string;
  whatsapp: string;
  availability?: string; // New field e.g., "Seg à Sex, 08:00 - 18:00"
  isCertified?: boolean;
}

export interface FilterState {
  category: string;
  query: string;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
}

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  read: boolean;
  timestamp: string;
}

export interface ChatSession {
  id: string;
  participants: string[]; // [userId1, userId2]
  adId: string;
  adTitle: string;
  lastMessage?: string;
  unreadCount?: number;
  updatedAt: string;
  messages: Message[];
}