import Logo from "../../../../../public/salexpress-logo.png"
import Form from "../../components/Form";
import { useEffect } from "react";
import i18n from 'i18next';
import { useTranslation } from 'react-i18next';



export default function PageLogin() {
  useTranslation();

  useEffect(() => {
    localStorage.clear();
    const handleLanguageChange = () => {
    };

    i18n.on('languageChanged', handleLanguageChange);

    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, []);
  
  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-black via-gray-900 to-red-950">
      <main className="w-full max-w-md mx-4">
        <div className="bg-white rounded-lg shadow-2xl p-8">
          <div className="flex justify-center mb-8">
            <div className="bg-red-600 p-6 rounded-lg">
              <img src={Logo} alt="SalExpress Logo" className="w-48 h-auto" />
            </div>
          </div>
          <Form />
        </div>
      </main>
    </div>
  );
}
