import React, { useState, useEffect } from 'react';
import { TfiClose, TfiDownload, TfiPencil, TfiSave, TfiPrinter, TfiFile } from 'react-icons/tfi';
import { MdFullscreen, MdFullscreenExit, MdDescription, MdTableChart, MdSlideshow, MdPictureAsPdf } from 'react-icons/md';
import { hasPermission } from '../../../../hooks/useCollaboratorPermissions';

interface DocumentViewerModalProps {
    isOpen: boolean;
    onClose: () => void;
    file: {
        id: string;
        name: string;
        size?: string;
        extension?: string;
        url?: string;
    } | null;
    onSave?: (content: string) => void;
}

const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
    isOpen,
    onClose,
    file,
    onSave
}) => {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [documentContent, setDocumentContent] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen && file) {
            loadDocument();
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

    const loadDocument = async () => {
        setLoading(true);
        // Simular carregamento do documento
        setTimeout(() => {
            setDocumentContent(getMockContent());
            setLoading(false);
        }, 1000);
    };

    const getMockContent = () => {
        if (!file) return '';
        
        const extension = file.extension?.toLowerCase();
        
        switch (extension) {
            case '.docx':
            case '.doc':
                return `
                    <div style="font-family: Calibri, sans-serif; line-height: 1.6; padding: 20px;">
                        <h1 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px;">
                            ${file.name.replace(/\.[^/.]+$/, "")}
                        </h1>
                        
                        <h2 style="color: #34495e; margin-top: 30px;">Introdução</h2>
                        <p>Este é um documento de exemplo que demonstra a capacidade de visualização e edição online de arquivos Word. O sistema permite visualizar e editar documentos diretamente no navegador, similar ao Google Docs.</p>
                        
                        <h2 style="color: #34495e; margin-top: 30px;">Características</h2>
                        <ul>
                            <li>Visualização em tempo real</li>
                            <li>Edição colaborativa</li>
                            <li>Formatação de texto</li>
                            <li>Inserção de imagens</li>
                            <li>Comentários e revisões</li>
                        </ul>
                        
                        <h2 style="color: #34495e; margin-top: 30px;">Conclusão</h2>
                        <p>Este sistema de GED oferece uma experiência completa de gerenciamento de documentos, permitindo não apenas o armazenamento, mas também a visualização e edição online de diversos formatos de arquivo.</p>
                        
                        <div style="margin-top: 40px; text-align: center; color: #7f8c8d; font-size: 12px;">
                            Documento gerado pelo Sistema GED - ${new Date().toLocaleDateString('pt-BR')}
                        </div>
                    </div>
                `;
                
            case '.xlsx':
            case '.xls':
                return `
                    <div style="font-family: Arial, sans-serif; padding: 20px;">
                        <h1 style="color: #27ae60; border-bottom: 2px solid #27ae60; padding-bottom: 10px;">
                            ${file.name.replace(/\.[^/.]+$/, "")}
                        </h1>
                        
                        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                            <thead>
                                <tr style="background-color: #27ae60; color: white;">
                                    <th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Produto</th>
                                    <th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Quantidade</th>
                                    <th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Preço Unit.</th>
                                    <th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td style="border: 1px solid #ddd; padding: 12px;">Licença Software</td>
                                    <td style="border: 1px solid #ddd; padding: 12px;">10</td>
                                    <td style="border: 1px solid #ddd; padding: 12px;">R$ 150,00</td>
                                    <td style="border: 1px solid #ddd; padding: 12px;">R$ 1.500,00</td>
                                </tr>
                                <tr style="background-color: #f9f9f9;">
                                    <td style="border: 1px solid #ddd; padding: 12px;">Consultoria</td>
                                    <td style="border: 1px solid #ddd; padding: 12px;">20</td>
                                    <td style="border: 1px solid #ddd; padding: 12px;">R$ 200,00</td>
                                    <td style="border: 1px solid #ddd; padding: 12px;">R$ 4.000,00</td>
                                </tr>
                                <tr>
                                    <td style="border: 1px solid #ddd; padding: 12px;">Treinamento</td>
                                    <td style="border: 1px solid #ddd; padding: 12px;">5</td>
                                    <td style="border: 1px solid #ddd; padding: 12px;">R$ 300,00</td>
                                    <td style="border: 1px solid #ddd; padding: 12px;">R$ 1.500,00</td>
                                </tr>
                                <tr style="background-color: #27ae60; color: white; font-weight: bold;">
                                    <td style="border: 1px solid #ddd; padding: 12px;" colspan="3">TOTAL GERAL</td>
                                    <td style="border: 1px solid #ddd; padding: 12px;">R$ 7.000,00</td>
                                </tr>
                            </tbody>
                        </table>
                        
                        <div style="margin-top: 30px;">
                            <h3 style="color: #27ae60;">Observações:</h3>
                            <ul>
                                <li>Valores válidos até ${new Date(Date.now() + 30*24*60*60*1000).toLocaleDateString('pt-BR')}</li>
                                <li>Desconto de 10% para pagamento à vista</li>
                                <li>Parcelamento em até 12x sem juros</li>
                            </ul>
                        </div>
                    </div>
                `;
                
            case '.pptx':
            case '.ppt':
                return `
                    <div style="font-family: Segoe UI, sans-serif; padding: 20px;">
                        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; text-align: center; border-radius: 10px; margin-bottom: 30px;">
                            <h1 style="font-size: 2.5em; margin: 0;">${file.name.replace(/\.[^/.]+$/, "")}</h1>
                            <p style="font-size: 1.2em; margin: 10px 0;">Apresentação Corporativa</p>
                        </div>
                        
                        <div style="background: white; border: 1px solid #ddd; border-radius: 10px; padding: 30px; margin: 20px 0; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                            <h2 style="color: #667eea; margin-top: 0;">Slide 1: Visão Geral</h2>
                            <ul style="font-size: 1.1em; line-height: 1.8;">
                                <li>Sistema de Gestão Eletrônica de Documentos</li>
                                <li>Solução completa para organização de arquivos</li>
                                <li>Interface intuitiva e moderna</li>
                                <li>Compatibilidade com múltiplos formatos</li>
                            </ul>
                        </div>
                        
                        <div style="background: white; border: 1px solid #ddd; border-radius: 10px; padding: 30px; margin: 20px 0; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                            <h2 style="color: #667eea; margin-top: 0;">Slide 2: Benefícios</h2>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                                <div>
                                    <h3 style="color: #764ba2;">Produtividade</h3>
                                    <p>Acesso rápido aos documentos</p>
                                </div>
                                <div>
                                    <h3 style="color: #764ba2;">Segurança</h3>
                                    <p>Controle de acesso por usuário</p>
                                </div>
                                <div>
                                    <h3 style="color: #764ba2;">Colaboração</h3>
                                    <p>Edição simultânea de arquivos</p>
                                </div>
                                <div>
                                    <h3 style="color: #764ba2;">Mobilidade</h3>
                                    <p>Acesso de qualquer dispositivo</p>
                                </div>
                            </div>
                        </div>
                        
                        <div style="background: white; border: 1px solid #ddd; border-radius: 10px; padding: 30px; margin: 20px 0; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                            <h2 style="color: #667eea; margin-top: 0;">Slide 3: Próximos Passos</h2>
                            <ol style="font-size: 1.1em; line-height: 1.8;">
                                <li>Implementação do sistema</li>
                                <li>Treinamento da equipe</li>
                                <li>Migração dos documentos</li>
                                <li>Acompanhamento e suporte</li>
                            </ol>
                        </div>
                    </div>
                `;
                
            case '.pdf':
                return `
                    <div style="font-family: Times New Roman, serif; padding: 40px; max-width: 800px; margin: 0 auto; background: white;">
                        <div style="text-align: center; border-bottom: 3px solid #e74c3c; padding-bottom: 20px; margin-bottom: 30px;">
                            <h1 style="color: #e74c3c; font-size: 2em; margin: 0;">${file.name.replace(/\.[^/.]+$/, "")}</h1>
                            <p style="color: #7f8c8d; margin: 10px 0;">Documento PDF - Sistema GED</p>
                        </div>
                        
                        <div style="columns: 2; column-gap: 30px; text-align: justify; line-height: 1.8;">
                            <h2 style="color: #2c3e50; break-after: avoid;">Resumo Executivo</h2>
                            <p>Este documento apresenta uma visão abrangente do sistema de Gestão Eletrônica de Documentos (GED) implementado em nossa organização. O sistema foi desenvolvido com foco na eficiência, segurança e facilidade de uso.</p>
                            
                            <h2 style="color: #2c3e50; break-after: avoid;">Objetivos</h2>
                            <p>O principal objetivo do sistema GED é centralizar o armazenamento, organização e acesso aos documentos corporativos, eliminando a dependência de arquivos físicos e proporcionando maior agilidade nos processos.</p>
                            
                            <h2 style="color: #2c3e50; break-after: avoid;">Funcionalidades</h2>
                            <p>O sistema oferece funcionalidades avançadas como visualização online de documentos, edição colaborativa, controle de versões, sistema de permissões granular e integração com outros sistemas corporativos.</p>
                            
                            <h2 style="color: #2c3e50; break-after: avoid;">Benefícios</h2>
                            <p>Entre os principais benefícios destacam-se: redução de custos com papel e impressão, aumento da produtividade, melhoria na segurança da informação, facilidade de backup e recuperação, e conformidade com regulamentações.</p>
                        </div>
                        
                        <div style="margin-top: 40px; text-align: center; color: #95a5a6; font-size: 12px; border-top: 1px solid #ecf0f1; padding-top: 20px;">
                            Página 1 de 1 - Gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}
                        </div>
                    </div>
                `;
                
            case '.csv':
                return `
                    <div style="font-family: Arial, sans-serif; padding: 20px;">
                        <h1 style="color: #16a085; border-bottom: 2px solid #16a085; padding-bottom: 10px;">
                            ${file.name.replace(/\.[^/.]+$/, "")}
                        </h1>
                        
                        <div style="background: #ecf0f1; padding: 15px; border-radius: 10px; margin: 20px 0;">
                            <h3 style="color: #2c3e50; margin-top: 0;">📊 Dados CSV - Visualização Tabular</h3>
                            <p style="color: #7f8c8d;">Este arquivo contém dados estruturados em formato CSV (Comma-Separated Values)</p>
                        </div>
                        
                        <table style="width: 100%; border-collapse: collapse; margin-top: 20px; background: white;">
                            <thead>
                                <tr style="background-color: #16a085; color: white;">
                                    <th style="border: 1px solid #ddd; padding: 12px; text-align: left;">ID</th>
                                    <th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Nome</th>
                                    <th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Categoria</th>
                                    <th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Valor</th>
                                    <th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Data</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td style="border: 1px solid #ddd; padding: 12px;">001</td>
                                    <td style="border: 1px solid #ddd; padding: 12px;">Marco Santos</td>
                                    <td style="border: 1px solid #ddd; padding: 12px;">AGV</td>
                                    <td style="border: 1px solid #ddd; padding: 12px;">R$ 2.500,00</td>
                                    <td style="border: 1px solid #ddd; padding: 12px;">15/03/2024</td>
                                </tr>
                                <tr style="background-color: #f9f9f9;">
                                    <td style="border: 1px solid #ddd; padding: 12px;">002</td>
                                    <td style="border: 1px solid #ddd; padding: 12px;">Ana Silva</td>
                                    <td style="border: 1px solid #ddd; padding: 12px;">AGV</td>
                                    <td style="border: 1px solid #ddd; padding: 12px;">R$ 3.200,00</td>
                                    <td style="border: 1px solid #ddd; padding: 12px;">18/03/2024</td>
                                </tr>
                                <tr>
                                    <td style="border: 1px solid #ddd; padding: 12px;">003</td>
                                    <td style="border: 1px solid #ddd; padding: 12px;">Carlos Lima</td>
                                    <td style="border: 1px solid #ddd; padding: 12px;">AGV</td>
                                    <td style="border: 1px solid #ddd; padding: 12px;">R$ 1.850,00</td>
                                    <td style="border: 1px solid #ddd; padding: 12px;">20/03/2024</td>
                                </tr>
                                <tr style="background-color: #f9f9f9;">
                                    <td style="border: 1px solid #ddd; padding: 12px;">004</td>
                                    <td style="border: 1px solid #ddd; padding: 12px;">Maria Costa</td>
                                    <td style="border: 1px solid #ddd; padding: 12px;">AGV</td>
                                    <td style="border: 1px solid #ddd; padding: 12px;">R$ 4.100,00</td>
                                    <td style="border: 1px solid #ddd; padding: 12px;">22/03/2024</td>
                                </tr>
                                <tr style="background-color: #16a085; color: white; font-weight: bold;">
                                    <td style="border: 1px solid #ddd; padding: 12px;" colspan="3">TOTAL GERAL</td>
                                    <td style="border: 1px solid #ddd; padding: 12px;">R$ 11.650,00</td>
                                    <td style="border: 1px solid #ddd; padding: 12px;">4 registros</td>
                                </tr>
                            </tbody>
                        </table>
                        
                        <div style="margin-top: 30px;">
                            <h3 style="color: #16a085;">Informações do Arquivo:</h3>
                            <ul>
                                <li><strong>Formato:</strong> CSV (Comma-Separated Values)</li>
                                <li><strong>Codificação:</strong> UTF-8</li>
                                <li><strong>Separador:</strong> Vírgula (,)</li>
                                <li><strong>Total de linhas:</strong> 5 (incluindo cabeçalho)</li>
                            </ul>
                        </div>
                        
                        <div style="background: #d5f4e6; border-left: 4px solid #16a085; padding: 15px; margin: 20px 0;">
                            <p style="margin: 0; color: #2c3e50;"><strong>💡 Dica:</strong> Este arquivo pode ser aberto em Excel, Google Sheets ou qualquer editor de planilhas para análise mais detalhada dos dados.</p>
                        </div>
                    </div>
                `;
                
            default:
                return `
                    <div style="font-family: Monaco, monospace; padding: 20px; background: #2c3e50; color: #ecf0f1; border-radius: 10px;">
                        <h1 style="color: #3498db;">${file.name}</h1>
                        <p>Tipo de arquivo: ${extension}</p>
                        <p>Este é um arquivo de exemplo do tipo ${extension}.</p>
                        <p>O conteúdo seria carregado dinamicamente em um sistema real.</p>
                        
                        <div style="background: #34495e; padding: 15px; margin: 20px 0; border-radius: 5px;">
                            <code>
                                // Exemplo de conteúdo do arquivo<br/>
                                function exemploFuncao() {<br/>
                                &nbsp;&nbsp;&nbsp;&nbsp;console.log("Arquivo ${file.name} carregado com sucesso!");<br/>
                                &nbsp;&nbsp;&nbsp;&nbsp;return true;<br/>
                                }
                            </code>
                        </div>
                    </div>
                `;
        }
    };

    const handleSave = () => {
        if (onSave) {
            onSave(documentContent);
        }
        setIsEditing(false);
    };

    const handleDownload = () => {
        const downloadUrl = file?.url || `/api/documents/${file?.id}/download`;
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = file?.name || 'document';
        link.click();
    };

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
                <html>
                    <head>
                        <title>${file?.name || 'Documento'}</title>
                        <style>
                            body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
                            @media print { body { margin: 0; } }
                        </style>
                    </head>
                    <body>
                        ${documentContent}
                    </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.print();
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

    if (!isOpen || !file) return null;

    const extension = file.extension?.toLowerCase();
    const isEditableFormat = ['.docx', '.doc', '.xlsx', '.xls', '.csv', '.pptx', '.ppt', '.txt'].includes(extension || '');

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40 animate-fadeIn" onClick={onClose} />
            
            {/* Modal Container */}
            <div className={`fixed inset-0 flex items-center justify-center z-50 p-4 ${isFullscreen ? 'p-0' : ''}`}>
                <div className={`fullscreen-modal bg-white shadow-2xl overflow-hidden animate-slideIn ${
                    isFullscreen 
                        ? 'w-full h-full' 
                        : 'rounded-2xl w-full max-w-6xl max-h-[90vh]'
                }`}>
                    {/* Header */}
                    <div className="bg-white border-b border-gray-200 px-6 py-4">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-3">
                                <div className="flex items-center space-x-2">
                                    {extension === '.docx' || extension === '.doc' ? (
                                        <MdDescription size={24} className="text-gray-600" />
                                    ) : extension === '.xlsx' || extension === '.xls' ? (
                                        <MdTableChart size={24} className="text-gray-600" />
                                    ) : extension === '.csv' ? (
                                        <MdTableChart size={24} className="text-gray-600" />
                                    ) : extension === '.pptx' || extension === '.ppt' ? (
                                        <MdSlideshow size={24} className="text-gray-600" />
                                    ) : extension === '.pdf' ? (
                                        <MdPictureAsPdf size={24} className="text-gray-600" />
                                    ) : (
                                        <TfiFile size={24} className="text-gray-600" />
                                    )}
                                    <h2 className="text-xl font-semibold text-gray-900">{file.name}</h2>
                                </div>
                                {file.size && (
                                    <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                                        {file.size}
                                    </span>
                                )}
                            </div>
                            
                            <div className="flex items-center space-x-2">
                                {/* Controles de ação */}
                                <button
                                    onClick={handlePrint}
                                    className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 p-2 rounded-lg transition-all duration-200"
                                    title="Imprimir"
                                >
                                    <TfiPrinter size={18} />
                                </button>
                                
                                <button
                                    onClick={handleDownload}
                                    className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 p-2 rounded-lg transition-all duration-200"
                                    title="Download"
                                >
                                    <TfiDownload size={18} />
                                </button>

                                {isEditableFormat && hasPermission('manage_files') && (
                                    <>
                                        {isEditing ? (
                                            <button
                                                onClick={handleSave}
                                                className="text-white p-2 rounded-lg transition-all duration-200"
                                                style={{ backgroundColor: '#f37329' }}
                                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d1722f'}
                                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f37329'}
                                                title="Salvar"
                                            >
                                                <TfiSave size={18} />
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => setIsEditing(true)}
                                                className="text-gray-600 p-2 rounded-lg transition-all duration-200"
                                                style={{ backgroundColor: '#DCDCDC' }}
                                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#c5c5c5'}
                                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#DCDCDC'}
                                                title="Editar"
                                            >
                                                <TfiPencil size={18} />
                                            </button>
                                        )}
                                    </>
                                )}

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
                        
                        {isEditing && (
                            <div className="mt-3 p-3 bg-white bg-opacity-20 rounded-lg">
                                <p className="text-sm">
                                    <TfiPencil className="inline mr-2" />
                                    Modo de edição ativo - Suas alterações serão salvas automaticamente
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Content */}
                    <div className="overflow-auto" style={{ height: isFullscreen ? 'calc(100vh - 80px)' : '70vh' }}>
                        {loading ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                    <p className="text-gray-600">Carregando documento...</p>
                                </div>
                            </div>
                        ) : isEditing && isEditableFormat ? (
                            <div className="p-6">
                                <textarea
                                    value={documentContent.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ')}
                                    onChange={(e) => setDocumentContent(e.target.value)}
                                    className="w-full h-full min-h-96 p-4 border border-gray-300 rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Digite o conteúdo do documento..."
                                />
                                <div className="mt-4 text-sm text-gray-500">
                                    <p>💡 Dica: Este é um editor de texto simplificado. Em produção, seria integrado com editores como TinyMCE ou CKEditor para formatação completa.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="p-6">
                                <div dangerouslySetInnerHTML={{ __html: documentContent }} />
                                
                                {!isEditableFormat && (
                                    <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                        <p className="text-blue-800 text-sm">
                                            <strong>Modo de visualização:</strong> Este formato de arquivo é somente leitura. 
                                            Para edição, faça o download e use o software apropriado.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default DocumentViewerModal;
