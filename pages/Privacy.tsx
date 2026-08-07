import React from 'react';
import { Link } from 'react-router-dom';

const Privacy: React.FC = () => {
  return (
    <div className="flex-1 bg-white py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Política de Privacidade</h1>
        <p className="text-gray-500 text-sm mb-8">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>

        <div className="space-y-6 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-2">1. Dados coletados</h2>
            <p>
              Coletamos informações fornecidas por você ao criar sua conta ou anúncio, como nome,
              e-mail, telefone, endereço e fotos. Também coletamos dados de navegação básicos para
              melhorar a plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-2">2. Uso dos dados</h2>
            <p>
              Seus dados são usados para operar a plataforma: exibir seu perfil e anúncios, permitir
              contato entre clientes e profissionais, processar agendamentos e melhorar os serviços.
              Não vendemos seus dados pessoais a terceiros.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-2">3. Localização</h2>
            <p>
              Com sua permissão, utilizamos sua localização aproximada para buscar profissionais na
              sua região. Você pode revogar essa permissão a qualquer momento nas configurações do
              navegador.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-2">4. Compartilhamento</h2>
            <p>
              Informações públicas do seu perfil e anúncios (nome, foto, serviços) ficam visíveis a
              outros usuários da plataforma. Seus dados de contato são compartilhados apenas com
              usuários com quem você interage.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-2">5. Segurança e exclusão</h2>
            <p>
              Aplicamos boas práticas de segurança para proteger seus dados. Você pode solicitar a
              exclusão da sua conta e dos seus dados entrando em contato conosco.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-2">6. Contato</h2>
            <p>
              Dúvidas sobre esta política: <a href="mailto:suporte@maisbeleza.com.br" className="text-brand-600 font-medium hover:underline">suporte@maisbeleza.com.br</a>
            </p>
          </section>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-100">
          <Link to="/" className="text-brand-600 font-medium hover:underline">← Voltar ao início</Link>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
