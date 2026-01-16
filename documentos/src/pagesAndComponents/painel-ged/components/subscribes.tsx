import { useEffect, useState } from "react";
import { api as useApi } from "../../../services/api";

const Subscribes = () => {
    const [data, setData] = useState<any[]>([]);
    const { api } = useApi();



    const fetchSubscriptions = async () => {
        try {
            const response = await api.get(`v1/subscription/subscriptions/details`);
            setData(response.data);
        } catch (err) {
            console.error("Erro ao buscar assinaturas:", err);
        }
    };

    useEffect(() => {
        fetchSubscriptions();
    }, []);

    return (
        <div className="p-4">

            <div className="overflow-auto border border-dashed border-blue-300">
                <table className="min-w-full border-collapse text-sm">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="border px-2 py-2">ID</th>
                            <th className="border px-2 py-2">Nome</th>
                            <th className="border px-2 py-2">Tipo Usuário</th>
                            <th className="border px-2 py-2">Plano</th>
                            <th className="border px-2 py-2">Preço</th>
                            <th className="border px-2 py-2">Pagamento</th>
                            <th className="border px-2 py-2">Ativo</th>
                            <th className="border px-2 py-2">Assinatura</th>
                            {/* <th className="border px-2 py-2">Ações</th> */}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item, index) => (
                            <tr key={index}>
                                <td className="border px-2 py-1">{item.id}</td>
                                <td className="border px-2 py-1">{item.nome || "—"}</td>
                                <td className="border px-2 py-1">{item.type_user}</td>
                                <td className="border px-2 py-1">{item.plan}</td>
                                <td className="border px-2 py-1">R$ {item.price.toFixed(2)}</td>
                                <td className="border px-2 py-1">{item.tipo_pagamento}</td>
                                <td className="border px-2 py-1">{item.ativo ? "Sim" : "Não"}</td>
                                <td className="border px-2 py-1">{new Date(item.data_assinatura).toLocaleDateString()}</td>
                                {/* <td className="border px-2 py-1">
                                    <button
                                        className="bg-red-600 text-white-light font-semibold py-2 px-6 rounded-md"
                                        onClick={() => openInfos(item.id_user)}
                                    >
                                        <AiOutlineFundView />
                                    </button>
                                </td> */}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Subscribes;
