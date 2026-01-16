import React from 'react';

interface Properts {
    Title: string,
    component: React.ReactNode,
    scratch: boolean
}

const PagesCenterGlobal = ({ Title, component, scratch }: Properts) => {
    return (
        <div className="space-y-6">
            {/* Header da página - MELHORADO */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    {scratch && (
                        <div className="flex flex-col sm:flex-row gap-3">
                            {/* Search input melhorado */}
                            <div className="relative">
                                <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 pointer-events-none">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M16 10a6 6 0 11-12 0 6 6 0 0112 0z" />
                                    </svg>
                                </span>
                                <input
                                    type="text"
                                    placeholder="Procurar documentos..."
                                    className="pl-10 pr-4 py-2.5 w-full sm:w-64 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent text-sm transition-all"
                                />
                            </div>

                            {/* Select melhorado */}
                            <div className="relative">
                                <select className="appearance-none border border-gray-300 rounded-lg py-2.5 pl-4 pr-10 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent bg-white cursor-pointer transition-all hover:border-gray-400">
                                    <option value="recent">Mais recente</option>
                                    <option value="popular">Mais antigo</option>
                                </select>
                                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Conteúdo da página */}
            <div>
                {component}
            </div>
        </div>
    )
}


export default PagesCenterGlobal