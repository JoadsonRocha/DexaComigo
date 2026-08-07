import React from 'react';
import { Link } from 'react-router-dom';

const Terms: React.FC = () => {
  return (
    <div className="flex-1 bg-white py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Termos de Uso</h1>
        <p className="text-gray-500 text-sm mb-8">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>

        <div className="space-y-6 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-2">1. Sobre o Mais Beleza</h2>
            <p>
              O Mais Beleza é uma plataforma de classificados que conecta profissionais de beleza
              certificadas a clientes que desejam atendimento em domicílio. O Mais Beleza apenas
              facilita a conexão; os serviços são prestados diretamente entre o profissional e o cliente.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-2">2. Responsabilidade</h2>
            <p>
              O Mais Beleza não é intermediador de pagamentos e não se responsabiliza por serviços
              contratados, valores acordados ou eventuais danos decorrentes da prestação de serviço
              entre as partes. Recomendamos que o cliente verifique a certificação e o histórico da
              profissional antes de contratar.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-2">3. Uso da plataforma</h2>
            <p>
              Ao criar um anúncio, o profissional declara que as informações são verdadeiras e que
              possui as qualificações necessárias. É proibido publicar conteúdo ofensivo, ilegal ou
              que viole direitos de terceiros. O Mais Beleza pode remover anúncios e suspender contas
              que descumpram estas regras.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-2">4. Disponibilidade</h2>
            <p>
              Estamos em fase de desenvolvimento e funcionalidades podem mudar sem aviso prévio.
              Não garantimos disponibilidade ininterrupta da plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-2">5. Contato</h2>
            <p>
              Dúvidas sobre estes termos: <a href="mailto:suporte@maisbeleza.com.br" className="text-brand-600 font-medium hover:underline">suporte@maisbeleza.com.br</a>
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

export default Terms;
