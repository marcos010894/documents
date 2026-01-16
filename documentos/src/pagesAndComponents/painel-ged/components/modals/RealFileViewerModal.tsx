import React, { useState, useEffect } from 'react';
import { TfiClose, TfiDownload, TfiFile } from 'react-icons/tfi';
import { MdFullscreen, MdFullscreenExit, MdDescription } from 'react-icons/md';

interface RealFileViewerModalProps {
    isOpen: boolean;
    onClose: () => void;
    file: {
        id: string;
        name: string;
        size?: string;
        extension?: string;
        url?: string;
    } | null;
}

const RealFileViewerModal: React.FC<RealFileViewerModalProps> = ({
    isOpen,
    onClose,
    file
}) => {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [fileContent, setFileContent] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [fileType, setFileType] = useState<'csv' | 'text' | 'image' | 'office' | 'audio' | 'other'>('other');

    useEffect(() => {
        if (isOpen && file && file.url) {
            loadRealFile();
        }
    }, [isOpen, file]);

    // Listener para detectar mudanças no estado de fullscreen
    useEffect(() => {
        const handleFullscreenChange = () => {
            const isCurrentlyFullscreen = !!(
                document.fullscreenElement ||
                (document as any).webkitFullscreenElement ||
                (document as any).msFullscreenElement
            );
            setIsFullscreen(isCurrentlyFullscreen);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('msfullscreenchange', handleFullscreenChange);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
            document.removeEventListener('msfullscreenchange', handleFullscreenChange);
        };
    }, []);

    const loadRealFile = async () => {
        if (!file?.url) return;
        
        setLoading(true);
        setError('');
        
        try {
            const extension = file.extension?.toLowerCase();
            
            if (extension === '.csv') {
                setFileType('csv');
                const response = await fetch(file.url);
                if (!response.ok) throw new Error('Arquivo não encontrado');
                const csvText = await response.text();
                setFileContent(csvText);
            } else if (extension === '.txt') {
                setFileType('text');
                const response = await fetch(file.url);
                if (!response.ok) throw new Error('Arquivo não encontrado');
                const textContent = await response.text();
                setFileContent(textContent);
            } else if (extension === '.pdf') {
                setFileType('office'); // Usar office viewer para PDFs também
                setFileContent('');
            } else if (['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'].includes(extension || '')) {
                setFileType('image');
                setFileContent('');
            } else if (['.docx', '.doc', '.xlsx', '.xls', '.pptx', '.ppt'].includes(extension || '')) {
                setFileType('office');
                setFileContent('');
            } else if (['.mp3', '.wav', '.m4a', '.ogg'].includes(extension || '')) {
                setFileType('audio');
                setFileContent('');
            } else {
                setFileType('other');
                setFileContent('');
            }
        } catch (err) {
            setError('Erro ao carregar o arquivo. Verifique se o arquivo existe.');
            console.error('Erro ao carregar arquivo:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = () => {
        if (file?.url) {
            const link = document.createElement('a');
            link.href = file.url;
            link.download = file.name;
            link.click();
        }
    };

    const handleOpenInNewTab = () => {
        if (file?.url) {
            window.open(file.url, '_blank');
        }
    };

    const toggleFullscreen = async () => {
        try {
            if (!isFullscreen) {
                // Entrar em tela cheia
                const modalElement = document.querySelector('.fullscreen-modal') as HTMLElement;
                if (modalElement) {
                    if (modalElement.requestFullscreen) {
                        await modalElement.requestFullscreen();
                    } else if ((modalElement as any).webkitRequestFullscreen) {
                        await (modalElement as any).webkitRequestFullscreen();
                    } else if ((modalElement as any).msRequestFullscreen) {
                        await (modalElement as any).msRequestFullscreen();
                    }
                }
                setIsFullscreen(true);
            } else {
                // Sair da tela cheia
                if (document.fullscreenElement) {
                    if (document.exitFullscreen) {
                        await document.exitFullscreen();
                    } else if ((document as any).webkitExitFullscreen) {
                        await (document as any).webkitExitFullscreen();
                    } else if ((document as any).msExitFullscreen) {
                        await (document as any).msExitFullscreen();
                    }
                }
                setIsFullscreen(false);
            }
        } catch (error) {
            console.error('Erro ao alternar tela cheia:', error);
            // Fallback para o comportamento anterior se a API não funcionar
            setIsFullscreen(!isFullscreen);
        }
    };

    const renderCSVContent = () => {
        const lines = fileContent.split('\n').filter(line => line.trim());
        if (lines.length === 0) return <p>Arquivo CSV vazio</p>;
        
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const rows = lines.slice(1).map(line => line.split(',').map(cell => cell.trim().replace(/"/g, '')));
        
        return (
            <div className="font-sans">
                <h1 className="text-2xl font-bold text-green-600 border-b-2 border-green-600 pb-2 mb-4">
                    📊 {file?.name.replace(/\.[^/.]+$/, "") || 'Arquivo CSV'}
                </h1>
                
                <div className="bg-gray-100 p-4 rounded-lg mb-5">
                    <h3 className="text-lg font-semibold text-gray-800 mt-0">Conteúdo Real do Arquivo CSV</h3>
                    <p className="text-gray-600">Dados carregados diretamente do arquivo: {file?.url}</p>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse mt-5 bg-white shadow-lg rounded-lg overflow-hidden">
                        <thead>
                            <tr className="bg-green-600 text-white">
                                {headers.map((header, index) => (
                                    <th key={index} className="border border-gray-300 p-3 text-left font-semibold">{header}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row, rowIndex) => (
                                <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50 hover:bg-gray-100'}>
                                    {row.map((cell, cellIndex) => (
                                        <td key={cellIndex} className="border border-gray-300 p-3">{cell}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                <div className="mt-8 bg-blue-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-green-600 mb-3">📋 Informações do Arquivo:</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><strong>📊 Linhas de dados:</strong> {rows.length}</div>
                        <div><strong>📋 Colunas:</strong> {headers.length}</div>
                        <div><strong>📏 Tamanho:</strong> {file?.size || 'N/A'}</div>
                        <div><strong>📍 Localização:</strong> {file?.url}</div>
                    </div>
                </div>
            </div>
        );
    };

    const renderTextContent = () => {
        return (
            <div className="bg-white p-5 rounded-lg">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                    📄 {file?.name}
                </h2>
                <pre className="font-mono whitespace-pre-wrap bg-gray-50 p-4 rounded border text-sm max-h-96 overflow-y-auto">
                    {fileContent}
                </pre>
            </div>
        );
    };

    const renderImageContent = () => {
        return (
            <div className="text-center p-5">
                <h2 className="text-xl font-bold text-green-600 mb-5">🖼️ {file?.name}</h2>
                <div className="inline-block border-4 border-green-600 rounded-lg overflow-hidden shadow-xl bg-white p-2">
                    <img 
                        src={file?.url} 
                        alt={file?.name}
                        className="max-w-full max-h-96 block mx-auto rounded"
                        style={{ maxHeight: '500px' }}
                    />
                </div>
                <div className="mt-5 bg-gray-100 p-4 rounded-lg">
                    <p><strong>🖼️ Arquivo:</strong> {file?.name}</p>
                    <p><strong>📍 Localização:</strong> {file?.url}</p>
                    <p><strong>📏 Tamanho:</strong> {file?.size || 'N/A'}</p>
                </div>
            </div>
        );
    };

    const renderOfficeContent = () => {
        const googleViewerUrl = `https://docs.google.com/viewer?url=${file?.url}&embedded=true`;
        
        // Determinar o tipo de documento e ícone
        const extension = file?.extension?.toLowerCase();
        let documentType = 'Documento';
        let documentIcon = '📝';
        
        switch (extension) {
            case '.pdf':
                documentType = 'PDF';
                documentIcon = '📄';
                break;
            case '.doc':
            case '.docx':
                documentType = 'Word';
                documentIcon = '📝';
                break;
            case '.xls':
            case '.xlsx':
                documentType = 'Excel';
                documentIcon = '📊';
                break;
            case '.ppt':
            case '.pptx':
                documentType = 'PowerPoint';
                documentIcon = '📽️';
                break;
            default:
                documentType = 'Documento';
                documentIcon = '📄';
        }
        
        return (
            <div className="w-full">
                <div className="mb-4 text-center">
                    <h2 className="text-xl font-bold text-blue-600 mb-2">{documentIcon} {file?.name}</h2>
                    <p className="text-gray-600">Visualização via Google Docs Viewer ({documentType})</p>
                </div>
                <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
                    <iframe 
                        src={googleViewerUrl}
                        width="100%" 
                        height="600px"
                        className="border-0"
                        title={`Visualizador de ${documentType}`}
                    />
                </div>
                <div className="text-center mt-5 p-5 bg-gray-50 rounded-lg">
                    <p><strong>{documentIcon} Visualizando:</strong> {file?.name}</p>
                    <p>Arquivo {documentType} carregado via Google Docs Viewer</p>
                    <div className="flex justify-center gap-4 mt-4">
                        <a 
                            href={file?.url} 
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline hover:text-blue-800"
                        >
                            🌐 Abrir em nova aba
                        </a>
                        <a 
                            href={file?.url} 
                            download
                            className="text-green-600 underline hover:text-green-800"
                        >
                            ⬇️ Download direto
                        </a>
                    </div>
                </div>
            </div>
        );
    };

    const renderAudioContent = () => {
        return (
            <div className="text-center p-10">
                <div className="bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl p-10 text-white shadow-2xl max-w-md mx-auto">
                    <div className="text-6xl mb-5">🎵</div>
                    <h2 className="text-2xl font-bold mb-8">{file?.name}</h2>
                    
                    <div className="bg-white rounded-lg p-4 mb-5">
                        <audio 
                            controls 
                            className="w-full"
                            style={{ outline: 'none' }}
                        >
                            <source src={file?.url} type="audio/mpeg" />
                            <source src={file?.url} type="audio/wav" />
                            <source src={file?.url} type="audio/ogg" />
                            Seu navegador não suporta o elemento de áudio.
                        </audio>
                    </div>
                    
                    <div className="bg-white bg-opacity-20 p-5 rounded-lg">
                        <p><strong>🎵 Arquivo de áudio:</strong> {file?.name}</p>
                        <p><strong>📍 Localização:</strong> {file?.url}</p>
                        <p><strong>📏 Tamanho:</strong> {file?.size || 'N/A'}</p>
                    </div>
                </div>
            </div>
        );
    };

    const renderDefaultContent = () => {
        const extension = file?.extension?.toLowerCase();
        const getFileIcon = () => {
            switch (extension) {
                case '.pdf': return '📄';
                case '.docx': case '.doc': return '📝';
                case '.xlsx': case '.xls': return '📊';
                case '.pptx': case '.ppt': return '📽️';
                case '.jpg': case '.png': case '.jpeg': return '🖼️';
                case '.mp3': case '.wav': return '🎵';
                default: return '📁';
            }
        };

        return (
            <div className="text-center p-8">
                <h1 className="text-2xl font-bold text-blue-600 mb-8">{file?.name}</h1>
                
                <div className="bg-gray-100 p-8 rounded-2xl mb-5 max-w-md mx-auto">
                    <div className="text-6xl mb-5">{getFileIcon()}</div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-0">Arquivo Real Disponível</h2>
                    <p className="text-gray-600 mt-2">Este arquivo está localizado em:</p>
                    <p className="font-mono text-sm bg-white p-2 rounded mt-2"><strong>{file?.url}</strong></p>
                </div>
                
                <div className="bg-white border-2 border-blue-500 rounded-lg p-5 mb-5 max-w-lg mx-auto">
                    <h3 className="text-lg font-semibold text-blue-600 mt-0 mb-4">💡 Como visualizar este arquivo:</h3>
                    <div className="text-left space-y-2">
                        <p><strong>🔽 Opção 1:</strong> Clique no botão "Download" para baixar e abrir no aplicativo apropriado</p>
                        <p><strong>🌐 Opção 2:</strong> Para PDFs, clique em "Abrir em Nova Aba" abaixo</p>
                        <p><strong>👁️ Opção 3:</strong> Para imagens, use o visualizador de imagens integrado</p>
                    </div>
                </div>
                
                <div className="space-x-4">
                    <button 
                        onClick={handleOpenInNewTab}
                        className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors inline-flex items-center gap-2"
                    >
                        🌐 Abrir em Nova Aba
                    </button>
                    <button 
                        onClick={handleDownload}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                    >
                        ⬇️ Download Direto
                    </button>
                </div>
                
                <div className="mt-5 text-sm text-gray-500 bg-gray-50 p-3 rounded">
                    <strong>📋 Informações:</strong> Tipo: {extension?.toUpperCase()} | Tamanho: {file?.size || 'N/A'}
                </div>
            </div>
        );
    };

    const renderFileContent = () => {
        switch (fileType) {
            case 'csv':
                return renderCSVContent();
            case 'text':
                return renderTextContent();
            case 'image':
                return renderImageContent();
            case 'office':
                return renderOfficeContent();
            case 'audio':
                return renderAudioContent();
            default:
                return renderDefaultContent();
        }
    };

    if (!isOpen || !file) return null;

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40 animate-fadeIn" onClick={onClose} />
            
            {/* Modal */}
            <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${isFullscreen ? 'p-0' : ''}`}>
                <div 
                    className={`fullscreen-modal bg-white rounded-lg shadow-2xl max-w-6xl w-full ${isFullscreen ? 'w-screen h-screen rounded-none' : 'max-h-screen'} flex flex-col`}
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="bg-white border-b border-gray-200 p-4 rounded-t-lg flex-shrink-0">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <MdDescription size={24} className="text-gray-600" />
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900">{file.name}</h2>
                                    <p className="text-gray-500 text-sm">Visualizador de Arquivos</p>
                                </div>
                            </div>

                            {/* Action buttons */}
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={handleOpenInNewTab}
                                    className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 p-2 rounded-lg transition-all duration-200"
                                    title="Abrir em nova aba"
                                >
                                    <TfiFile size={18} />
                                </button>
                                
                                <button
                                    onClick={handleDownload}
                                    className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 p-2 rounded-lg transition-all duration-200"
                                    title="Download"
                                >
                                    <TfiDownload size={18} />
                                </button>

                                <button
                                    onClick={toggleFullscreen}
                                    className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 p-2 rounded-lg transition-all duration-200"
                                    title={isFullscreen ? "Sair tela cheia" : "Tela cheia"}
                                >
                                    {isFullscreen ? <MdFullscreenExit size={18} /> : <MdFullscreen size={18} />}
                                </button>

                                <button
                                    onClick={onClose}
                                    className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 p-2 rounded-lg transition-all duration-200"
                                    title="Fechar"
                                >
                                    <TfiClose size={18} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="overflow-auto flex-1" style={{ height: isFullscreen ? 'calc(100vh - 80px)' : '70vh' }}>
                        {loading ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                                    <p className="text-gray-600">🔄 Carregando arquivo real...</p>
                                </div>
                            </div>
                        ) : error ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="text-center p-6">
                                    <div className="text-6xl mb-4">❌</div>
                                    <h3 className="text-xl font-semibold text-red-600 mb-2">Erro ao carregar arquivo</h3>
                                    <p className="text-gray-600 mb-4">{error}</p>
                                    <button
                                        onClick={handleOpenInNewTab}
                                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                                    >
                                        Tentar abrir em nova aba
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="p-6">
                                {renderFileContent()}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default RealFileViewerModal;