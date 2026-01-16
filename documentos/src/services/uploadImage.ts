import { toast } from 'react-toastify';
import { AxiosInstance } from 'axios';

export const uploadImage = async (file: File, axiosInstance: AxiosInstance): Promise<string> => {
  // Verificações iniciais
  if (!file) {
    toast.error("Nenhum arquivo selecionado.");
    throw new Error("Nenhum arquivo selecionado.");
  }

  // Tipos de arquivo permitidos
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  
  if (!validTypes.includes(file.type)) {
    toast.error(`Formato não suportado. Use: JPEG, PNG, GIF ou WebP`);
    throw new Error("Tipo de arquivo não suportado");
  }

  // Tamanho máximo (5MB)
  const MAX_SIZE = 5 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    toast.error(`Tamanho máximo permitido: ${MAX_SIZE / (1024 * 1024)}MB`);
    throw new Error("Arquivo muito grande");
  }

  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await axiosInstance.post("/v1/Imagens/images/link", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        "accept": "application/json"
      },
    });

    if (response.data?.link) {
      return response.data.link;
    }

    throw new Error("Resposta da API não contém link da imagem");

  } catch (error: any) {
    console.error("Erro no upload:", error);
    
    if (error.response?.data?.detail) {
      const errors = error.response.data.detail;
      const errorMessages = errors.map((err: any) => err.msg).join(', ');
      
      toast.error(`Erros de validação: ${errorMessages}`);
      throw new Error(errorMessages);
    }

    const errorMessage = error.response?.data?.message || 
                        error.message || 
                        "Erro ao enviar imagem";
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
}; 