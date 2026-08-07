-- =============================================
-- DexaComigo — Políticas RLS corrigidas
-- Execute no Supabase → SQL Editor
-- Aplica uma vez; as políticas são idempotentes (drop + create).
-- =============================================

-- ================= PROFILES =================
alter table public.profiles enable row level security;

drop policy if exists "Profiles são públicos" on public.profiles;
drop policy if exists "Qualquer um pode criar profiles" on public.profiles;
drop policy if exists "Usuários atualizam seus próprios profiles" on public.profiles;

-- Leitura pública (perfis aparecem em anúncios e avaliações)
create policy "Profiles são públicos" on public.profiles
  for select using (true);

-- O usuário só cria o próprio perfil
create policy "Usuário cria seu próprio profile" on public.profiles
  for insert with check (auth.uid() = id);

-- O usuário só edita o próprio perfil
create policy "Usuário edita seu próprio profile" on public.profiles
  for update using (auth.uid() = id);

-- ================= SERVICE_ADS =================
alter table public.service_ads enable row level security;

drop policy if exists "Anúncios são públicos" on public.service_ads;
drop policy if exists "Qualquer um pode criar anúncios" on public.service_ads;
drop policy if exists "Atualização de anúncios" on public.service_ads;

-- Leitura pública
create policy "Anúncios são públicos" on public.service_ads
  for select using (true);

-- O profissional cria apenas os próprios anúncios
create policy "Profissional cria seus anúncios" on public.service_ads
  for insert with check (auth.uid() = provider_id);

-- Apenas o dono atualiza
create policy "Dono atualiza seu anúncio" on public.service_ads
  for update using (auth.uid() = provider_id);

-- Apenas o dono exclui
create policy "Dono exclui seu anúncio" on public.service_ads
  for delete using (auth.uid() = provider_id);

-- ================= REVIEWS =================
alter table public.reviews enable row level security;

drop policy if exists "Reviews são públicas" on public.reviews;
drop policy if exists "Qualquer um pode criar reviews" on public.reviews;

-- Leitura pública
create policy "Reviews são públicas" on public.reviews
  for select using (true);

-- O usuário só cria avaliação em nome próprio (e não de si mesmo, validado no app)
create policy "Usuário autenticado cria reviews" on public.reviews
  for insert with check (auth.uid() = author_id);

-- ================= CHAT =================
alter table public.chat_sessions enable row level security;
alter table public.chat_participants enable row level security;
alter table public.messages enable row level security;

drop policy if exists "Participante vê sessão" on public.chat_sessions;
drop policy if exists "Participante cria sessão" on public.chat_sessions;
drop policy if exists "Participante vê participante" on public.chat_participants;
drop policy if exists "Participante entra na sessão" on public.chat_participants;
drop policy if exists "Participante lê mensagens" on public.messages;
drop policy if exists "Participante envia mensagem" on public.messages;
drop policy if exists "Participante marca como lida" on public.messages;

-- Sessão: só participantes veem
create policy "Participante vê sessão" on public.chat_sessions
  for select using (
    auth.uid() in (select user_id from public.chat_participants where session_id = id)
  );

-- Sessão: autenticado pode criar (participantes são validados na inserção abaixo)
create policy "Participante cria sessão" on public.chat_sessions
  for insert with check (true);

-- Participantes: só participantes da própria sessão veem a lista
create policy "Participante vê participante" on public.chat_participants
  for select using (
    auth.uid() in (select user_id from public.chat_participants where session_id = session_id)
  );

-- Participante: o usuário só entra nas sessões como ele mesmo
create policy "Participante entra na sessão" on public.chat_participants
  for insert with check (auth.uid() = user_id);

-- Mensagens: só participantes leem
create policy "Participante lê mensagens" on public.messages
  for select using (
    auth.uid() in (select user_id from public.chat_participants where session_id = session_id)
  );

-- Mensagens: o usuário só envia como ele mesmo
create policy "Participante envia mensagem" on public.messages
  for insert with check (auth.uid() = sender_id);

-- Mensagens: participantes atualizam (para marcar como lida)
create policy "Participante marca como lida" on public.messages
  for update using (
    auth.uid() in (select user_id from public.chat_participants where session_id = session_id)
  );

-- ================= APPOINTMENTS =================
alter table public.appointments enable row level security;

drop policy if exists "Envolvidos veem agendamento" on public.appointments;
drop policy if exists "Cliente cria agendamento" on public.appointments;
drop policy if exists "Envolvidos atualizam agendamento" on public.appointments;

-- Só cliente e profissional envolvidos veem
create policy "Envolvidos veem agendamento" on public.appointments
  for select using (auth.uid() = client_id or auth.uid() = provider_id);

-- Cliente cria agendamento em nome próprio
create policy "Cliente cria agendamento" on public.appointments
  for insert with check (auth.uid() = client_id);

-- Envolvidos podem atualizar o status (confirmar/cancelar/concluir)
create policy "Envolvidos atualizam agendamento" on public.appointments
  for update using (auth.uid() = client_id or auth.uid() = provider_id);

-- ================= REALTIME =================
-- Necessário para o chat e para notificações de agendamentos em tempo real
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.appointments;

-- ================= STORAGE =================
-- Opcional: buckets de imagens. Crie os buckets 'ad-images' e 'avatars' no dashboard
-- (Storage → New bucket → name: ad-images / avatars, Public bucket: sim), e então rode:
-- create policy "Público lê imagens de anúncios" on storage.objects
--   for select using (bucket_id = 'ad-images');
-- create policy "Autenticado envia imagens de anúncios" on storage.objects
--   for insert with check (bucket_id = 'ad-images' and auth.role() = 'authenticated');
-- create policy "Público lê avatares" on storage.objects
--   for select using (bucket_id = 'avatars');
-- create policy "Autenticado envia avatares" on storage.objects
--   for insert with check (bucket_id = 'avatars' and auth.role() = 'authenticated');
