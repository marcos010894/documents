import { useEffect, useState } from "react";
import { AiOutlineFundView } from "react-icons/ai";
import { api as useApi } from "../../../services/api";
import ModalInfoPj from "./modals/infoUserPJ";

const Busness = () => {

    const [skip, setSkip] = useState<number>(0);
    const [limit, setLimit] = useState<number>(5); // fixo
    const [page, setPage] = useState<number>(1)
    const [totalpage, settotalPage] = useState<number>(1)
    const [data, setData] = useState<any[]>([])
    const [idFreela, setIdFreela] = useState<number>(0)
    const [isOpenRedirect, setIsOpenRedirect] = useState(false);
    const openModalRedirect = () => setIsOpenRedirect(true);
    const closeModalRedirect = () => setIsOpenRedirect(false);

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

    const openInfos = (id: number) => {
        setIdFreela(id)
        openModalRedirect()
    }


    const fetchFreelas = async () => {
        const response = await api.get(`v1/users/pj?skip=${skip}&limit=${limit}`)
        setData(response.data.data)
        settotalPage(response.data.totalPage)
        return response
    }


    const handleChange = (event: any) => {
        setLimit(event.target.value);
    };

    useEffect(() => {
        fetchFreelas()
    }, [skip, limit])


    return (
        <div className="p-4">
            <ModalInfoPj closeModal={closeModalRedirect} isOpen={isOpenRedirect} id={idFreela} />
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
                            <th className="border px-2 py-2">empresa</th>
                            <th className="border px-2 py-2">Dono</th>
                            <th className="border px-2 py-2">Telefone</th>
                            <th className="border px-2 py-2">Email</th>
                            <th className="border px-2 py-2">Cidade/Estado</th>
                            <th className="border px-2 py-2">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* Linhas em branco, como no seu print */}
                        {data.map((value, i) => (
                            <tr key={i}>
                                <td className="border px-2 py-1">{value.pj.id}</td>
                                <td className="border px-2 py-1">{value.pj.nome_fantasia}</td>
                                <td className="border px-2 py-1">{value.pf.nome}</td>
                                <td className="border px-2 py-1">{value.pf.telefone}</td>
                                <td className="border px-2 py-1">{value.pf.email}</td>
                                <td className="border px-2 py-1">{value.pj.cidade} - {value.pj.estado}</td>
                                <td className="border px-2 py-1">
                                    <button className="bg-red-600 text-white-light font-semibold py-2 px-6 rounded-md" onClick={() => openInfos(value.pf.id)}>
                                        <AiOutlineFundView />
                                    </button>

                                </td>

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
        </div>

    )
}

export default Busness;