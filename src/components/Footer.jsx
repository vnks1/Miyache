import './Footer.css';
import logoSvg from '../assets/logo.svg';

function Footer() {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-content">
                    <div className="footer-brand">
                        <img src={logoSvg} alt="Miyachi" className="footer-logo" />
                    </div>

                    <nav className="footer-nav">
                        <a href="#">Home</a>
                        <a href="#">Animes</a>
                        <a href="#">Sobre</a>
                        <a href="#">FAQ</a>
                    </nav>

                    <p className="footer-copyright">
                        2024 - Todos os direitos reservados
                    </p>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
