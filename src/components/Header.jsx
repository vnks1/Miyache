import { useState, useEffect } from 'react';
import './Header.css';
import logoSvg from '../assets/logo.svg';

function Header({ isLoggedIn = false }) {
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
              <button className="icon-btn" aria-label="Notifications">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              </button>
              <button className="icon-btn profile-btn" aria-label="Profile">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M20 21a8 8 0 1 0-16 0" />
                </svg>
              </button>
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

