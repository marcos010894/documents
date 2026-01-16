const keywordsData = [
    {
        topico: "Regulação Sanitária",
        palavrasChave: [
            "ANVISA", "VISA", "armazenagem", "transporte", "distribuição",
            "importação", "drogarias", "clínicas médicas", "recinto alfandegado", "PAF"
        ]
    },
    {
        topico: "Regulação Ambiental",
        palavrasChave: ["IBAMA", "Cadastro Técnico Federal", "CTF", "Certificação Ambiental"]
    },
    {
        topico: "Consultoria Farmacêutica",
        palavrasChave: [
            "Camila Farmas", "Consultora BPF", "Consultora SGQ", "Assuntos Regulatórios",
            "Consultora RDC 430", "Consultora Boas Práticas", "Consultora Logística"
        ]
    },
    {
        topico: "Treinamentos",
        palavrasChave: [
            "Boas Práticas de Fabricação", "Boas Práticas de Transporte", "RDC 430",
            "Mapeamento de Rota", "Qualificação Térmica"
        ]
    },
    {
        topico: "Validações e Qualificações",
        palavrasChave: [
            "Validação de Sistemas", "Qualificação de Equipamentos", "Mapeamento Térmico",
            "Validação de Transporte", "Qualificação de Veículos", "Auditorias", "ISO"
        ]
    },
    {
        topico: "Marketing e Desenvolvimento",
        palavrasChave: ["Marketing B2B", "Social Media", "Desenvolvimento de Software", "Web", "Apps"]
    },
    {
        topico: "Auditorias e Compliance",
        palavrasChave: [
            "Auditoria ANVISA", "FDA", "EMA UK", "RDC 658", "RDC 653/22",
            "Compliance Regulatória", "Risk Assessments"
        ]
    },
    {
        topico: "Marketplace e Fornecedores",
        palavrasChave: [
            "Marketplace em saúde", "Busca de freelancer", "Qualificação de fornecedor",
            "Auditoria em fornecedor", "Licença Sanitária", "Gestão de fornecedor"
        ]
    }
];

const KeyWords = () => {
    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="mb-8 text-center">
                <h1 className="text-2xl font-bold text-center mt-4">Palavras-chave por Área de Atuação</h1>
                <p className="text-gray-600 text-center mt-2">Explore os principais termos relacionados a cada tópico de especialização</p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {keywordsData.map((item, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
                        <div className="bg-red-500 px-4 py-3">
                            <h2 className="text-xl font-semibold text-white" style={{color: 'white'}}>{item.topico}</h2>
                        </div>
                        <div className="p-4">
                            <ul className="space-y-2">
                                {item.palavrasChave.map((palavra, i) => (
                                    <li key={i} className="flex items-start">
                                        <span className="inline-block bg-red-100 text-black-800 rounded-full px-3 py-1 text-sm font-medium mr-2">
                                            {palavra}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="mt-8 text-center text-sm text-gray-500">
                <p>Para mais informações sobre qualquer um destes tópicos, entre em contato conosco.</p>
            </div>
        </div>
    );
};

export default KeyWords;