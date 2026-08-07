
import { createClient } from '@supabase/supabase-js';
import { ServiceAd, User, UserRole, ChatSession, Message, Review } from '../types';

export interface GetAdsParams {
  category?: string;
  searchTerm?: string;
  location?: string;
  providerId?: string;
  priceRange?: string;
  isPremium?: boolean;
  page?: number;
  limit?: number;
}

/**
 * GUIA DE CONFIGURAÇÃO SQL PARA O SUPABASE (Execute no SQL Editor):
 * 
 * -- Permitir inserção de perfis (RLS para a tabela profiles)
 * CREATE POLICY "Profiles são públicos" ON profiles FOR SELECT USING (true);
 * CREATE POLICY "Qualquer um pode criar profiles" ON profiles FOR INSERT WITH CHECK (true);
 * CREATE POLICY "Usuários atualizam seus próprios profiles" ON profiles FOR UPDATE USING (true);
 * 
 * -- Permitir inserção de avaliações (RLS para a tabela reviews)
 * CREATE POLICY "Reviews são públicas" ON reviews FOR SELECT USING (true);
 * CREATE POLICY "Qualquer um pode criar reviews" ON reviews FOR INSERT WITH CHECK (true);
 * 
 * -- Permitir interação com anúncios
 * CREATE POLICY "Anúncios são públicos" ON service_ads FOR SELECT USING (true);
 * CREATE POLICY "Qualquer um pode criar anúncios" ON service_ads FOR INSERT WITH CHECK (true);
 * CREATE POLICY "Atualização de anúncios" ON service_ads FOR UPDATE USING (true);
 */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://tdbtkmtjtkidfesgalgk.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'COLE_A_ANON_KEY_DO_PROJETO_AQUI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

class Store {
  private mapAd(data: any): ServiceAd {
    return {
      id: data.id,
      providerId: data.provider_id,
      providerName: data.profiles?.name || 'Profissional',
      title: data.title,
      description: data.description,
      category: data.category,
      price: data.price,
      priceUnit: data.price_unit,
      location: data.location,
      images: data.images || [],
      rating: data.rating || 0,
      reviewCount: data.review_count || 0,
      reviews: (data.reviews || []).map((r: any) => ({
        id: r.id,
        authorId: r.author_id,
        authorName: r.author_name,
        rating: r.rating,
        comment: r.comment,
        date: r.created_at
      })),
      isPremium: data.is_premium,
      createdAt: data.created_at,
      whatsapp: data.whatsapp,
      availability: data.availability,
      tags: data.tags || [],
      providerAvatar: data.profiles?.avatar || undefined,
      isCertified: data.profiles?.is_certified || false
    };
  }

  async getAds(params?: GetAdsParams): Promise<ServiceAd[]> {
    let query = supabase.from('service_ads').select('*, profiles(name, avatar, is_certified)');
    
    if (params?.category && params.category !== 'all') {
      query = query.eq('category', params.category);
    }
    if (params?.providerId) {
      query = query.eq('provider_id', params.providerId);
    }
    if (params?.location) {
      query = query.ilike('location', `%${params.location}%`);
    }
    if (params?.isPremium !== undefined) {
      query = query.eq('is_premium', params.isPremium);
    }
    if (params?.priceRange && params.priceRange !== 'all') {
        if (params.priceRange === 'low') query = query.lte('price', 100).gt('price', 0);
        if (params.priceRange === 'mid') query = query.gt('price', 100).lte('price', 300);
        if (params.priceRange === 'high') query = query.gt('price', 300);
        if (params.priceRange === 'estimate') query = query.eq('price', 0);
    }
    if (params?.searchTerm) {
      // Basic ilike search on title or description
      query = query.or(`title.ilike.%${params.searchTerm}%,description.ilike.%${params.searchTerm}%`);
    }

    const limit = params?.limit || 50;
    const page = params?.page || 1;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    query = query.range(from, to).order('created_at', { ascending: false });

    const { data, error } = await query;
    
    if (error) { console.error("Store Error [getAds]:", error); throw error; }
    return (data || []).map(ad => this.mapAd(ad));
  }

  async getAdById(id: string): Promise<ServiceAd | null> {
    const { data, error } = await supabase
      .from('service_ads')
      .select('*, profiles(name, avatar, is_certified), reviews(*)')
      .eq('id', id)
      .single();
    
    if (error || !data) { console.error("Store Error [getAdById]:", error); return null; }
    return this.mapAd(data);
  }

  async addAd(ad: Omit<ServiceAd, 'id' | 'createdAt' | 'rating' | 'reviewCount' | 'reviews' | 'providerName'>): Promise<ServiceAd> {
    const { data, error } = await supabase
      .from('service_ads')
      .insert([{
        provider_id: ad.providerId,
        title: ad.title,
        description: ad.description,
        category: ad.category,
        price: ad.price,
        price_unit: ad.priceUnit,
        location: ad.location,
        images: ad.images,
        whatsapp: ad.whatsapp,
        availability: ad.availability,
        tags: ad.tags || [],
        is_premium: ad.isPremium || false
      }])
      .select()
      .single();
    
    if (error) { console.error("Store Error [addAd]:", error); throw error; }
    return this.mapAd(data);
  }

  async updateAd(id: string, ad: Partial<ServiceAd>): Promise<void> {
    const updateData: any = { updated_at: new Date().toISOString() };
    if (ad.title !== undefined) updateData.title = ad.title;
    if (ad.description !== undefined) updateData.description = ad.description;
    if (ad.category !== undefined) updateData.category = ad.category;
    if (ad.price !== undefined) updateData.price = ad.price;
    if (ad.priceUnit !== undefined) updateData.price_unit = ad.priceUnit;
    if (ad.location !== undefined) updateData.location = ad.location;
    if (ad.whatsapp !== undefined) updateData.whatsapp = ad.whatsapp;
    if (ad.images !== undefined) updateData.images = ad.images;
    if (ad.availability !== undefined) updateData.availability = ad.availability;
    if (ad.tags !== undefined) updateData.tags = ad.tags;

    const { error } = await supabase
      .from('service_ads')
      .update(updateData)
      .eq('id', id);
      
    if (error) { console.error("Store Error [updateAd]:", error); throw error; }
  }

  async addReview(adId: string, review: Omit<Review, 'id' | 'date'>): Promise<void> {
    const { error: reviewError } = await supabase
      .from('reviews')
      .insert([{
        ad_id: adId,
        author_id: review.authorId,
        author_name: review.authorName,
        rating: review.rating,
        comment: review.comment
      }]);
    
    if (reviewError) { console.error("Store Error [addReview]:", reviewError); throw reviewError; }

    const { data: allReviews } = await supabase
      .from('reviews')
      .select('rating')
      .eq('ad_id', adId);
    
    if (allReviews && allReviews.length > 0) {
      const totalStars = allReviews.reduce((acc, r) => acc + r.rating, 0);
      const newRating = Number((totalStars / allReviews.length).toFixed(1));
      
      const { error: updateError } = await supabase
        .from('service_ads')
        .update({ 
          rating: newRating, 
          review_count: allReviews.length 
        })
        .eq('id', adId);

      if (updateError) console.warn("Could not update service rating:", updateError);
    }
  }

  async deleteAd(id: string): Promise<void> {
    const { error } = await supabase.from('service_ads').delete().eq('id', id);
    if (error) { console.error("Store Error [deleteAd]:", error); throw error; }
  }

  async getCurrentUser(): Promise<User | null> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !session.user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .maybeSingle();

    if (error || !data) return null;
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      role: data.role as UserRole,
      avatar: data.avatar,
      location: data.location,
      phone: data.phone,
      bio: data.bio
    };
  }

  async getUserProfile(userId: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, avatar, bio, location, role')
      .eq('id', userId)
      .maybeSingle();

    if (error || !data) return null;
    return {
      id: data.id,
      name: data.name,
      role: data.role as UserRole,
      avatar: data.avatar,
      location: data.location,
      bio: data.bio,
      email: '', // omitted for privacy in public profile
      phone: ''  // omitted for privacy unless needed (we can fetch later if required)
    };
  }

  async updateProfile(userId: string, updates: Partial<User>): Promise<User> {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        name: updates.name,
        bio: updates.bio,
        location: updates.location,
        phone: updates.phone,
        avatar: updates.avatar
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) { console.error("Store Error [updateProfile]:", error); throw error; }

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      role: data.role as UserRole,
      avatar: data.avatar,
      location: data.location,
      phone: data.phone,
      bio: data.bio
    };
  }

  async login(email: string, password?: string): Promise<User> {
    if (!password) throw new Error("Senha é obrigatória");
    
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
    });
    if (authError) throw authError;

    const userProfile = await this.getCurrentUser();
    if (!userProfile) throw new Error("Perfil não encontrado");
    return userProfile;
  }

  async register(email: string, password: string, name: string, role?: UserRole): Promise<void> {
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password
    });
    if (authError) throw authError;

    if (authData.user) {
        const { error: profileError } = await supabase
            .from('profiles')
            .insert([{
                id: authData.user.id,
                email: authData.user.email,
                name: name,
                role: role || 'PROVIDER',
                avatar: `https://picsum.photos/seed/${email}/100/100`
            }]);
        if (profileError) console.error("Error creating profile", profileError);
    }
  }

  async logout(): Promise<void> {
    await supabase.auth.signOut();
  }

  async getChats(userId: string): Promise<ChatSession[]> {
    const { data: participantData } = await supabase
        .from('chat_participants')
        .select('session_id')
        .eq('user_id', userId);
        
    if (!participantData || participantData.length === 0) return [];
    const sessionIds = participantData.map(p => p.session_id);
    
    const { data, error } = await supabase
      .from('chat_sessions')
      .select(`
        *,
        service_ads(title, provider_id),
        chat_participants(user_id, profiles(name)),
        messages(*)
      `)
      .in('id', sessionIds)
      .order('updated_at', { ascending: false });
    
    if (error) { console.error("Store Error [getChats]:", error); throw error; }
    
    return (data || []).map((c: any) => {
      const messages = (c.messages || []).map((m: any) => ({
        id: m.id,
        senderId: m.sender_id,
        text: m.text,
        read: m.read,
        timestamp: m.created_at
      })).sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

      const unreadCount = messages.filter((m: any) => !m.read && m.senderId !== userId).length;

      // Find the other participant's name
      const otherParticipant = (c.chat_participants || []).find((p: any) => p.user_id !== userId);
      const otherUserName = otherParticipant?.profiles?.name;

      const providerId = c.service_ads?.provider_id;
      const providerName = (c.chat_participants || []).find((p: any) => p.user_id === providerId)?.profiles?.name;
      const clientName = (c.chat_participants || []).find((p: any) => p.user_id !== providerId)?.profiles?.name;

      return {
        id: c.id,
        adId: c.ad_id,
        adTitle: c.service_ads?.title || 'Anúncio',
        participants: (c.chat_participants || []).map((p: any) => p.user_id),
        otherUserName: otherUserName,
        providerName,
        clientName,
        lastMessage: c.last_message,
        updatedAt: c.updated_at,
        unreadCount,
        messages
      };
    });
  }

  async getChatById(id: string, userId: string): Promise<ChatSession | null> {
    const { data, error } = await supabase
      .from('chat_sessions')
      .select(`
        *,
        service_ads(title, provider_id),
        chat_participants(user_id, profiles(name)),
        messages(*)
      `)
      .eq('id', id)
      .maybeSingle();
    
     if (error || !data) {
        if (error) console.error("Store Error [getChatById]:", error);
        return null;
    }

    const messages = (data.messages || []).map((m: any) => ({
      id: m.id,
      senderId: m.sender_id,
      text: m.text,
      read: m.read,
      timestamp: m.created_at
    })).sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    const unreadCount = messages.filter((m: any) => !m.read && m.senderId !== userId).length;

    // Find the other participant's name
    const otherParticipant = (data.chat_participants || []).find((p: any) => p.user_id !== userId);
    const otherUserName = otherParticipant?.profiles?.name;

    const providerId = data.service_ads?.provider_id;
    const providerName = (data.chat_participants || []).find((p: any) => p.user_id === providerId)?.profiles?.name;
    const clientName = (data.chat_participants || []).find((p: any) => p.user_id !== providerId)?.profiles?.name;

    return {
      id: data.id,
      adId: data.ad_id,
      adTitle: data.service_ads?.title || 'Anúncio',
      participants: (data.chat_participants || []).map((p: any) => p.user_id),
      otherUserName: otherUserName,
      providerName,
      clientName,
      lastMessage: data.last_message,
      updatedAt: data.updated_at,
      unreadCount,
      messages
    };
  }

  async markMessagesAsRead(sessionId: string, userId: string): Promise<void> {
    const { error } = await supabase
        .from('messages')
        .update({ read: true })
        .eq('session_id', sessionId)
        .neq('sender_id', userId)
        .eq('read', false);
    
    if (error) console.error("Store Error [markMessagesAsRead]:", error);
  }

  async getGlobalUnreadCount(userId: string): Promise<number> {
    const { data: participantData } = await supabase
        .from('chat_participants')
        .select('session_id')
        .eq('user_id', userId);
        
    if (!participantData || participantData.length === 0) return 0;
    const sessionIds = participantData.map(p => p.session_id);

    const { count, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .in('session_id', sessionIds)
        .neq('sender_id', userId)
        .eq('read', false);

    if (error) { console.error("Store Error [getGlobalUnreadCount]:", error); return 0; }
    return count || 0;
  }

  async startChat(clientId: string, providerId: string, adId: string, adTitle: string): Promise<string> {
    const { data: clientSessions } = await supabase
        .from('chat_participants')
        .select('session_id')
        .eq('user_id', clientId);
        
    if (clientSessions && clientSessions.length > 0) {
        const sessionIds = clientSessions.map(cs => cs.session_id);
        const { data: existingSession } = await supabase
            .from('chat_sessions')
            .select('id')
            .eq('ad_id', adId)
            .in('id', sessionIds)
            .maybeSingle();
            
        if (existingSession) return existingSession.id;
    }

    const { data: newSession, error: sessionError } = await supabase
      .from('chat_sessions')
      .insert([{ ad_id: adId }])
      .select()
      .single();
      
    if (sessionError) { console.error("Store Error [startChat]:", sessionError); throw sessionError; }

    await supabase.from('chat_participants').insert([
        { session_id: newSession.id, user_id: clientId },
        { session_id: newSession.id, user_id: providerId }
    ]);
    
    return newSession.id;
  }

  async sendMessage(chatId: string, senderId: string, text: string): Promise<void> {
    const { error: msgError } = await supabase.from('messages').insert([{
      session_id: chatId,
      sender_id: senderId,
      text: text
    }]);

    if (msgError) { console.error("Store Error [sendMessage]:", msgError); throw msgError; }

    await supabase.from('chat_sessions').update({
      last_message: text,
      updated_at: new Date().toISOString()
    }).eq('id', chatId);
  }

  // --- APPOINTMENTS ---
  async createAppointment(data: Omit<Appointment, 'id' | 'status' | 'createdAt' | 'adTitle' | 'clientName' | 'providerName' | 'clientAvatar'>): Promise<Appointment> {
    const { data: appointment, error } = await supabase
      .from('appointments')
      .insert([{
        client_id: data.clientId,
        provider_id: data.providerId,
        ad_id: data.adId,
        date: data.date,
        time: data.time,
        notes: data.notes,
        client_location: data.clientLocation
      }])
      .select()
      .single();

    if (error) { console.error("Store Error [createAppointment]:", error); throw error; }

    return {
      id: appointment.id,
      clientId: appointment.client_id,
      providerId: appointment.provider_id,
      adId: appointment.ad_id,
      date: appointment.date,
      time: appointment.time,
      notes: appointment.notes,
      status: appointment.status as AppointmentStatus,
      createdAt: appointment.created_at,
      clientLocation: appointment.client_location
    };
  }

  async getMyAppointments(userId: string, role: UserRole): Promise<Appointment[]> {
    const query = supabase.from('appointments').select(`
      *,
      service_ads(title),
      client:profiles!appointments_client_id_fkey(name, avatar),
      provider:profiles!appointments_provider_id_fkey(name)
    `);

    if (role === 'CLIENT') {
      query.eq('client_id', userId);
    } else {
      query.eq('provider_id', userId);
    }

    const { data, error } = await query.order('date', { ascending: false });

    if (error) { console.error("Store Error [getMyAppointments]:", error); throw error; }

    return (data || []).map((app: any) => ({
      id: app.id,
      clientId: app.client_id,
      providerId: app.provider_id,
      adId: app.ad_id,
      date: app.date,
      time: app.time,
      notes: app.notes,
      status: app.status as AppointmentStatus,
      createdAt: app.created_at,
      clientLocation: app.client_location,
      adTitle: app.service_ads?.title,
      clientName: app.client?.name,
      clientAvatar: app.client?.avatar,
      providerName: app.provider?.name
    }));
  }

  async updateAppointmentStatus(id: string, status: AppointmentStatus): Promise<void> {
    const { error } = await supabase
      .from('appointments')
      .update({ status })
      .eq('id', id);

    if (error) { console.error("Store Error [updateAppointmentStatus]:", error); throw error; }
  }
}

export const store = new Store();
