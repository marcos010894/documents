import { Check, X, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const Plans = () => {
  const navigate = useNavigate();
  const [userType, setUserType] = useState<string | null>(null);

  const generateLinkPlan = async (priceID: string, planSelectInfo: string) => {
    localStorage.setItem('priceID', priceID);
    localStorage.setItem('planSelectec', planSelectInfo);
    navigate('/registerEnterprise');
  };

  const allFeatures = [
    'Cadastro de usuário',
    'Informações básicas de contato',
    'Link do site/LinkedIn',
    'Descrição ilimitada',
    'Nível de divulgação',
    'Inclusão da Logomarca',
    'Licenças e Certificados',
    'Painel gerencial de acessos',
    'Palavras-chaves mais buscadas',
    'Página exclusiva',
    'Link WhatsApp',
    'Avaliações do Perfil',
    'Banco de Negócios',
  ];

  const basePlans = [
    {
      id: 1,
      name: 'Grátis',
      price: 0,
      priceText: 'Grátis para sempre',
      billingInfo: 'Até 01 usuário',
      buttonText: 'Experimente grátis',
      description: 'Para quem quer divulgar seu negócio/especialidade',
      popular: false,
      features: [
        'Cadastro de 1 usuário para empresa ou profissional autônomo',
        'Informações básicas de contato',
        'Link do site ou LinkedIn',
        'Descrição ilimitada de serviços, produtos ou especialidades',
        'Nível 4 de divulgação',
      ],
      planSelectInfo: 'MKTFREE',
      priceID: 'free',
      promotionLevel: 4,
    },
    {
      id: 2,
      name: 'Básico',
      price: 50,
      priceText: 'Usuário/mês',
      billingInfo: 'ou R$ 600,00 cobrados anualmente',
      buttonText: 'Quero esse Plano',
      description: 'Logomarca inclusa e Painel com Gestão de acessos ao Perfil',
      popular: true,
      priceID: 'price_1RSRQPBHToUdUF6aDosxIzQZ',
      planSelectInfo: 'MKTBASIC',
      features: [
        'Tudo do plano Grátis, mais:',
        'Inclusão da Logomarca',
        'Informações de Licenças e Certificados',
        'Acesso Painel gerencial com informações de visitas ao seu perfil',
        'Palavras-chaves mais buscadas',
        'Upgrade para nível 3 de divulgação',
      ],
      promotionLevel: 3,
    },
  ];

  const proPlan = {
    id: 3,
    name: 'Profissional',
    price: 100,
    priceText: 'Usuário/mês',
    billingInfo: 'ou R$ 1.200,00 cobrados anualmente',
    buttonText: 'Quero esse Plano',
    description: 'Freelancer/Autônomo tenha sua própria página e receba avaliações',
    popular: false,
    priceID: 'price_1RVnTDBHToUdUF6a7oZqu1Pp',
    planSelectInfo: 'MKTPRO',
    features: [
      'Tudo do plano Básico, mais:',
      'Página exclusiva para divulgação de serviços',
      'Link de contato via WhatsApp',
      'Link para avaliações do Perfil',
      'Upgrade para nível 2 de divulgação',
      'Participa do Banco de Negócios para Freelancers/autônomos',
    ],
    promotionLevel: 2,
  };

  const corpPlan = {
    id: 4,
    name: 'Corporativo',
    price: 200,
    priceText: 'Usuário/mês',
    billingInfo: 'ou R$ 2.400,00 cobrados anualmente',
    buttonText: 'Quero esse Plano',
    description: 'Para empresas que querem destaque e mais visibilidade',
    popular: false,
    priceID: 'price_1RVnSvBHToUdUF6armda27eO',
    planSelectInfo: 'MKTCORP',
    features: [
      'Tudo do plano Básico, mais:',
      'Página exclusiva para empresa',
      'Atendimento prioritário',
      'Upgrade para nível 1 de divulgação',
      'Participa do Banco de Negócios para Empresas',
    ],
    promotionLevel: 1,
  };


  const personalized = {
    id: 3,
    name: 'Sob demanda',
    price: 100,
    priceText: 'Personalizado',
    billingInfo: '',
    buttonText: 'Quero esse Plano',
    description: 'Freelancer/Autônomo tenha sua própria página e receba avaliações',
    popular: false,
    priceID: 'price_1RVnTDBHToUdUF6a7oZqu1Pp',
    planSelectInfo: 'MKTPRO',
    features: [
      'Você pode escolher tudo, dos outros planos, novas alterações ou apenas o que você precisa',
    ],
    promotionLevel: 2,
  };


  const plans = userType === 'freelancer'
    ? [...basePlans, proPlan]
    : userType === 'empresa'
      ? [...basePlans, corpPlan]
      : [];

  return (
    <div className="bg-gray-50 text-gray-800 p-6 font-sans min-h-screen">
      <header className="flex justify-center mb-8">
        <img
          src="https://www.Salexpress.com/assets/images/logopadrao.png"
          alt="Global TTY Logo"
          className="h-16"
        />
      </header>

      {!userType ? (
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Como você deseja se registrar?</h1>
          <p className="mb-6 text-gray-600">Escolha uma das opções para exibir os planos mais adequados.</p>
          <div className="flex justify-center gap-6">
            <button
              onClick={() => setUserType('freelancer')}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-lg shadow"
            >
              Freelancer / Autônomo
            </button>
            <button
              onClick={() => setUserType('empresa')}
              className="bg-gray-700 hover:bg-gray-800 text-white font-semibold px-6 py-3 rounded-lg shadow" style={{ color: 'white' }}
            >
              Empresa
            </button>
          </div>
        </div>
      ) : (
        <>
          <h1 className="text-4xl font-bold text-center mb-2 text-gray-900">Escolha o Plano Ideal</h1>
          <p className="text-center text-gray-600 mb-10 max-w-2xl mx-auto">
            {userType === 'freelancer'
              ? 'Para freelancers/autônomos que querem se destacar e conseguir mais serviços.'
              : 'Para empresas que querem mais visibilidade e gestão avançada.'}
          </p>

          {/* Renderizar planos */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12 max-w-6xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border ${plan.popular ? 'border-2 border-red-600 transform hover:scale-105' : 'border-gray-100'} relative flex flex-col h-full`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
                    MAIS POPULAR
                  </div>
                )}

                <div className="flex-grow">
                  <h2 className="text-2xl font-bold mb-2 text-gray-800">{plan.name}</h2>
                  <div className="mb-4">
                    <p className="text-3xl font-bold text-gray-900">
                      {plan.price === 0 ? 'Grátis' : `R$ ${plan.price.toFixed(2).replace('.', ',')}`}
                    </p>
                    <p className="text-gray-600 text-sm">{plan.priceText}</p>
                    {plan.billingInfo && (
                      <p className="text-gray-500 text-xs mt-1">{plan.billingInfo}</p>
                    )}
                  </div>
                  <p className="text-gray-700 mb-6 italic">{plan.description}</p>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <ChevronRight className="h-4 w-4 mr-2 mt-1 text-red-600 flex-shrink-0" />
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <button
                  onClick={() => generateLinkPlan(plan.priceID, plan.planSelectInfo)}
                  className={`w-full px-6 py-3 rounded-lg font-medium transition-colors duration-300 mt-auto ${plan.popular
                    ? 'bg-red-600 text-white shadow-md hover:bg-red-700 hover:shadow-lg'
                    : plan.price === 0
                      ? 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      : 'bg-red-600 text-white hover:bg-red-700'
                    }`}
                >
                  {plan.buttonText}
                </button>
              </div>
            ))}

            <div
              className={`bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100 relative flex flex-col h-full`}
            >


              <div className="flex-grow">
                <h2 className="text-2xl font-bold mb-2 text-gray-800">Sob demanda</h2>
                <div className="mb-4">
                  <p className="text-3xl font-bold text-gray-900">
                    Personalize
                  </p>
                  <p className="text-gray-600 text-sm">Personalize de acordo com suas necessidades</p>
                </div>
                <p className="text-gray-700 mb-6 italic">Obtenha oportunidades exclusivas para seu negócio</p>
                <ul className="space-y-3 mb-8">
                  {personalized.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <ChevronRight className="h-4 w-4 mr-2 mt-1 text-red-600 flex-shrink-0" />
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <a
                href="https://wa.me/5511975624713?text=Olá,%20vim%20pelo%20site%20e%20gostaria%20de%20um%20plano%20personalizado%20para%20mim."
                target="_blank"
                rel="noopener noreferrer"
              >
                <button
                  className={`w-full px-6 py-3 rounded-lg font-medium transition-colors duration-300 mt-auto bg-red-600 text-white shadow-md hover:bg-red-700 hover:shadow-lg`}
                >
                  Fale conosco
                </button>
              </a>

            </div>
          </div>
          {/* Tabela Comparativa Completa */}
          <div className="max-w-6xl mx-auto mb-16">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-900">
              Comparação detalhada dos planos
            </h2>

            <div className="overflow-x-auto bg-white rounded-xl shadow-md">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-100 text-left">
                    <th className="py-4 px-6 font-semibold text-gray-700">Benefícios</th>
                    {plans.map((plan) => (
                      <th key={plan.id} className="py-4 px-6 text-center font-semibold text-gray-700">
                        {plan.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {allFeatures.map((feature, index) => (
                    <tr key={index}>
                      <td className="py-3 px-6 font-medium text-sm">{feature}</td>
                      {plans.map((plan) => {
                        // Lógica para determinar se o recurso está incluído no plano
                        let included = false;
                        let specialValue = '';

                        if (feature.includes('Nível de divulgação')) {
                          specialValue = `Nível ${plan.promotionLevel}`;
                        } else if (
                          (feature === 'Cadastro de usuário' && plan.id >= 1) ||
                          (feature === 'Informações básicas de contato' && plan.id >= 1) ||
                          (feature === 'Link do site/LinkedIn' && plan.id >= 1) ||
                          (feature === 'Descrição ilimitada' && plan.id >= 1) ||
                          (feature === 'Inclusão da Logomarca' && plan.id >= 2) ||
                          (feature === 'Licenças e Certificados' && plan.id >= 2) ||
                          (feature === 'Painel gerencial de acessos' && plan.id >= 2) ||
                          (feature === 'Palavras-chaves mais buscadas' && plan.id >= 2) ||
                          (feature === 'Página exclusiva' && plan.id >= 3) ||
                          (feature === 'Link WhatsApp' && plan.id >= 3) ||
                          (feature === 'Avaliações do Perfil' && plan.id >= 3) ||
                          (feature === 'Banco de Negócios' && plan.id >= 3)
                        ) {
                          included = true;
                        }

                        return (
                          <td key={plan.id} className="text-center py-3 px-6">
                            {specialValue ? (
                              <span className="text-red-600 font-medium">{specialValue}</span>
                            ) : included ? (
                              <Check className="h-5 w-5 mx-auto text-green-500" />
                            ) : (
                              <X className="h-5 w-5 mx-auto text-red-400" />
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>

      )}


    </div>
  );
};

export default Plans;