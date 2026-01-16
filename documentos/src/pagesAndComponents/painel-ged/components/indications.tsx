import { useEffect, useState } from "react";
import { AiOutlineFundView, AiFillCheckCircle } from "react-icons/ai";
import { api as useApi } from "../../../services/api";

const Indications = () => {

    const [data, setData] = useState<any[]>([])
    const { api } = useApi();
    const fetchFreelas = async () => {
        const response = await api.get(`v1/indicacao/indications?skip=${0}&limit=${0}`)
        setData(response.data)
        return response
    }
    useEffect(() => {
        fetchFreelas()
    }, [])

    const alterStateIndication = async (id: number, status: string) => {
        let response = await api.put(`v1/indicacao/update/${id}?status=${status}`)
        if (response.status == 200) {
            fetchFreelas()
        }
    }
    return (
        <div className="p-4">
            {/* <div className="flex items-center gap-2 mb-4">
                <label htmlFor="registros" className="text-sm">Mostrar</label>
                <select
                    id="registros"
                    className="border rounded px-2 py-1 text-sm"
                >
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                </select>
                <span className="text-sm">Registros por página</span>
            </div> */}

            <div className="overflow-auto border border-dashed border-blue-300">
                <table className="min-w-full border-collapse text-sm">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="border px-2 py-2">Indicador</th>
                            <th className="border px-2 py-2">E-mail do indicado </th>
                            <th className="border px-2 py-2">Telefone do indicado </th>
                            <th className="border px-2 py-2">Nome do indicado</th>
                            <th className="border px-2 py-2">status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* Linhas em branco, como no seu print */}
                        {data.map((value, i) => (
                            <tr key={i}>
                                <td className="border px-2 py-1">{value.nome_indicador}</td>
                                <td className="border px-2 py-1">{value.email_indicado}</td>
                                <td className="border px-2 py-1">{value.telefone_indicado}</td>
                                <td className="border px-2 py-1">{value.empresa_freelancer_indicada}</td>
                                <td className="border px-2 py-1">
                                    {
                                        value.status == 'aguardando' ?
                                            (<button className="bg-red-600 text-white-light font-semibold py-2 px-6 rounded-md" onClick={() => alterStateIndication(value.id, 'contactado')}>
                                                <AiOutlineFundView />
                                            </button>) :
                                            <button className="bg-green-normal text-white-light font-semibold py-2 px-6 rounded-md" onClick={() => alterStateIndication(value.id, 'aguardando')}>
                                                <AiFillCheckCircle />
                                            </button>
                                    }


                                </td>

                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
                <span>Mostrando {page} de {totalpage} Registro</span>
                <div className="flex gap-2">
                    <button className="bg-gray-200 text-black font-semibold py-2 px-6 rounded-md " onClick={() => backPage()}>Anterior</button>
                    <button className="bg-red-600 text-white-light font-semibold py-2 px-6 rounded-md" onClick={() => nextPage()}>Próximo</button>
                </div>
            </div> */}
        </div>

    )
}

export default Indications;