import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import loginBg from '../assets/loginpage.png';
import logo from '../assets/logo.svg';
import { authService } from '../services/api.js';

function LoginPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setLoading(true);

        try {
            const res = await authService.login(email, password);
            if (res?.success && res.data?.accessToken) {
                localStorage.setItem('token', res.data.accessToken);
                window.dispatchEvent(new Event('storage'));
                // Optionally save user info in state/context
                navigate('/');
            } else {
                setErrorMsg(res?.message || 'Erro ao entrar');
            }
        } catch (err) {
            setErrorMsg(err.response?.data?.message || 'Erro de conexão');
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="flex min-h-screen w-full flex-col md:flex-row">
            {/* Left Side - Form */}
            <div className="flex-1 flex justify-center items-center bg-white p-6 md:p-8">
                <div className="w-full max-w-[400px]">
                    <Link to="/" className="inline-flex items-center justify-center p-3 rounded-full shadow-sm text-zinc-500 hover:text-black mb-6 transition-all hover:bg-zinc-50 bg-white border border-zinc-100 w-fit cursor-pointer">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m15 18-6-6 6-6"/>
                        </svg>
                    </Link>
                    <h1 className="text-[32px] font-bold text-black mb-2">Acesse sua conta</h1>
                    <p className="text-base text-zinc-500 mb-8">Entre na sua conta para começar.</p>

                    <form onSubmit={handleLogin}>
                        {errorMsg && <div className="mb-4 text-red-500 text-sm font-semibold">{errorMsg}</div>}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-black mb-2">E-mail</label>
                            <div className="relative flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 text-zinc-500 w-5 h-5">
                                    <rect width="20" height="16" x="2" y="4" rx="2" />
                                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                                </svg>
                                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full py-3 pr-4 pl-10 rounded-lg border border-zinc-200 bg-zinc-100 text-sm text-black outline-none transition-all duration-200 focus:border-black focus:bg-white" placeholder="seu@email.com" />
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-black mb-2">Senha</label>
                            <div className="relative flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 text-zinc-500 w-5 h-5">
                                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                </svg>
                                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full py-3 pr-4 pl-10 rounded-lg border border-zinc-200 bg-zinc-100 text-sm text-black outline-none transition-all duration-200 focus:border-black focus:bg-white" placeholder="••••••••" />
                            </div>
                        </div>

                        <a href="#" className="block text-right text-xs text-zinc-500 underline mt-2 mb-6">Esqueceu sua senha?</a>

                        <button type="submit" disabled={loading} className="w-full bg-black text-white font-semibold p-3.5 rounded-xl border-none cursor-pointer text-base transition-colors duration-200 hover:bg-zinc-800 disabled:opacity-70 disabled:cursor-not-allowed">
                            {loading ? 'Entrando...' : 'Entrar'}
                        </button>
                    </form>

                    <div className="text-center mt-6 text-sm text-black">
                        Não tem uma conta? <Link to="/register" className="font-bold no-underline text-black ml-1">Crie agora</Link>
                    </div>
                </div>
            </div>

            {/* Right Side - Image */}
            <div className="hidden md:flex flex-1 relative bg-cover bg-center bg-no-repeat flex-col justify-between items-end p-10" style={{ backgroundImage: `url(${loginBg})` }}>
                <img src={logo} alt="Miyachi" className="self-end w-[120px]" />

                <h2 className="text-white text-[48px] font-bold leading-[1.1] max-w-[400px] text-right">
                    Todos <span className="font-normal block">os animes</span>
                    Em um <span className="font-extrabold block">lugar.</span>
                </h2>
            </div>
        </div>
    );
}

export default LoginPage;
