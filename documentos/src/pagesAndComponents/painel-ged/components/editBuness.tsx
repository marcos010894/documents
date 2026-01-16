        import React, { useEffect, useState } from 'react';
        import { Save } from 'lucide-react'; // Você pode usar qualquer ícone de sua escolha
        import { api as useApi } from "../../../services/api";

        const EditBusness = () => {
            const { api } = useApi();
            const [userData, setUserData] = useState<any>(null);
            const [formData, setFormData] = useState<any>(null);

            useEffect(() => {
                const user = localStorage.getItem('infosUserLogin');
                if (user) {
                    try {
                        const info = JSON.parse(user);
                        setUserData(info);
                        setFormData({
                        nome: info.user?.nome || '',
                        email: info.user?.email || '',
                        telefone: info.user?.telefone || '',
                        nascimento: info.user?.nascimento || '',
                        cidade: info.user?.cidade || '',
                        estado: info.user?.estado || '',
                        cpf: info.user?.cpf || '',
                        empresa_trabalha: info.user?.empresa_trabalha || '',
                        outras_infos: info.empresa?.outras_infos || '',
                        cep: info.empresa?.cep || '',
                        cnae_secundario: info.empresa?.cnae_secundario || '',
                        cnae_primario: info.empresa?.cnae_primario || '',
                        bairro: info.empresa?.bairro || '',
                        logradouro: info.empresa?.logradouro || '',
                        numero: info.empresa?.numero || '',
                        complemento: info.empresa?.complemento || '',
                        cidade_empresa: info.empresa?.cidade || '',
                        estado_empresa: info.empresa?.estado || '',
                        cnpj: info.empresa?.cnpj || '',
                        nome_fantasia: info.empresa?.nome_fantasia || '',
                        razao_social: info.empresa?.razao_social || '',
                        site: info.empresa?.site || '',
                        descricaoServico: info.empresa?.descricaoServico || '',
                        autorizações: info.empresa?.atorizacoes || '',
                        certificados: info.empresa?.certificados || '',
                        marketplace: info.empresa?.marketplace || false,
                        password_user: info.user?.password_user || '',
                    });

                    } catch (error) {
                        console.error('Erro ao fazer parse do usuário:', error);
                    }
                }
            }, []);

            const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
                const { name, value } = e.target;
                setFormData((prev: any) => ({
                    ...prev,
                    [name]: value,
                }));
            };

           const handleSave = async () => {
            if (!userData?.user?.id) {
                alert("Usuário não encontrado.");
                return;
            }

            const personPFDate = {
                nome: formData.nome,
                email: formData.email,
                telefone: formData.telefone,
                nascimento: formData.nascimento,
                cidade: formData.cidade,
                estado: formData.estado,
                cpf: formData.cpf,
                empresa_trabalha: formData.empresa_trabalha,
                status: true,
                password_user: formData.password_user
                
            };

            const personPJDate = {
                cnpj: formData.cnpj,
                razao_social: formData.razao_social,
                nome_fantasia: formData.nome_fantasia,
                site: formData.site,
                outras_infos: formData.outras_infos,
                cep: formData.cep,
                cnae_secundario: formData.cnae_secundario,
                cnae_primario: formData.cnae_primario,
                cidade: formData.cidade,
                bairro: formData.bairro,
                estado:formData.estado,
                marketplace: true,
                logradouro: formData.logradouro,
                numero: formData.numero,
                complemento: formData.complemento,
                cidade_empresa: formData.cidade_empresa,
                estado_empresa: formData.estado_empresa,
                descricaoServico: formData.descricaoServico,
                autorizações: formData.autorizações,
                certificados: formData.certificados,
                termos_aceitos: true,
                politicas_aceitas: true,
                status: true
            }

            try {
                const [resPF, resPJ] = await Promise.all([
                    api.put( `v1/users/edit-user-pf/${userData.user.id}`,personPFDate),
                    api.put(`v1/users/edit-user-pj/${userData.empresa.id}`, personPJDate),
                ]);
                
    

                if (resPF.status == 200, resPJ.status == 200) {
                    alert('Dados atualizados com sucesso!');


                    const updateUser = { 
                        ...userData,
                        user:{ ...userData.user, ...personPFDate},
                        empresa: { ...userData.empresa, ...personPJDate}
                    };

                    localStorage.setItem('infosUserLogin', JSON.stringify(updateUser))
                }
            } catch (error) {

                console.error("Erro ao salvar dados:", error);
                alert("Erro ao salvar dados. Tente novamente.");
            }
        };
            if (!formData) {
                return <h1 className="text-center mt-20 text-lg font-semibold">Carregando informações do usuário...</h1>;
            }

            return (
                <div className="max-w-5xl mx-auto p-8 bg-gray-50 rounded-3xl shadow-md mt-10">
                    <p className="text-gray-500 mb-8">Revise e edite suas informações pessoais e da empresa abaixo.</p>

                    <section className="mb-10">
                        <h2 className="text-2xl font-semibold text-black-normal mb-6">🧍‍♂️ Dados Pessoais</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[
                                { label: 'Nome', name: 'nome', type: 'text', placeholder: 'Digite seu nome completo' },
                                { label: 'Email', name: 'email', type: 'email', placeholder: 'Digite seu email' },
                                { label: 'Telefone', name: 'telefone', type: 'text', placeholder: 'Ex: (27) 99999-9999' },
                                { label: 'CPF', name: 'cpf', type: 'text', placeholder: 'XXX.XXX.XXX-XX' },
                                { label: 'Nascimento', name: 'nascimento', type: 'text', placeholder: 'dd/mm/aaaa' },
                                { label: 'Cidade', name: 'cidade', type: 'text', placeholder: 'Digite sua cidade' },
                                { label: 'Estado', name: 'estado', type: 'text', placeholder: 'UF' },
                                { label: 'Empresa que trabalha', name: 'empresa_trabalha', type: 'text', placeholder: 'Nome da empresa' },
                             ].map((field) => {
                                const isReadOnly = ['cpf', 'nome','email','cidade','estado'].includes(field.name);
                                return (
                                    <div key={field.name}>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                                    <input
                                        className={`w-full px-4 py-2 border rounded-xl shadow-sm text-base text-left outline-none ${
                                        isReadOnly
                                            ? 'bg-gray-100 text-gray-500 cursor-not-allowed focus:ring-0'
                                            : 'focus:ring-2 focus:ring-red-600'
                                        }`}
                                        type={field.type}
                                        name={field.name}
                                        placeholder={field.placeholder}
                                        value={formData[field.name]}
                                        onChange={handleChange}
                                        readOnly={isReadOnly}
                                    />
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    <section className="mb-10">
                    <h2 className="text-2xl font-semibold    text-black-normal mb-6">🏢 Dados da Empresa</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                        { label: 'CEP', name: 'cep', type: 'text', placeholder: 'Ex: 29107-032' },
                        { label: 'CNAE Primário', name: 'cnae_primario', type: 'text', placeholder: 'Ex: 62.01-5/00' },
                        { label: 'CNAE Secundário', name: 'cnae_secundario', type: 'text', placeholder: 'Ex: 62.09-1/00' },
                        { label: 'Bairro', name: 'bairro', type: 'text', placeholder: 'Digite o bairro' },
                        { label: 'Logradouro', name: 'logradouro', type: 'text', placeholder: 'Digite o logradouro' },
                        { label: 'Número', name: 'numero', type: 'text', placeholder: 'Número' },
                        { label: 'Complemento', name: 'complemento', type: 'text', placeholder: 'Complemento' },
                        { label: 'Cidade Empresa', name: 'cidade_empresa', type: 'text', placeholder: 'Cidade da empresa' },
                        { label: 'Estado Empresa', name: 'estado_empresa', type: 'text', placeholder: 'Estado da empresa' },
                        { label: 'CNPJ', name: 'cnpj', type: 'text', placeholder: 'CNPJ' },
                        { label: 'Nome Fantasia', name: 'nome_fantasia', type: 'text', placeholder: 'Nome fantasia' },
                        { label: 'Razão Social', name: 'razao_social', type: 'text', placeholder: 'Razão social' },
                        { label: 'Site', name: 'site', type: 'text', placeholder: 'Site' },
                         ].map((field) => {
                            const isReadOnly = ['cnpj', 'cep', 'bairro','numero','logradouro','complemento'].includes(field.name);
                            return (
                                <div key={field.name}>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                                <input
                                    className={`w-full px-4 py-2 border rounded-xl shadow-sm text-base text-left outline-none ${
                                    isReadOnly
                                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed focus:ring-0'
                                        : 'focus:ring-2 focus:ring-red-600'
                                    }`}
                                    type={field.type}
                                    name={field.name}
                                    placeholder={field.placeholder}
                                    value={formData[field.name]}
                                    onChange={handleChange}
                                    readOnly={isReadOnly}
                                />
                                </div>
                            );
                        })}

                        <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Descrição do Serviço</label>
                        <textarea
                            name="descricaoServico"
                            placeholder="Descrição detalhada do serviço"
                            value={formData.descricaoServico || ''}
                            onChange={handleChange}
                            className="w-full h-48 px-3 py-2 border rounded-xl shadow-sm focus:ring-2 focus:ring-red-600 outline-none text-sm resize-none"
                        />
                        </div>
                        
                        <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Outras Informações</label>
                        <textarea
                            name="outras_infos"
                            placeholder="Outras Informações"
                            value={formData.outras_infos || ''}
                            onChange={handleChange}
                            className="w-full h-48 px-3 py-2 border rounded-xl shadow-sm focus:ring-2 focus:ring-red-600 outline-none text-sm resize-none"
                        />
                        </div>

                        <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Certificados</label>
                        <textarea
                            name="certificados"
                            placeholder="Certificados"
                            value={formData.certificados || ''}
                            onChange={handleChange}
                            className="w-full h-48 px-3 py-2 border rounded-xl shadow-sm focus:ring-2 focus:ring-red-600 outline-none text-sm resize-none"
                        />
                        </div>
                    </div>
                    </section>

                    <div className="flex justify-end mt-4">
                    <button
                        className="bg-red-600 text-white-light text-base rounded-lg p-[0.625rem] flex items-center gap-2 shadow-lg hover:brightness-110 transition"
                        onClick={handleSave}
                    >
                        <Save className="w-5 h-5" /> Salvar
                    </button>
                    </div>
                </div>
            );
        };
        export default EditBusness;
