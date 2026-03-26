import logoSvg from '../assets/logo.svg';

function Footer() {
    return (
        <footer className="border-t border-border-color py-12 mt-16">
            <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-12 xl:px-20">
                <div className="flex flex-col items-center gap-6">
                    <div className="flex items-center">
                        <img src={logoSvg} alt="Miyachi" className="h-7 w-auto" />
                    </div>

                    <nav className="flex flex-wrap justify-center gap-4 md:gap-8">
                        <a href="#" className="text-sm text-text-secondary transition-colors hover:text-text-primary">Home</a>
                        <a href="#" className="text-sm text-text-secondary transition-colors hover:text-text-primary">Animes</a>
                        <a href="#" className="text-sm text-text-secondary transition-colors hover:text-text-primary">Sobre</a>
                        <a href="#" className="text-sm text-text-secondary transition-colors hover:text-text-primary">FAQ</a>
                    </nav>

                    <p className="text-xs text-text-muted">
                        2024 - Todos os direitos reservados
                    </p>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
