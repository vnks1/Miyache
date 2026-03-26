import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import logoSvg from '../assets/logo.svg';
import { searchMedia } from '../services/api/media.service';

function mapAniListSearchItem(media) {
  return {
    id: media.id,
    title: media.title,
    posterUrl: media.posterUrl || '',
    releaseYear: media.releaseYear,
    synopsis: media.synopsis || '',
    score: media.score,
    source: 'anilist'
  };
}

function Header() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuth, setIsAuth] = useState(false);
  const [searchError, setSearchError] = useState('');
  const debounceTimeout = useRef(null);
  const mobileInputRef = useRef(null);

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const checkAuth = () => setIsAuth(!!localStorage.getItem('token'));
    checkAuth();
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowResults(false);
      setSearchError('');
      return;
    }

    setIsLoading(true);
    setSearchError('');

    debounceTimeout.current = setTimeout(async () => {
      try {
        const results = await searchMedia(searchQuery, 1, 8);
        const mappedResults = (results?.items || []).map(mapAniListSearchItem);
        setSearchResults(mappedResults);
        setShowResults(true);

        if (mappedResults.length === 0) {
          setSearchError('Nenhum anime encontrado.');
        }
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
        setShowResults(false);
        setSearchError('Não foi possível buscar animes agora.');
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [searchQuery]);

  useEffect(() => {
    if (isMobileSearchOpen && mobileInputRef.current) {
      mobileInputRef.current.focus();
    }
  }, [isMobileSearchOpen]);

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
    setSearchError('');
  };

  const handleSelectAnime = (anime) => {
    navigate(`/anime/${encodeURIComponent(anime.title)}`, { state: { title: anime.title } });
    clearSearch();
    setIsMobileSearchOpen(false);
  };

  return (
    <header className={`fixed top-0 left-0 right-0 w-full z-[1000] transition-colors duration-250 ${isScrolled ? 'bg-[#0E0E0E]/95 backdrop-blur-[10px] border-b border-border-color' : 'bg-transparent'}`}>
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-12 xl:px-20 flex items-center justify-between h-[72px] gap-6">
        <div className="flex items-center gap-8">
          <a href="/" className="flex items-center">
            <img src={logoSvg} alt="Miyachi" className="h-8 w-auto" />
          </a>
          <nav className="hidden md:flex gap-6">
            <Link to="/explorar" className="text-sm font-medium text-text-secondary transition-colors duration-150 hover:text-text-primary">Explorar</Link>
          </nav>
        </div>

        <div className="flex-1 flex justify-end md:pr-2">
          <button
            type="button"
            className={`md:hidden inline-flex items-center justify-center w-10 h-10 rounded-full border transition-colors ${isScrolled ? 'border-border-color bg-bg-secondary' : 'border-transparent bg-[#18181B]'} text-text-muted hover:text-text-primary`}
            onClick={() => {
              setIsMobileMenuOpen(false);
              setIsMobileSearchOpen((prev) => {
                const next = !prev;
                if (!next) setShowResults(false);
                return next;
              });
            }}
            aria-label="Pesquisar animes"
            title="Pesquisar"
          >
            <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          </button>

          <div className={`hidden md:flex flex-1 max-w-[800px] py-[10px] px-[19px] items-start gap-2.5 bg-[#18181B] border rounded-full transition-all relative focus-within:border-accent-blue focus-within:ring-2 focus-within:ring-accent-blue/20 ${isScrolled ? 'border-border-color bg-bg-secondary' : 'border-transparent'}`}>
            <svg className="w-[18px] h-[18px] text-text-muted shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Pesquisar animes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchResults.length > 0 && setShowResults(true)}
              className="flex-1 border-none bg-transparent text-text-primary text-sm px-2 outline-none placeholder:text-text-muted"
            />
            {searchQuery && (
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none text-base cursor-pointer text-text-muted px-2 py-1 rounded transition-colors hover:text-text-primary hover:bg-white/10"
                onClick={clearSearch}
                title="Limpar busca"
              >
                x
              </button>
            )}

            {isLoading && <div className="absolute top-full left-0 right-0 mt-2 py-3 px-4 bg-[#18181B] border border-border-color rounded-lg text-center text-text-secondary text-xs animate-pulse">Buscando...</div>}
            {!isLoading && searchError && <div className="absolute top-full left-0 right-0 mt-2 py-3 px-4 bg-[#18181B] border border-border-color rounded-lg text-center text-text-secondary text-xs">{searchError}</div>}

            {showResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#18181B] border border-border-color rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.3)] max-h-[400px] overflow-y-auto z-[1001]">
                {searchResults.map((anime) => (
                  <div
                    key={anime.id}
                    className="flex gap-3 py-2.5 px-3 border-b border-border-color last:border-b-0 cursor-pointer transition-colors items-center hover:bg-white/5"
                    onClick={() => handleSelectAnime(anime)}
                  >
                    <div className="shrink-0 w-[45px] h-[67px] rounded overflow-hidden bg-bg-secondary">
                      {anime.posterUrl ? (
                        <img
                          src={anime.posterUrl}
                          alt={anime.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-bg-hover text-text-muted text-[10px] text-center p-0.5">Sem imagem</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="m-0 text-[13px] font-semibold text-text-primary truncate">{anime.title}</h4>
                      <p className="mt-0.5 mb-0 text-xs text-text-muted">{anime.releaseYear || 'N/A'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-full border border-zinc-200 bg-white text-zinc-800 transition-colors hover:bg-zinc-100"
            onClick={() => {
              setIsMobileSearchOpen(false);
              setShowResults(false);
              setIsMobileMenuOpen((prev) => !prev);
            }}
            aria-label="Abrir menu"
            title="Menu"
          >
            <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18" />
              <path d="M3 12h18" />
              <path d="M3 18h18" />
            </svg>
          </button>

          <div className="hidden md:flex items-center gap-4">
          {isAuth ? (
            <Link to="/profile" className="block w-10 h-10 rounded-full overflow-hidden border-2 border-transparent hover:border-accent-blue transition-colors cursor-pointer">
              <img src="/avatar.png" alt="User Avatar" className="w-full h-full object-cover" />
            </Link>
          ) : (
            <>
              <button onClick={() => navigate('/login')} className="py-2 px-6 rounded-md text-sm font-semibold transition-transform bg-white text-black hover:bg-gray-200 hover:-translate-y-[1px] cursor-pointer">Login</button>
              <Link to="/register" className="hidden md:inline-block text-white text-sm font-medium transition-colors hover:text-gray-300 cursor-pointer">Se cadastre</Link>
            </>
          )}
          </div>
        </div>
      </div>

      {isMobileSearchOpen && (
        <div className="md:hidden max-w-[1440px] mx-auto px-4 pb-3">
          <div className={`flex py-[10px] px-[19px] items-start gap-2.5 bg-[#18181B] border rounded-full transition-all relative focus-within:border-accent-blue focus-within:ring-2 focus-within:ring-accent-blue/20 ${isScrolled ? 'border-border-color bg-bg-secondary' : 'border-transparent'}`}>
            <svg className="w-[18px] h-[18px] text-text-muted shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              ref={mobileInputRef}
              type="text"
              placeholder="Pesquisar animes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchResults.length > 0 && setShowResults(true)}
              className="flex-1 border-none bg-transparent text-text-primary text-sm px-2 outline-none placeholder:text-text-muted"
            />
            {searchQuery && (
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none text-base cursor-pointer text-text-muted px-2 py-1 rounded transition-colors hover:text-text-primary hover:bg-white/10"
                onClick={clearSearch}
                title="Limpar busca"
              >
                x
              </button>
            )}

            {isLoading && <div className="absolute top-full left-0 right-0 mt-2 py-3 px-4 bg-[#18181B] border border-border-color rounded-lg text-center text-text-secondary text-xs animate-pulse">Buscando...</div>}
            {!isLoading && searchError && <div className="absolute top-full left-0 right-0 mt-2 py-3 px-4 bg-[#18181B] border border-border-color rounded-lg text-center text-text-secondary text-xs">{searchError}</div>}

            {showResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#18181B] border border-border-color rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.3)] max-h-[400px] overflow-y-auto z-[1001]">
                {searchResults.map((anime) => (
                  <div
                    key={anime.id}
                    className="flex gap-3 py-2.5 px-3 border-b border-border-color last:border-b-0 cursor-pointer transition-colors items-center hover:bg-white/5"
                    onClick={() => handleSelectAnime(anime)}
                  >
                    <div className="shrink-0 w-[45px] h-[67px] rounded overflow-hidden bg-bg-secondary">
                      {anime.posterUrl ? (
                        <img
                          src={anime.posterUrl}
                          alt={anime.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-bg-hover text-text-muted text-[10px] text-center p-0.5">Sem imagem</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="m-0 text-[13px] font-semibold text-text-primary truncate">{anime.title}</h4>
                      <p className="mt-0.5 mb-0 text-xs text-text-muted">{anime.releaseYear || 'N/A'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {isMobileMenuOpen && (
        <div className="md:hidden max-w-[1440px] mx-auto px-4 pb-3">
          <div className={`rounded-2xl border p-3 ${isScrolled ? 'border-border-color bg-bg-secondary' : 'border-transparent bg-[#18181B]'}`}>
            <div className="flex flex-col gap-2">
              <Link
                to="/explorar"
                className="w-full rounded-lg px-3 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-white/10"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Explorar
              </Link>
              <button
                type="button"
                className="w-full py-2 px-4 rounded-lg text-sm font-semibold bg-white text-black hover:bg-gray-200 transition-colors cursor-pointer text-left"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  navigate('/login');
                }}
              >
                Login
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;
