import { useEffect, useState } from "react";
import { api as useApi } from "../../../../services/api";
import * as alertify from "alertifyjs";
import 'alertifyjs/build/css/alertify.min.css';
import { FaTrash } from "react-icons/fa";

interface ModalProps {
  isOpen: boolean;
  closeModal: () => void;
  id: number;
}

const ModalInfoPj = ({ isOpen, closeModal, id }: ModalProps) => {
  const [data, setData] = useState({
    pf: {
      nome: "",
      cpf: "",
      empresa_trabalha: "",
      nascimento: "",
      estado: "",
      tipo_conta: "",
      telefone: "",
      id: "",
      email: "",
      cidade: "",
      password_user: "",
      status: false,
    },
    pj: {
      nome_fantasia: "",
      cidade: "",
      tipo_empresa: "",
      site: "",
      estado: "",
      segmento_empresa: "",
      cnae_primario: "",
      complemento: "",
      atorizacoes: "",
      id: "",
      cnae_secundario: "",
      marketplace: false,
      certificados: "",
      cep: "",
      termos_aceitos: false,
      outras_infos: "",
      id_user_pf: "",
      logradouro: "",
      politicas_aceitas: false,
      status: false,
      cnpj: "",
      numero: "",
      descricaoServico: "",
      razao_social: "",
      bairro: "",
    },
  });

  const { api } = useApi();

  useEffect(() => {
    if (isOpen && id) {
      api.get(`/v1/users/pj/${id}`)
        .then(res => {
          setData(res.data);
        })
        .catch(err => {
          console.error("Erro ao buscar dados do usuário:", err);
        });
    }
  }, [isOpen, id]);

  const handleDelete = () => {
    alertify.confirm(
      "Remover Usuário",
      "Tem certeza que deseja remover este usuário do sistema?",
      async function () {
        try {
          const response = await api.delete(`/v1/users/delete-user-pf/${id}`);
          if (response.status === 200 || response.status === 204) {
            alertify.success("✅ Usuário removido com sucesso!");
            closeModal();
          } else {
            alertify.error("⚠️ Não foi possível remover o usuário.");
          }
        } catch (error) {
          console.error("Erro ao remover usuário:", error);
          alertify.error("❌ Erro ao remover o usuário.");
        }
      },
      function () {
        alertify.message("Remoção cancelada.");
      }
    );
  };

  const { pf, pj } = data;

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-[rgba(0,0,0,0.6)] flex justify-center items-center z-50"
      onClick={closeModal}
    >
      <div
        className="max-w-4xl mx-auto rounded-3xl shadow-2xl p-8 border border-gray-200 overflow-y-auto max-h-[90vh] w-[90vw] bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        <h1 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-4">
          👤 Perfil Completo do Usuário
        </h1>

        {/* PF */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">📌 Dados Pessoais</h2>
          <div className="grid md:grid-cols-2 gap-4 text-gray-700 text-sm">
            <p><strong>Nome:</strong> {pf.nome || "—"}</p>
            <p><strong>Empresa:</strong> {pf.empresa_trabalha || "—"}</p>
            <p><strong>CPF:</strong> {pf.cpf || "—"}</p>
            <p><strong>Nascimento:</strong> {pf.nascimento || "—"}</p>
            <p><strong>Cidade:</strong> {pf.cidade || "—"}</p>
            <p><strong>Estado:</strong> {pf.estado || "—"}</p>
            <p><strong>Email:</strong> {pf.email || "—"}</p>
            <p><strong>Telefone:</strong> {pf.telefone || "—"}</p>
            <p><strong>Tipo de Conta:</strong> {pf.tipo_conta || "—"}</p>
            <p><strong>Status:</strong> <span className={pf.status ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
              {pf.status ? "Ativo" : "Inativo"}
            </span></p>
          </div>
        </div>

        <hr className="my-6 border-t-2 border-dashed" />

        {/* PJ */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">🏢 Dados da Empresa</h2>
          <div className="grid md:grid-cols-2 gap-4 text-gray-700 text-sm">
            <p><strong>Nome Fantasia:</strong> {pj.nome_fantasia || "—"}</p>
            <p><strong>Razão Social:</strong> {pj.razao_social || "—"}</p>
            <p><strong>CNPJ:</strong> {pj.cnpj || "—"}</p>
            <p><strong>Tipo de Empresa:</strong> {pj.tipo_empresa || "—"}</p>
            <p><strong>Segmento:</strong> {pj.segmento_empresa || "—"}</p>
            <p><strong>CNAE Primário:</strong> {pj.cnae_primario || "—"}</p>
            <p><strong>CNAE Secundário:</strong> {pj.cnae_secundario || "—"}</p>
            <p><strong>Descrição Serviço:</strong> {pj.descricaoServico || "—"}</p>
            <p><strong>Certificados:</strong> {pj.certificados || "—"}</p>
            <p><strong>Autorizações:</strong> {pj.atorizacoes || "—"}</p>
            <p><strong>Outras Informações:</strong> {pj.outras_infos || "—"}</p>
            <p><strong>CEP:</strong> {pj.cep || "—"}</p>
            <p><strong>Logradouro:</strong> {pj.logradouro || "—"}</p>
            <p><strong>Número:</strong> {pj.numero || "—"}</p>
            <p><strong>Complemento:</strong> {pj.complemento || "—"}</p>
            <p><strong>Bairro:</strong> {pj.bairro || "—"}</p>
            <p><strong>Cidade:</strong> {pj.cidade || "—"}</p>
            <p><strong>Estado:</strong> {pj.estado || "—"}</p>
            <p><strong>Marketplace:</strong> <span className={pj.marketplace ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
              {pj.marketplace ? "Sim" : "Não"}
            </span></p>
            <p><strong>Termos Aceitos:</strong> <span className={pj.termos_aceitos ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
              {pj.termos_aceitos ? "Sim" : "Não"}
            </span></p>
            <p><strong>Políticas Aceitas:</strong> <span className={pj.politicas_aceitas ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
              {pj.politicas_aceitas ? "Sim" : "Não"}
            </span></p>
            <p><strong>Status da Empresa:</strong> <span className={pj.status ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
              {pj.status ? "Ativa" : "Inativa"}
            </span></p>
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 px-4 rounded-md transition-colors duration-200 shadow-md hover:shadow-lg"
            style={{color: 'white'}}
          >
            <FaTrash className="text-xs" />
            Remover Empresa
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalInfoPj;