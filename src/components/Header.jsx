import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css';
import logoSvg from '../assets/logo.svg';

function Header({ isLoggedIn = false }) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`header ${isScrolled ? 'header-scrolled' : ''}`}>
      <div className="header-container container">
        <div className="header-left">
          <a href="/" className="logo">
            <img src={logoSvg} alt="Miyachi" className="logo-img" />
          </a>
          <nav className="nav">
            <a href="#populares" className="nav-link">Populares</a>
            <a href="#explorar" className="nav-link">Explorar</a>
          </nav>
        </div>

        <div className="header-center">
          <div className={`search-bar ${isScrolled ? 'search-bar-scrolled' : ''}`}>
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Pesquisar animes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <div className="header-right">
          {isLoggedIn ? (
            <>
              <button
                onClick={() => navigate('/login')}
                style={{ backgroundColor: '#fff', color: '#000', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: 500, cursor: 'pointer' }}
              >
                Login
              </button>
              <button style={{ backgroundColor: '#27272a', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: 500, cursor: 'pointer' }}>Criar conta</button>
            </>
          ) : (
            <>
              <button className="btn btn-primary">Login</button>
              <a href="#" className="nav-link signup-link">Se cadastre</a>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;

