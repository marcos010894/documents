import React from 'react';

interface ButtonColors {
  primary: string;
  secondary: string;
  text: string;
}

interface FloatingButtonsProps {
  buttonColors: ButtonColors;
  onSave: () => void;
  onCheckAPI: () => void;
}

const FloatingButtons: React.FC<FloatingButtonsProps> = ({ buttonColors, onSave, onCheckAPI }) => {
  return (
    <div className="fixed bottom-8 right-8 z-50">
      <div className="flex flex-col gap-4">
        <button
          onClick={onSave}
          style={{color: buttonColors.text, backgroundColor: buttonColors.primary}}
          className="px-6 py-3 rounded-lg hover:opacity-90 font-semibold text-sm transition-all duration-200 shadow-lg flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
          Salvar Alterações
        </button>

        <button
          onClick={onCheckAPI}
          style={{color: buttonColors.text, backgroundColor: buttonColors.secondary}}
          className="px-6 py-3 rounded-lg hover:opacity-90 font-semibold text-sm transition-all duration-200 shadow-lg flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          Verificar API
        </button>
      </div>
    </div>
  );
};

export default FloatingButtons; 