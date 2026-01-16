import Button from "../Button";
import ButtonsLogaut from "../ButtonsLogout";
import { Link, useNavigate } from "react-router-dom";
import { Trans, useTranslation } from "react-i18next";
import { api as useApi } from "../../../../services/api";
import { useState } from "react";
import Loading from "../../../../services/Loading";

export default function Form() {
  const { api, loading } = useApi();

  const { t } = useTranslation();
  const stripHtml = (html: any) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
  };

  const captchaText = t("capatcha_text");
  const strippedText = stripHtml(captchaText);
  const navRouter = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await api.post(`v1/auth/login`, {
        email,
        password,
      });

      if (response.status === 200) {
        const userData = response.data;
        console.log('📦 Resposta do login:', userData);

        localStorage.setItem("infosUserLogin", JSON.stringify(userData));

        // Verificar se é colaborador
        if (userData.is_collaborator) {
          console.log('👤 Login de COLABORADOR detectado!');
          console.log('🔐 Permissões:', userData.permissions);
          console.log('🏢 Empresa:', userData.company_id, userData.company_type);

          // Salvar dados adicionais do colaborador
          localStorage.setItem('type_user', userData.company_type);
          localStorage.setItem('userType', 'collaborator');
          localStorage.setItem('collaboratorData', JSON.stringify(userData.user));
          localStorage.setItem('collaboratorPermissions', JSON.stringify(userData.permissions));
          localStorage.setItem('selectedCompanyId', userData.company_id.toString());
        } else {
          console.log('👤 Login de PF/PJ/Freelancer normal');
          localStorage.setItem('userType', 'owner');

          // Se for Freelancer, redirecionar para seleção de ambiente
          // Verifica type_user na raiz ou 'tipo' (retorno do backend: "Freelancer")
          // O backend retorna { ..., type_user: "freelancer" } (check auth.py again? No, it returns "tipo": "Freelancer")
          // Vamos verificar ambos para garantir.

          const isFreelancer =
            userData.tipo === 'Freelancer' ||
            userData.type_user === 'freelancer' ||
            userData.user?.type_user === 'freelancer';

          if (isFreelancer) {
            navRouter('/select-environment');
            return;
          }
        }

        // Todos os usuários vão direto para o GED
        localStorage.setItem('selectedPlatform', 'ged');
        navRouter("/ged");
      }
    } catch (err: any) {
      setError("Email ou senha inválidos.");
      console.error("Erro no login:", err);
    }
  };

  return (
    <>
      {loading && <Loading />}

      <form className="flex flex-col gap-4" onSubmit={login}>
        <h2 className="text-2xl font-bold text-black mb-2">
          <Trans i18nKey="login_title" />
        </h2>

        {error && (
          <div className="bg-red-50 border border-red-500 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <input
          className="p-3 px-4 rounded-md w-full outline-none border-2 border-gray-300 focus:border-red-600 transition-colors"
          type="text"
          placeholder="Email"
          value={email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
        />

        <input
          className="p-3 px-4 rounded-md w-full outline-none border-2 border-gray-300 focus:border-red-600 transition-colors"
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
        />

        <Link className="text-sm text-red-600 hover:text-red-800 font-semibold" to={"/recoverpassword"}>
          <Trans i18nKey="forgot_password" />
        </Link>

        <Button type="submit">
          Acessar
        </Button>

        <ButtonsLogaut />

        <div className="border border-t-1 mt-4 border-gray-300"></div>
        <p className="text-xs text-gray-600 text-center leading-normal">
          {strippedText}
        </p>
      </form>
    </>
  );
}
