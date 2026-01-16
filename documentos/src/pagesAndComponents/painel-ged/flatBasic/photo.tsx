import React, { useEffect, useRef, useState } from 'react';
import { ImageCropper } from './components/ImagerCropper';
import { FaCamera } from 'react-icons/fa';
import { api as useApi } from "../../../services/api";

interface UserInfo {
  id?: number;
  tipo_conta?: string
  nome?: string;
  email?: string;
  descricaoServico?: string;
  profileImage?: string;
}

export default function EditProfile() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    descricaoServico: '',
    id: 0,
    tipo_conta: ''
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [tempImage, setTempImage] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [planPhotoUrl, setPlanPhotoUrl] = useState<string | null>(null);
  const { api } = useApi();
  const [photoSave, setPhotoSave] = useState(false);
  useEffect(() => {
    loadUserData();
    const interval = setInterval(loadUserData, 1000);

    const fetchPlanPhoto = async () => {
      try {
        const response = await api.get(`v1/Photos/photo/plan?id_user=${formData.id}&type_user=${formData.tipo_conta}`);
        if (response?.data) {
          console.log(response.data)
          setPlanPhotoUrl(response.data[0].urlPhoto);
          setPhotoSave(true)
          setImagePreview(response.data[0].urlPhoto)
          setTempImage(response.data[0].urlPhoto)
        } else {
          setPlanPhotoUrl("https://cdn.Salexpress.com/default-photo.jpg");
        }
      } catch (err) {
        console.warn("Foto do plano não encontrada. Usando imagem padrão.");
        setPlanPhotoUrl("https://cdn.Salexpress.com/default-photo.jpg");
      }
    };

    fetchPlanPhoto();
    return () => clearInterval(interval);
  }, [planPhotoUrl]);
  const userInfo: { user?: UserInfo } = JSON.parse(localStorage.getItem('infosUserLogin') || '{}');

  const loadUserData = () => {
    const user = localStorage.getItem('infosUserLogin');
    if (user) {
      const info: { user?: UserInfo } = JSON.parse(user);
      setFormData({
        nome: info.user?.nome || '',
        id: info.user?.id || 0,
        tipo_conta: info.user?.tipo_conta || '',
        email: info.user?.email || '',
        descricaoServico: info.user?.descricaoServico || '',
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setTempImage(reader.result as string);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = async (croppedImageBase64: string) => {
    setImagePreview(croppedImageBase64);
    setShowCropper(false);

    // Salva no localStorage
    const userDataStr = localStorage.getItem('infosUserLogin');
    if (userDataStr) {
      const userData = JSON.parse(userDataStr);
      if (!userData.user) userData.user = {};
      userData.user.profileImage = croppedImageBase64;
      localStorage.setItem('infosUserLogin', JSON.stringify(userData));
    }

    try {
      const blob = await (await fetch(croppedImageBase64)).blob();
      const data = new FormData();
      data.append('file', new File([blob], 'avatar.jpg', { type: blob.type }));

      const id_user = userInfo.user?.id?.toString() || '';
      const type_user = userInfo.user?.tipo_conta || '';
      const typePlan = 'MKTBASIC';
      const urlPhoto = 'avatar.jpg';

      const queryString = new URLSearchParams({
        id_user,
        type_user,
        typePlan,
        urlPhoto
      }).toString();

      const endpoint = `/v1/Photos/photo/plan?${queryString}`;

      if (photoSave) {
        await api.delete(`v1/Photos/photo/plan?id_user=${id_user}&type_user=${type_user}`)
        await api.post(endpoint, data, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        await api.post(endpoint, data, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        setPhotoSave(true)
      }


      console.log('Upload com sucesso!');
    } catch (error) {
      console.error('Erro ao enviar imagem:', error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 bg-white rounded-xl sm:rounded-2xl shadow-md sm:shadow-lg mt-6 sm:mt-12 border border-gray-200 flex flex-col sm:flex-row items-center gap-6 sm:gap-8 md:gap-12 min-h-[200px] sm:min-h-[300px]">
      {/* Foto com botão - agora centralizado em mobile */}
      <div className="relative w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 flex-shrink-0">
        <img
          src={imagePreview || '/default-avatar.png'}
          alt="Foto de perfil"
          className="rounded-full w-full h-full object-cover border-2 border-gray-200"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="absolute bottom-2 right-2 bg-white border border-gray-300 p-2 rounded-full hover:bg-gray-100 transition shadow-sm hover:shadow-md"
          aria-label="Alterar foto"
        >
          <FaCamera className="text-gray-700 text-sm sm:text-base" />
        </button>
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Dados do usuário - agora centralizado em mobile */}
      <div className="flex flex-col gap-2 sm:gap-3 text-center sm:text-left px-4 sm:px-0">
        <p className="text-xl sm:text-2xl font-semibold text-gray-800 break-words">
          {formData.nome || 'Nome não informado'}
        </p>
        <p className="text-gray-600 text-sm sm:text-base break-all">
          {formData.email || 'E-mail não informado'}
        </p>
        <p className="text-sm text-gray-600 italic mt-2 sm:mt-0 max-w-prose">
          {formData.descricaoServico || 'Nenhuma descrição disponível'}
        </p>
      </div>

      {/* Cropper */}
      {showCropper && tempImage && (
        <ImageCropper
          imageSrc={tempImage}
          onCancel={() => setShowCropper(false)}
          onComplete={handleCropComplete}
        />
      )}

    </div>

  );
}
