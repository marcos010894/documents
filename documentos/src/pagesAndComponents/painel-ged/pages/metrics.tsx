import { useEffect, useState, useRef } from "react";
import { TfiUser, TfiShare, TfiTime, TfiClose, TfiReload } from "react-icons/tfi";
import { api as useApi } from "../../../services/api";
import { VerifyDataExistInJson } from "../../../services/funcitons";
import Chart from 'chart.js/auto';
import 'chartjs-adapter-luxon';
import { CategoryScale } from 'chart.js';
import CardsGlobals from "../components/cards/globalCards";
import CardDocuments from "../components/cards/cardDocuments";

// Registrar escala necessária
Chart.register(CategoryScale);

// Interfaces de tipo
interface ClickData {
    date: string;
    term: string;
    city: string;
    state: string;
    accesses: number;
}

interface GraphicsSummary {
    hoje: number;
    semana: number;
    mes: number;
    ano: number;
}

interface FilterOptions {
    years: string[];
    months: { value: string; label: string }[];
    weeks: string[];
}

interface LoadingState {
    summary: boolean;
    details: boolean;
}

interface ErrorState {
    summary: string | null;
    details: string | null;
}

type MyDoc = {
    term?: string;
    city?: string;
};


const Metrics = () => {
    return (
        <div >
            {/* Seção de cards resumidos */}
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        <CardsGlobals title="Pessoas seguindo seu documento" Value={`12`} icon={<TfiUser color="#898989" size={28} />} />
                        <CardsGlobals title="Documentos compartilhados" Value={`12`} icon={<TfiShare color="#898989" size={28} />} />
                        <CardsGlobals title="Documentos à vencer" Value={`12`} icon={<TfiTime color="#898989" size={28} />} />
                        <CardsGlobals title="Documentos vencidos" Value={`12`} icon={<TfiClose color="#898989" size={28} />} />
                        <CardsGlobals title="Documento em processo" Value={`12`} icon={<TfiReload color="#898989" size={28} />} />
                        <CardsGlobals title="Documento em renovação" Value={`12`} icon={<TfiReload color="#898989" size={28} />} />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        <CardDocuments Type="PASTA" path="/documents/doc1.pdf" title="Meus documentos" />
                        <CardDocuments Type="PASTA" path="/documents/doc2.pdf" title="compartilhados Comigo" />
                        <CardDocuments Type="PASTA" path="/documents/doc2.pdf" title="Fornecedores" />
                        <CardDocuments Type="PASTA" path="/documents/doc2.pdf" title="Clientes" />
                    </div>
                </>
            

            {/* Seção de gráficos detalhados */}
        </div>
    );
};

export default Metrics;