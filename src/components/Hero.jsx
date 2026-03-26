import headerBg from '../assets/header.png';

function Hero({ anime }) {
    const titleLines = (anime.title || '').split(' - ');
    const heroImage = anime.image || headerBg;

    return (
        <section className="relative min-h-[620px] flex items-end py-12 mt-[72px] overflow-hidden max-md:min-h-[540px] max-md:py-8">
            <div className="absolute inset-0 z-[-1]">
                <img src={heroImage} alt="" className="w-full h-full object-cover object-center blur-[1px] scale-105" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_30%,rgba(255,255,255,0.08),transparent_22%),radial-gradient(circle_at_80%_35%,rgba(96,165,250,0.24),transparent_26%),linear-gradient(to_right,rgba(10,10,12,0.98)_0%,rgba(10,10,12,0.78)_34%,rgba(10,10,12,0.45)_62%,rgba(10,10,12,0.28)_100%),linear-gradient(to_top,rgba(10,10,12,1)_0%,rgba(10,10,12,0.5)_32%,rgba(10,10,12,0)_62%)]" />
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22%3E%3Cg fill=%22none%22 fill-opacity=%220.18%22%3E%3Ccircle cx=%224%22 cy=%224%22 r=%221.2%22 fill=%22white%22/%3E%3Ccircle cx=%2234%22 cy=%2218%22 r=%221%22 fill=%22white%22/%3E%3Ccircle cx=%2248%22 cy=%2244%22 r=%221.1%22 fill=%22white%22/%3E%3C/g%3E%3C/svg%3E')] opacity-[0.22]" />
            </div>

            <div className="relative z-10 w-full max-w-[1440px] mx-auto px-4 md:px-6 lg:px-12 xl:px-20">
                <div className="max-w-[560px]">
                    <div className="inline-flex items-center gap-3 mb-4 px-3 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm">
                        <span className="text-[#a1a1aa] text-[11px] font-bold tracking-[3px] uppercase">Destaque da semana</span>
                    </div>
                    <h1 className="text-[clamp(2.2rem,4vw,4.25rem)] font-extrabold leading-[0.95] mb-5 drop-shadow-[0_2px_20px_rgba(0,0,0,0.55)] text-text-primary max-md:tracking-[-0.02em]">
                        {titleLines.map((line) => (
                            <span key={line} className="block">{line}</span>
                        ))}
                    </h1>
                    <p className="text-[0.96rem] text-text-secondary leading-[1.75] mb-8 line-clamp-4 max-w-[52ch] max-md:text-[0.9rem]">
                        {anime.description}
                    </p>

                    <div className="flex gap-4 max-sm:flex-col">
                        <button className="flex items-center gap-2 px-6 py-3 bg-text-primary text-bg-primary rounded-md font-semibold text-[0.9rem] transition-all duration-200 hover:bg-[#e0e0e0] hover:scale-[1.02] max-sm:w-full max-sm:justify-center">
                            <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                            Marcar como assistido
                        </button>
                        <button className="flex items-center gap-2 px-6 py-3 bg-transparent text-text-primary border border-white/30 rounded-md font-semibold text-[0.9rem] transition-all duration-200 hover:bg-white/10 hover:border-white/50 max-sm:w-full max-sm:justify-center">
                            <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
                                <line x1="12" y1="7" x2="12" y2="13" />
                                <line x1="15" y1="10" x2="9" y2="10" />
                            </svg>
                            Adicionar a lista
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Hero;
