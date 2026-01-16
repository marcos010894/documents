import React, { useState, useEffect } from 'react';
import { TfiClose, TfiDownload } from 'react-icons/tfi';
import { MdFullscreen, MdFullscreenExit } from 'react-icons/md';

interface VideoPlayerModalProps {
    isOpen: boolean;
    onClose: () => void;
    file: {
        id: string;
        name: string;
        size?: string;
        url?: string;
    } | null;
}

const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
    isOpen,
    onClose,
    file
}) => {
    const [isFullscreen, setIsFullscreen] = useState(false);

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
    if (!isOpen || !file) return null;

    const videoUrl = file.url || `/api/documents/${file.id}/view`;

    const handleDownload = () => {
        const downloadUrl = file.url || `/api/documents/${file.id}/download`;
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = file.name;
        link.click();
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

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40 animate-fadeIn" onClick={onClose} />
            
            {/* Modal Container */}
            <div className={`fixed inset-0 flex items-center justify-center z-50 p-4 ${isFullscreen ? 'p-0' : ''}`}>
                <div className={`fullscreen-modal bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-slideIn ${isFullscreen ? 'w-screen h-screen rounded-none' : ''}`}>
                    {/* Header */}
                    <div className="bg-white border-b border-gray-200 px-6 py-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">{file.name}</h2>
                                <p className="text-gray-500 text-sm">Player de Vídeo</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleDownload}
                                    className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 p-2 rounded-lg transition-all duration-200"
                                    title="Baixar vídeo"
                                >
                                    <TfiDownload size={20} />
                                </button>
                                <button
                                    onClick={toggleFullscreen}
                                    className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 p-2 rounded-lg transition-all duration-200"
                                    title={isFullscreen ? "Sair tela cheia" : "Tela cheia"}
                                >
                                    {isFullscreen ? <MdFullscreenExit size={20} /> : <MdFullscreen size={20} />}
                                </button>
                                <button
                                    onClick={onClose}
                                    className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 p-2 rounded-lg transition-all duration-200"
                                >
                                    <TfiClose size={20} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Video Container */}
                    <div className="p-6 bg-black flex justify-center items-center">
                        <div className="w-full max-w-full">
                            <video
                                controls
                                className={`w-full rounded-lg ${isFullscreen ? 'max-h-[calc(100vh-120px)]' : 'max-h-[70vh]'}`}
                                poster="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQ1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzMzIi8+PGNpcmNsZSBjeD0iNDAwIiBjeT0iMjI1IiByPSI1MCIgZmlsbD0iIzY2NiIvPjxwb2x5Z29uIHBvaW50cz0iMzgwLDIwNSA0MjAsMjI1IDM4MCwyNDUiIGZpbGw9IiNmZmYiLz48L3N2Zz4="
                            >
                                <source src={videoUrl} type="video/mp4" />
                                <source src={videoUrl} type="video/webm" />
                                <source src={videoUrl} type="video/ogg" />
                                Seu navegador não suporta o elemento de vídeo.
                            </video>
                            {file.size && (
                                <p className="text-white text-sm mt-4 text-center">Tamanho: {file.size}</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default VideoPlayerModal;
