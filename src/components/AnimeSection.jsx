import AnimeCard from './AnimeCard';

function AnimeSection({ title, animes, showProgress = false }) {
    return (
        <section className="py-8">
            <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-12 xl:px-20">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl max-sm:text-base font-bold text-text-primary">{title}</h2>

                </div>
            </div>

            <div className="grid grid-cols-[repeat(4,290px)] max-xl:grid-cols-3 max-md:grid-cols-2 max-sm:grid-cols-2 gap-8 max-md:gap-4 max-sm:gap-2 max-w-[1440px] mx-auto px-4 md:px-6 lg:px-12 xl:px-20 justify-between">
                {animes.map((anime) => (
                    <AnimeCard key={anime.id} anime={anime} showProgress={showProgress} />
                ))}
            </div>
        </section>
    );
}

export default AnimeSection;
