import { TfiFolder, TfiFile } from "react-icons/tfi";

interface Files {
    Type: string;
    path: string;
    title: string;
}

const CardDocuments =  (File: Files) => {
    return (
        <div className="mr-4 w-[260px] cursor-pointer flex  items-center p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
            <div className="icon-container mr-4">
                {File.Type === "PASTA" && <TfiFolder color="#f18744" size={20} />}
                {File.Type === "file" && <TfiFile color="#898989" size={20} />}
            </div>
            <p className="font-light text-sm"> {File.title}</p>
            {/* Conteúdo do card de documentos */}
        </div>
    );
}

export default CardDocuments;