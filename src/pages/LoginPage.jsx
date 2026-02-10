import { Link } from 'react-router-dom';
import './LoginPage.css';
import loginBg from '../assets/loginpage.png';
import logo from '../assets/logo.svg';

function LoginPage() {
    return (
        <div className="login-container">
            {/* Left Side - Form */}
            <div className="login-left">
                <div className="login-form-wrapper">
                    <h1 className="login-title">Acesse sua conta</h1>
                    <p className="login-subtitle">Entre na sua conta para começar.</p>

                    <form>
                        <div className="form-group">
                            <label className="form-label">E-mail</label>
                            <div className="input-wrapper">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="input-icon">
                                    <rect width="20" height="16" x="2" y="4" rx="2" />
                                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                                </svg>
                                <input type="email" className="form-input" placeholder="seu@email.com" />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Senha</label>
                            <div className="input-wrapper">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="input-icon">
                                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                </svg>
                                <input type="password" className="form-input" placeholder="••••••••" />
                            </div>
                        </div>

                        <a href="#" className="forgot-password">Esqueceu sua senha?</a>

                        <button type="button" className="login-btn">
                            Entrar
                        </button>
                    </form>

                    <div className="signup-text">
                        Não tem uma conta? <a href="#" className="signup-link">Crie agora</a>
                    </div>
                </div>
            </div>

            {/* Right Side - Image */}
            <div className="login-right" style={{ backgroundImage: `url(${loginBg})` }}>
                <img src={logo} alt="Miyachi" className="login-logo" />

                <h2 className="login-quote">
                    Todos <span style={{ fontWeight: 400 }}>os animes</span><br />
                    Em um <span style={{ fontWeight: 800 }}>lugar.</span>
                </h2>
            </div>
        </div>
    );
}

export default LoginPage;
