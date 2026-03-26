const baseStyles = "inline-block px-4 py-1.5 rounded-full text-xs font-semibold capitalize tracking-[0.3px]";

const variantStyles = {
    default: "bg-white/10 text-white",
    status: "bg-blue-500 text-white",
    type: "bg-white/15 text-[#e5e5e5]",
    primary: "bg-[#0052FF] text-white",
    outlined: "bg-transparent text-white border border-white/30"
};

function Badge({ children, variant = 'default' }) {
    const className = `${baseStyles} ${variantStyles[variant] || variantStyles.default}`;
    return (
        <span className={className}>
            {children}
        </span>
    );
}

export default Badge;
