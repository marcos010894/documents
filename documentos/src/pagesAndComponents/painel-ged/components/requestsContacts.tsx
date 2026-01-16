import { useEffect, useState } from "react";
import { api as useApi } from "../../../services/api";

const RequetsContacts = () => {

    const [skip, setSkip] = useState<number>(0);
    const [limit, setLimit] = useState<number>(5); // fixo
    const [page, setPage] = useState<number>(1)
    const [totalpage, settotalPage] = useState<number>(1)
    const [data, setData] = useState<any[]>([])

    const nextPage = async () => {
        if (page == totalpage) return
        await setPage(page + 1)
        await setSkip((prev) => prev + limit);
    };
    const { api } = useApi();

    const backPage = () => {
        if (skip == 0) return
        setPage(page - 1)
        setSkip((prev) => Math.max(prev - limit, 0)); // impede skip negativo
    };



    const fecthRequets = async () => {
        const response = await api.get(`v1/contactsSolicitations/?skip=${skip}&limit=${limit}`)
        setData(response.data.data)
        settotalPage(response.data.totalPages)
        return response
    }


    const handleChange = (event: any) => {
        setLimit(event.target.value);
    };

    useEffect(() => {
        fecthRequets()
    }, [skip, limit])


    return (
        <div className="p-4">
            <div className="flex items-center gap-2 mb-4">
                <label htmlFor="registros" className="text-sm">Mostrar</label>
                <select
                    id="registros"
                    className="border rounded px-2 py-1 text-sm"
                    onChange={handleChange}
                >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                </select>
                <span className="text-sm">Registros por página</span>
            </div>

            <div className="overflow-auto border border-dashed border-blue-300">
                <table className="min-w-full border-collapse text-sm">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="border px-2 py-2">ID</th>
                            <th className="border px-2 py-2">Nome do solicitante</th>
                            <th className="border px-2 py-2">E-mail</th>
                            <th className="border px-2 py-2">Telefone</th>
                            <th className="border px-2 py-2">Tipo da empresa</th>
                            <th className="border px-2 py-2">id da empresa</th>
                            <th className="border px-2 py-2">Status</th>
                            <th className="border px-2 py-2">Data Solicitação</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* Linhas em branco, como no seu print */}
                        {data.map((value, i) => (
                            <tr key={i}>
                                <td className="border px-2 py-1">{value.id}</td>
                                <td className="border px-2 py-1">{value.nome}</td>
                                <td className="border px-2 py-1">{value.email}</td>
                                <td className="border px-2 py-1">{value.telefone}</td>
                                <td className="border px-2 py-1">{value.type_user}</td>
                                <td className="border px-2 py-1">{value.id_busness}</td>
                                <td className="border px-2 py-1">
                                    <span
                                    style={{color: 'white'}}
                                        className={`
        inline-block px-2 py-0.5 rounded text-white text-xs font-semibold
        ${value.status === "Pendente"
                                                ? "bg-red-500"
                                                : value.status === "Aguardando avaliação"
                                                    ? "bg-blue-500"
                                                    : value.status === "Avaliado"
                                                        ? "bg-green-500"
                                                        : value.status === "Solicitação não feita"
                                                            ? "bg-red-500"
                                                            : "bg-gray-400"
                                            }
      `}
                                    >
                                        {value.status}
                                    </span>
                                </td>
                                <td className="border px-2 py-1">{value.created_at}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
                <span>Mostrando {page} de {totalpage} Registro</span>
                <div className="flex gap-2">
                    <button className="bg-gray-200 text-black font-semibold py-2 px-6 rounded-md " onClick={() => backPage()}>Anterior</button>
                    <button className="bg-red-600 text-white-light font-semibold py-2 px-6 rounded-md" onClick={() => nextPage()}>Próximo</button>
                </div>
            </div>
            <div className="p-4 bg-white rounded-xl shadow-md space-y-3">
                <h2 className="text-sm font-semibold text-gray-800">📌 Observações sobre o status</h2>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                    <li className="text-sm">
                        <strong className="text-sm text-gray-900">Importante:</strong> cada status depende do contato com o cliente.
                    </li>
                    <li className="text-sm">
                        <span className="text-sm text-red-600">Pendente:</span> aguardando a resposta do cliente.
                    </li>
                    <li className="text-sm">
                        <span className="text-sm text-blue-600">Aguardando avaliação:</span> o contato com o cliente foi realizado.
                    </li>
                    <li className="text-sm">
                        <span className="text-sm text-green-600">Avaliado:</span> o cliente avaliou o serviço.
                    </li>
                    <li className="text-sm">
                        <span className="text-sm text-red-600">Solicitação não feita:</span> o cliente não solicitou o serviço.
                    </li>
                </ul>
            </div>
        </div>

    )
}

export default RequetsContacts;