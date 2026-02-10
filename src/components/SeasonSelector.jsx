import { useState, useRef, useEffect } from 'react';

function SeasonSelector({ seasons, selectedSeason, onSeasonChange }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(e) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={dropdownRef} style={{ position: 'relative' }}>
            <div
                className="inline-flex justify-center items-center gap-2 rounded-full border border-zinc-100"
                style={{ padding: '8px 16px', cursor: 'pointer' }}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span style={{ color: '#fff', fontSize: '14px', fontWeight: 500 }}>
                    Temporada {selectedSeason}
                </span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#fff', flexShrink: 0, transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                    <path d="m6 9 6 6 6-6" />
                </svg>
            </div>

            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 4px)',
                    left: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    padding: '8px 0',
                    minWidth: '100%',
                    zIndex: 50,
                    backgroundColor: '#18181b',
                    border: '1px solid #3f3f46',
                    borderRadius: '8px',
                }}>
                    {seasons.map((season) => (
                        <div
                            key={season.season_number}
                            onClick={() => {
                                onSeasonChange(season.season_number);
                                setIsOpen(false);
                            }}
                            style={{
                                color: season.season_number === selectedSeason ? '#fff' : 'rgba(255,255,255,0.6)',
                                fontSize: '14px',
                                fontWeight: season.season_number === selectedSeason ? 600 : 400,
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                padding: '4px 16px',
                            }}
                            onMouseEnter={(e) => e.target.style.color = '#fff'}
                            onMouseLeave={(e) => {
                                if (season.season_number !== selectedSeason) {
                                    e.target.style.color = 'rgba(255,255,255,0.6)';
                                }
                            }}
                        >
                            Temporada {season.season_number}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default SeasonSelector;
