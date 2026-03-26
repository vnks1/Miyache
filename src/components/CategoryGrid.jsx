function CategoryGrid({ categories }) {
    return (
        <section className="py-12" id="explorar">
            <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-12 xl:px-20">
                <h2 className="text-xl font-bold text-text-primary mb-6">Gêneros</h2>

                <div className="grid grid-cols-4 max-lg:grid-cols-3 max-md:grid-cols-2 max-sm:grid-cols-1 gap-4">
                    {categories.map((category) => (
                        <a href="#" key={category.id} className="relative aspect-video rounded-lg overflow-hidden cursor-pointer group">
                            <img src={category.image} alt={category.name} className="w-full h-full object-cover transition-transform duration-250 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.2)_0%,rgba(0,0,0,0.6)_100%)] transition-colors duration-150 group-hover:bg-[linear-gradient(to_bottom,rgba(59,130,246,0.2)_0%,rgba(59,130,246,0.5)_100%)]" />
                            <span className="absolute bottom-4 left-4 right-4 text-[1.1rem] max-sm:text-base font-bold text-text-primary drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">{category.name}</span>
                        </a>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default CategoryGrid;
