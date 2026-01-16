import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '../utils/cropUtils';
import { Area } from 'react-easy-crop';
import { Plus, Minus } from 'lucide-react'; 
interface Props {
  imageSrc: string;
  onCancel: () => void;
  onComplete: (croppedImage: string) => void;
}
export const ImageCropper: React.FC<Props> = ({ imageSrc, onCancel, onComplete }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropComplete = useCallback((_: any, croppedArea: Area) => {
    setCroppedAreaPixels(croppedArea);
  }, []);

  const handleCrop = async () => {
    if (croppedAreaPixels) {
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
      onComplete(croppedImage);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-80">
      <div className="relative w-[800px] h-[400px] bg-white rounded-xl overflow-hidden shadow-lg">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={1}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
        />
      </div>

      {/* Zoom control */}
      <div className="flex items-center mt-4 gap-4">
        <button onClick={() => setZoom((z) => Math.max(z - 0.1, 1))} className="p-2 bg-gray-200 rounded-full shadow">
          <Minus size={16} />
        </button>
        <input
          type="range"
          min={1}
          max={3}
          step={0.01}
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          className="w-64"
        />
        <button onClick={() => setZoom((z) => Math.min(z + 0.1, 3))} className="p-2 bg-gray-200 rounded-full shadow">
          <Plus size={16} />
        </button>
      </div>

      <div className="mt-4 flex gap-4">
        <button
          onClick={handleCrop}
          className="bg-red-600 text-white-light text-base rounded-lg p-[0.625rem] flex items-center gap-2 shadow-lg hover:brightness-110 transition"
        >
          Confirmar
        </button>
        <button
          onClick={onCancel}
          className="bg-gray-normal  text-base rounded-lg p-[0.625rem] flex items-center gap-2 shadow-lg hover:brightness-110 transition"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
};
