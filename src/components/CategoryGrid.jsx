import './CategoryGrid.css';

function CategoryGrid({ categories }) {
    return (
        <section className="category-section" id="explorar">
            <div className="container">
                <h2 className="section-title">Gêneros</h2>

                <div className="category-grid">
                    {categories.map((category) => (
                        <a href="#" key={category.id} className="category-card">
                            <img src={category.image} alt={category.name} className="category-image" />
                            <div className="category-overlay" />
                            <span className="category-name">{category.name}</span>
                        </a>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default CategoryGrid;
