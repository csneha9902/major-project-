/**
 * Button component with theme-harmonized gradient glows.
 * @param {'cyan' | 'violet' | 'blue' | 'danger' | 'success' | 'warning' | 'ghost'} variant
 */
export default function GlowButton({
  children,
  variant = 'cyan',
  className = '',
  disabled = false,
  ...props
}) {
  const baseClasses = `
    relative inline-flex items-center justify-center gap-2
    px-5 py-2.5 rounded-xl font-heading font-semibold text-sm
    transition-all duration-300 ease-out
    disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none
    cursor-pointer
  `;

  const variantStyles = {
    cyan: `
      bg-gradient-to-r from-[#16A34A] to-[#15803D]
      text-white
      hover:shadow-[0_0_20px_rgba(22,163,74,0.4),0_0_40px_rgba(22,163,74,0.15)]
      hover:-translate-y-0.5
      active:translate-y-0
    `,
    violet: `
      bg-gradient-to-r from-[#15803D] to-[#14532D]
      text-white
      hover:shadow-[0_0_20px_rgba(20,83,45,0.4),0_0_40px_rgba(20,83,45,0.15)]
      hover:-translate-y-0.5
      active:translate-y-0
    `,
    blue: `
      bg-gradient-to-r from-[#059669] to-[#047857]
      text-white
      hover:shadow-[0_0_20px_rgba(5,150,105,0.4),0_0_40px_rgba(5,150,105,0.15)]
      hover:-translate-y-0.5
      active:translate-y-0
    `,
    danger: `
      bg-gradient-to-r from-[#ef4444] to-[#dc2626]
      text-white
      hover:shadow-[0_0_20px_rgba(239,68,68,0.4),0_0_40px_rgba(239,68,68,0.15)]
      hover:-translate-y-0.5
      active:translate-y-0
    `,
    success: `
      bg-gradient-to-r from-[#22C55E] to-[#16A34A]
      text-white
      hover:shadow-[0_0_20px_rgba(34,197,94,0.4),0_0_40px_rgba(34,197,94,0.15)]
      hover:-translate-y-0.5
      active:translate-y-0
    `,
    warning: `
      bg-gradient-to-r from-[#f59e0b] to-[#d97706]
      text-white
      hover:shadow-[0_0_20px_rgba(245,158,11,0.4),0_0_40px_rgba(245,158,11,0.15)]
      hover:-translate-y-0.5
      active:translate-y-0
    `,
    ghost: `
      bg-white/70 border border-[rgba(34,197,94,0.25)]
      text-[#166534]
      hover:bg-emerald-50 hover:text-[#14532D]
      hover:border-[rgba(34,197,94,0.5)]
      hover:-translate-y-0.5
      active:translate-y-0
    `,
  };

  return (
    <button
      className={`${baseClasses} ${variantStyles[variant] || variantStyles.cyan} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
