-- Habilitar a extensão para gerar UUIDs (padrão no Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. ENUMS (Tipos customizados)
-- ==========================================
CREATE TYPE user_role AS ENUM ('CLIENT', 'PROVIDER', 'ADMIN');
CREATE TYPE price_unit AS ENUM ('hour', 'job', 'estimate');

-- ==========================================
-- 2. TABELAS
-- ==========================================

-- Tabela de Perfis (Estende a tabela nativa auth.users do Supabase)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role user_role NOT NULL DEFAULT 'CLIENT',
  avatar TEXT,
  location TEXT,
  phone TEXT,
  bio TEXT,
  is_certified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de Anúncios de Serviços (+B Mais Beleza)
CREATE TABLE service_ads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  price_unit price_unit NOT NULL DEFAULT 'job',
  location TEXT NOT NULL,
  images TEXT[] DEFAULT '{}', -- Array de URLs de imagens
  rating DECIMAL(3, 2) DEFAULT 0.00,
  review_count INTEGER DEFAULT 0,
  is_premium BOOLEAN DEFAULT false,
  whatsapp TEXT NOT NULL,
  availability TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de Avaliações (Reviews)
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ad_id UUID NOT NULL REFERENCES service_ads(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de Sessões de Chat (Negociações)
CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ad_id UUID NOT NULL REFERENCES service_ads(id) ON DELETE CASCADE,
  last_message TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de Participantes do Chat (Relacionamento N:M)
CREATE TABLE chat_participants (
  session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  PRIMARY KEY (session_id, user_id)
);

-- Tabela de Mensagens do Chat
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- ==========================================
-- 3. SEGURANÇA (Row Level Security - RLS)
-- ==========================================
-- O Supabase exige que habilitemos o RLS para segurança

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Políticas para Profiles
CREATE POLICY "Perfis são públicos para leitura" ON profiles FOR SELECT USING (true);
CREATE POLICY "Usuários inserem seu próprio perfil" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Usuários atualizam seu próprio perfil" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Políticas para Service Ads (Anúncios)
CREATE POLICY "Anúncios são públicos para leitura" ON service_ads FOR SELECT USING (true);
CREATE POLICY "Profissionais criam seus próprios anúncios" ON service_ads FOR INSERT WITH CHECK (auth.uid() = provider_id);
CREATE POLICY "Profissionais atualizam seus próprios anúncios" ON service_ads FOR UPDATE USING (auth.uid() = provider_id);
CREATE POLICY "Profissionais deletam seus próprios anúncios" ON service_ads FOR DELETE USING (auth.uid() = provider_id);

-- Políticas para Reviews
CREATE POLICY "Reviews são públicos para leitura" ON reviews FOR SELECT USING (true);
CREATE POLICY "Usuários autenticados podem criar reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = author_id);

-- Políticas para Chat Sessions
CREATE POLICY "Usuários autenticados podem ler sessões" ON chat_sessions FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Usuários autenticados podem criar sessões" ON chat_sessions FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Usuários autenticados podem atualizar sessões" ON chat_sessions FOR UPDATE USING (auth.role() = 'authenticated');

-- Políticas para Chat Participants
ALTER TABLE chat_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuários autenticados podem ler participantes" ON chat_participants FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Usuários autenticados podem inserir participantes" ON chat_participants FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Políticas para Messages
CREATE POLICY "Usuários autenticados podem ler mensagens" ON messages FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Usuários enviam mensagens com seu próprio ID" ON messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Usuários podem marcar mensagens como lidas" ON messages FOR UPDATE USING (auth.role() = 'authenticated');
