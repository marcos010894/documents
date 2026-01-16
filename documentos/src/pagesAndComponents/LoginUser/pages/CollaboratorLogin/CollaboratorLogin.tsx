import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { collaboratorsApi } from '../../../../services/collaboratorsApi';
import Logo from "../../../../../public/salexpress-logo.png";

const CollaboratorLogin: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!formData.email || !formData.password) {
            setError('Preencha todos os campos');
            return;
        }

        try {
            setLoading(true);
            const response = await collaboratorsApi.loginCollaborator(formData);

            console.log('🔐 Resposta do login:', response);

            // Verificar se é realmente um colaborador
            if (!response.is_collaborator) {
                setError('Este email não pertence a um colaborador. Use o login normal.');
                return;
            }

            // Salvar dados do colaborador no localStorage
            // Estrutura similar ao login normal para compatibilidade
            const loginData = {
                message: response.message,
                status: response.status,
                user: response.user,
                permissions: response.permissions,
                tipo: response.tipo,
                company_id: response.company_id,
                company_type: response.company_type,
                is_collaborator: true
            };

            localStorage.setItem('infosUserLogin', JSON.stringify(loginData));
            localStorage.setItem('type_user', response.company_type);
            localStorage.setItem('userType', 'collaborator'); // Flag adicional
            localStorage.setItem('collaboratorData', JSON.stringify(response.user));
            localStorage.setItem('collaboratorPermissions', JSON.stringify(response.permissions));
            localStorage.setItem('selectedCompanyId', response.company_id.toString());
            
            // Token (se vier na resposta futura)
            if (response.user.id) {
                localStorage.setItem('token', `collaborator-${response.user.id}`);
            }

            console.log('✅ Dados salvos no localStorage');
            console.log('👤 Usuário:', response.user);
            console.log('🔐 Permissões:', response.permissions);
            console.log('🏢 Empresa:', response.company_id, response.company_type);

            // Redirecionar para o painel GED
            navigate('/ged');
        } catch (err: any) {
            setError(err.message || 'Erro ao fazer login. Verifique suas credenciais.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen flex justify-center items-center bg-gradient-to-br from-black via-gray-900 to-red-950">
            <main className="grid grid-cols-1 md:grid-cols-2 max-w-6xl w-full shadow-2xl rounded-2xl overflow-hidden bg-white">
                {/* Lado esquerdo - Informações */}
                <div className="hidden md:flex flex-col items-start justify-center bg-gradient-to-br from-purple-500 to-purple-700 p-12 relative">
                    <div className="absolute top-6 right-6">
                        <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                            <Shield className="h-6 w-6 text-white" />
                        </div>
                    </div>

                    <img src={Logo} style={{ width: "200px" }} alt="Logo Salexpress" className="mb-8" />
                    
                    <h1 className="text-4xl font-bold text-white mb-4">
                        Área do Colaborador
                    </h1>
                    <p className="text-lg text-purple-100 mb-6">
                        Acesse o sistema com suas credenciais de colaborador para gerenciar documentos e recursos da empresa.
                    </p>

                    <div className="space-y-4 w-full">
                        <div className="flex items-start gap-3 text-white">
                            <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0 mt-1">
                                <Shield className="h-4 w-4" />
                            </div>
                            <div>
                                <h3 className="font-semibold mb-1">Permissões Específicas</h3>
                                <p className="text-sm text-purple-100">Acesse apenas os recursos permitidos pela empresa</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 text-white">
                            <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0 mt-1">
                                <Mail className="h-4 w-4" />
                            </div>
                            <div>
                                <h3 className="font-semibold mb-1">Login Individual</h3>
                                <p className="text-sm text-purple-100">Cada colaborador possui seu próprio acesso</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 text-white">
                            <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0 mt-1">
                                <Lock className="h-4 w-4" />
                            </div>
                            <div>
                                <h3 className="font-semibold mb-1">Segurança</h3>
                                <p className="text-sm text-purple-100">Suas ações são rastreadas e protegidas</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Lado direito - Formulário */}
                <div className="p-12 flex flex-col justify-center">
                    <div className="mb-8">
                        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center mb-4">
                            <Shield className="h-8 w-8 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">
                            Login de Colaborador
                        </h2>
                        <p className="text-gray-600">
                            Entre com suas credenciais fornecidas pela empresa
                        </p>
                    </div>

                    {/* Mensagem de erro */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 animate-shake">
                            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                    placeholder="colaborador@empresa.com"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {/* Senha */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Senha
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                    placeholder="••••••••"
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Botão de submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-gradient-to-r from-purple-500 to-purple-700 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-purple-800 focus:ring-4 focus:ring-purple-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Entrando...
                                </>
                            ) : (
                                <>
                                    <Shield className="h-5 w-5" />
                                    Entrar como Colaborador
                                </>
                            )}
                        </button>
                    </form>

                    {/* Links adicionais */}
                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <p className="text-sm text-gray-600 text-center">
                            Não é colaborador?{' '}
                            <Link 
                                to="/login" 
                                className="text-purple-600 hover:text-purple-700 font-semibold"
                            >
                                Login de Usuário Normal
                            </Link>
                        </p>
                        <p className="text-xs text-gray-500 text-center mt-4">
                            Se você esqueceu sua senha, entre em contato com o administrador da empresa.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CollaboratorLogin;
