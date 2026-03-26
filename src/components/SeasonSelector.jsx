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
        <div ref={dropdownRef} className="relative">
            <div
                className="inline-flex justify-center items-center gap-2 rounded-full border border-zinc-100 px-4 py-2 cursor-pointer transition-colors hover:bg-white/10"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="text-white text-sm font-medium">
                    Temporada {selectedSeason}
                </span>
                <svg className={`text-white shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : 'rotate-0'}`} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m6 9 6 6 6-6" />
                </svg>
            </div>

            {isOpen && (
                <div className="absolute top-[calc(100%+4px)] left-0 flex flex-col gap-2 py-2 min-w-full z-50 bg-[#18181b] border border-[#3f3f46] rounded-lg shadow-lg">
                    {seasons.map((season) => (
                        <div
                            key={season.season_number}
                            onClick={() => {
                                onSeasonChange(season.season_number);
                                setIsOpen(false);
                            }}
                            className={`text-sm cursor-pointer whitespace-nowrap px-4 py-1 transition-colors hover:text-white ${season.season_number === selectedSeason ? 'text-white font-semibold' : 'text-white/60 font-normal'}`}
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
