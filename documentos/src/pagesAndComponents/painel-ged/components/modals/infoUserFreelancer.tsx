import { useEffect, useState } from "react";
import { api as useApi } from "../../../../services/api";
import * as alertify from "alertifyjs";
import 'alertifyjs/build/css/alertify.min.css';
import { FaTrash } from "react-icons/fa";

interface data {
    isOpen: Boolean,
    closeModal: () => void,
    id: number
}

const ModalInfoFreelancer = ({ isOpen, closeModal, id }: data) => {
    const [freelancer, setFreelancer] = useState({
        empresa_trabalha: "",
        complemento: "",
        site_portifolio: "",
        email: "",
        atorizacoes: "",
        linkedin: "",
        nascimento: "",
        certificados: "",
        marketplace: false,
        logradouro: "",
        tipo_conta: "",
        status: false,
        id: "",
        numero: "",
        com_oque_trabalha: "",
        password_user: "",
        nome: "",
        bairro: "",
        descricaoServico: "",
        cpf: "",
        cidade: "",
        termos_aceitos: false,
        telefone: "",
        estado: "",
        politicas_aceitas: false
    });

    const { api } = useApi();

    const fetchFreelancer = async (id: number) => {
        try {
            const response = await api.get(`/v1/users/freelancers/${id}`);
            if (response.status === 200) {
                setFreelancer(response.data);
            }
        } catch (error) {
            console.error("Erro ao buscar freelancer:", error);
        }
    };

    useEffect(() => {
        if (isOpen && id) {
            fetchFreelancer(id);
        }
    }, [isOpen, id]);

    const handleDelete = () => {
        alertify.confirm(
            "Remover Usuário",
            "Tem certeza que deseja remover este usuário do sistema?",
            async function () {
                try {
                    const response = await api.delete(`/v1/users/delete-user-freelancer/${id}`);
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

    return (
        <div>
            {isOpen && (
                <div
                    className="fixed inset-0 bg-[rgba(0,0,0,0.6)] flex justify-center items-center z-50"
                    onClick={closeModal}
                >
                    <div
                        className="bgwhite p-8 rounded-lg max-h-[90vh] w-[90vw] sm:w-[70vw] shadow-xl flex flex-col overflow-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h1 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-4">
                            👤 Perfil Completo do Usuário
                        </h1>

                        <div className="mb-6">
                            <h2 className="text-xl font-semibold text-gray-700 mb-4">📌 Dados Pessoais</h2>
                            <div className="grid md:grid-cols-2 gap-4 text-gray-700 text-sm">
                                <p><strong>Nome:</strong> {freelancer.nome || "—"}</p>
                                <p><strong>Data de Nascimento:</strong> {freelancer.nascimento || "—"}</p>
                                <p><strong>CPF:</strong> {freelancer.cpf || "—"}</p>
                                <p><strong>Email:</strong> {freelancer.email || "—"}</p>
                                <p><strong>Telefone:</strong> {freelancer.telefone || "—"}</p>
                                <p><strong>Cidade:</strong> {freelancer.cidade || "—"}</p>
                                <p><strong>Estado:</strong> {freelancer.estado || "—"}</p>
                                <p><strong>Status:</strong>
                                    <span className={`ml-1 font-semibold ${freelancer.status ? "text-green-600" : "text-red-500"}`}>
                                        {freelancer.status ? "Ativo" : "Inativo"}
                                    </span>
                                </p>
                            </div>
                        </div>

                        <hr className="my-6 border-t-2 border-dashed" />

                        <div>
                            <h2 className="text-xl font-semibold text-gray-700 mb-4">🏢 Dados da Empresa</h2>
                            <div className="grid md:grid-cols-2 gap-4 text-gray-700 text-sm">
                                <p><strong>Empresa:</strong> {freelancer.empresa_trabalha || "—"}</p>
                                <p><strong>Descrição:</strong> {freelancer.descricaoServico || "—"}</p>
                                <p><strong>Certificados:</strong> {freelancer.certificados || "—"}</p>
                                <p><strong>Autorizações:</strong> {freelancer.atorizacoes || "—"}</p>
                                <p><strong>Site/Portfólio:</strong> {freelancer.site_portifolio || "—"}</p>
                                <p><strong>LinkedIn:</strong> {freelancer.linkedin || "—"}</p>
                                <p><strong>Logradouro:</strong> {freelancer.logradouro || "—"}</p>
                                <p><strong>Número:</strong> {freelancer.numero || "—"}</p>
                                <p><strong>Complemento:</strong> {freelancer.complemento || "—"}</p>
                                <p><strong>Bairro:</strong> {freelancer.bairro || "—"}</p>
                                <p><strong>Marketplace:</strong>
                                    <span className={`ml-1 font-semibold ${freelancer.marketplace ? "text-green-600" : "text-red-500"}`}>
                                        {freelancer.marketplace ? "Sim" : "Não"}
                                    </span>
                                </p>
                                <p><strong>Termos Aceitos:</strong>
                                    <span className={`ml-1 font-semibold ${freelancer.termos_aceitos ? "text-green-600" : "text-red-500"}`}>
                                        {freelancer.termos_aceitos ? "Sim" : "Não"}
                                    </span>
                                </p>
                                <p><strong>Políticas Aceitas:</strong>
                                    <span className={`ml-1 font-semibold ${freelancer.politicas_aceitas ? "text-green-600" : "text-red-500"}`}>
                                        {freelancer.politicas_aceitas ? "Sim" : "Não"}
                                    </span>
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-end gap-4 mt-10">
                            <button
                                onClick={handleDelete}
                                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 px-4 rounded-md transition-colors duration-200 shadow-md hover:shadow-lg"
                                style={{color: 'white'}}
                            >
                                <FaTrash className="text-xs" />
                                Remover Usuário
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ModalInfoFreelancer;