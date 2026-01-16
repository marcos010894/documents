import { ReactNode, useState, useEffect } from "react";
import { hasPermission } from "../hooks/useCollaboratorPermissions";

interface SubItem {
    title: string,
    icon: string,
    navigate: (redirectText: React.ReactNode) => void,
    redirectText: React.ReactNode,
    requiredPermission?: 'manage_files' | 'view_metrics' | 'manage_collaborators' | 'view_only' | 'view_shared' | ('manage_files' | 'view_metrics' | 'manage_collaborators' | 'view_only' | 'view_shared')[]
}

interface ItemsMenu {
    listItem: Item[]
}

interface Item {
    type: string,
    openTypeProps: SubItem[],
    title: string,
    icon: ReactNode,
    navigate: (redirectText: ReactNode) => void,
    redirectText: React.ReactNode,
    requiredPermission?: 'manage_files' | 'view_metrics' | 'manage_collaborators' | 'view_only' | 'view_shared' | ('manage_files' | 'view_metrics' | 'manage_collaborators' | 'view_only' | 'view_shared')[]
}


const GlobalMenu = ({ listItem }: ItemsMenu) => {
    const [activeIndex, setActiveIndex] = useState<number>(0);
    const [filteredItems, setFilteredItems] = useState<Item[]>([]);

    useEffect(() => {
        // Filtrar itens baseado em permissões
        const filtered = listItem.filter(item => {
            if (!item.requiredPermission) {
                return true; // Sem restrição de permissão
            }
            // Se for array de permissões (OR logic)
            if (Array.isArray(item.requiredPermission)) {
                return item.requiredPermission.some(permission => hasPermission(permission));
            }
            // Se for string única
            return hasPermission(item.requiredPermission);
        });
        setFilteredItems(filtered);
    }, [listItem]);

    return (
        <div className="space-y-1.5 px-2">
            {
                filteredItems.map((document, index) => (
                    <div key={index}>
                        {document.type == 'redirect' ? (
                            <button
                                onClick={() => {
                                    setActiveIndex(index);
                                    document.navigate(document.redirectText);
                                }}
                                className={`
                                    group flex items-center gap-3 w-full px-4 py-2.5 rounded-lg
                                    transition-all duration-200
                                    ${activeIndex === index
                                        ? 'bg-red-600 text-white shadow-sm'
                                        : 'text-gray-700 hover:bg-gray-50'
                                    }
                                `}
                            >
                                <div className={`
                                    transition-transform duration-200 group-hover:scale-110 text-[20px] flex-shrink-0
                                    ${activeIndex === index ? 'text-white' : 'text-red-600'}
                                `}>
                                    {document.icon}
                                </div>

                                <span className={`
                                    text-[13px] flex-1 text-left
                                    ${activeIndex === index ? 'font-semibold' : 'font-medium'}
                                `}>
                                    {document.title}
                                </span>

                                {activeIndex === index && (
                                    <div className="w-1 h-4 bg-white/90 rounded-full flex-shrink-0" />
                                )}
                            </button>
                        ) : (
                            <button
                                onClick={() => alert('vai abrir o menu de titulo')}
                                className="group flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-200"
                            >
                                <div className="text-red-600 transition-transform duration-200 group-hover:scale-110 text-[20px] flex-shrink-0">
                                    {document.icon}
                                </div>
                                <span className="text-[13px] font-medium flex-1 text-left">
                                    {document.title}
                                </span>
                                <svg className="w-4 h-4 text-gray-400 group-hover:text-red-600 transition-colors duration-200 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        )}
                    </div>
                ))
            }
        </div>
    )
}

export default GlobalMenu;