import React, { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { api as useApi } from "../../../services/api";

const EditUserBasic = () => {
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
          tipo_conta: info.user?.tipo_conta || '',
          status: true,
          nome: info.user?.nome || '',
          email: info.user?.email || '',
          telefone: info.user?.telefone || '',
          nascimento: info.user?.nascimento || '',
          cep: info.user?.cep || '',
          cidade: info.user?.cidade || '',
          estado: info.user?.estado || '',
          cpf: info.user?.cpf || '',
          com_oque_trabalha: info.user?.com_oque_trabalha || '',
          empresa_trabalha: info.user?.empresa_trabalha || '',
          linkedin: info.user?.linkedin || '',
          bairro: info.user?.bairro || '',
          logradouro: info.user?.logradouro || '',
          descricaoServico: info.user?.descricaoServico || '',
          numero: info.user?.numero || '',
          complemento: info.user?.complemento || '',
          certificados: info.user?.certificados || '',
          marketplace: true,
          termos_aceitos: true,
          politicas_aceitas: true,
          site_portifolio: info.user?.site_portifolio || '',
          password_user: info.user?.password_user || '',

        });
      } catch (error) {
        console.error('Erro ao fazer parse do usuário:', error);
      }
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value} = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]:  value,
    }));
  };

  const handleSave = async () => {
    if (!userData?.user?.id) {
      console.error('ID do usuário não encontrado.');
      return;
    }

    try {
      const response = await api.put(
        `v1/users/edit-user-freelancer/${userData.user.id}`,
        formData
      );
      if (response.status === 200) {
        alert('Dados atualizados com sucesso!');

        const updatedUser = { ...userData, user: { ...userData.user, ...formData } };
        localStorage.setItem('infosUserLogin', JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error('Erro ao salvar os dados:', error);
      alert('Ocorreu um erro ao salvar os dados.');
    }
  };



  if (!formData) {
    return <h1 className="text-center mt-20 text-lg font-semibold">Carregando informações do usuário...</h1>;
  }

  return (
  <div className="max-w-5xl mx-auto p-8 bg-gray-50 rounded-3xl shadow-md mt-10">
    <p className="text-gray-500 mb-8">Revise e edite suas informações pessoais abaixo.</p>

    {/* Dados Pessoais */}
    <section className="mb-10">
      <h2 className="text-2xl font-semibold text-black-normal mb-6">🧍‍♂️ Dados Pessoais</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { label: 'Nome', name: 'nome', type: 'text', placeholder: 'Digite seu nome completo' },
          { label: 'Email', name: 'email', type: 'email', placeholder: 'Digite seu email' },
          { label: 'Telefone', name: 'telefone', type: 'tel', placeholder: 'Ex: (27) 99999-9999' },
          { label: 'CPF', name: 'cpf', type: 'text', placeholder: 'XXX.XXX.XXX-XX' },
          { label: 'Nascimento', name: 'nascimento', type: 'text', placeholder: 'dd/mm/aaaa' },
          { label: 'Cidade', name: 'cidade', type: 'text', placeholder: 'Digite sua cidade' },
          { label: 'CEP', name: 'cep', type: 'text', placeholder: 'CEP' },
          { label: 'Bairro', name: 'bairro', type: 'text', placeholder: 'Bairro' },
          { label: 'Estado', name: 'estado', type: 'text', placeholder: 'UF' },
          { label: 'Número', name: 'numero', type: 'text', placeholder: 'Número' },
          { label: 'Logradouro', name: 'logradouro', type: 'text', placeholder: 'Logradouro' },
          { label: 'Empresa que trabalha', name: 'empresa_trabalha', type: 'text', placeholder: 'Nome da empresa' },
          { label: 'LinkedIn', name: 'linkedin', type: 'text', placeholder: 'LinkedIn' },
          { label: 'Com o que trabalha', name: 'com_oque_trabalha', type: 'text', placeholder: 'Com o que trabalha' },
          { label: 'Complemento', name: 'complemento', type: 'text', placeholder: 'Complemento' },
          { label: 'Certificados', name: 'certificados', type: 'text', placeholder: 'Certificados' },
         ].map((field) => {
          const isReadOnly = ['cnpj', 'cep','cpf','bairro','estado', 'numero','logradouro','complemento','cidade'].includes(field.name);
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
      {/* Campo textarea */}
      <div className="md:col-span-2">
        <label className="block text-sm  font-medium text-gray-700 mb-1">Descrição do Serviço</label>
        <textarea
          name="descricaoServico"
          placeholder="Descrição detalhada do serviço"
          value={formData.descricaoServico || ''}
          onChange={handleChange}
          className="w-full h-48 px-3 py-2 border rounded-xl shadow-sm focus:ring-2 focus:ring-red-600 outline-none text-sm resize-none"
        />
      </div>
    </section>
    {/* Botão de Salvar */}
    <div className="flex justify-end mt-4">
      <button
        className="bg-red-600 text-white-light text-base rounded-lg p-[0.625rem] flex items-center gap-2 shadow-lg hover:brightness-110 transition"
        onClick={handleSave}
      >
        <Save className="w-5 h-5" /> Salvar
      </button>
    </div>
  </div>);

};

export default EditUserBasic;
