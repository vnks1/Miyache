import './Hero.css';
import headerBg from '../assets/header.png';

function Hero({ anime }) {
    return (
        <section className="hero">
            <div className="hero-backdrop">
                <img src={headerBg} alt="" className="hero-backdrop-image" />
                <div className="hero-backdrop-overlay" />
            </div>

            <div className="hero-content container">
                <div className="hero-info">
                    <div className="hero-week-highlight">DESTAQUE DA SEMANA</div>
                    <h1 className="hero-title">{anime.title}</h1>
                    <p className="hero-description">{anime.description}</p>

                    <div className="hero-actions">
                        <button className="btn btn-watch">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <polygon points="5 3 19 12 5 21 5 3" />
                            </svg>
                            Assistir
                        </button>
                        <button className="btn btn-save">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 5v14M5 12h14" />
                            </svg>
                            Salvar
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Hero;
