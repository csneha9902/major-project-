/**
 * Neon-glow button with 3D hover effects.
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
      bg-gradient-to-r from-[#06d6a0] to-[#05b88a]
      text-[#0a0e1a] 
      hover:shadow-[0_0_20px_rgba(6,214,160,0.4),0_0_40px_rgba(6,214,160,0.15)]
      hover:-translate-y-0.5
      active:translate-y-0
    `,
    violet: `
      bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed]
      text-white
      hover:shadow-[0_0_20px_rgba(139,92,246,0.4),0_0_40px_rgba(139,92,246,0.15)]
      hover:-translate-y-0.5
      active:translate-y-0
    `,
    blue: `
      bg-gradient-to-r from-[#3b82f6] to-[#2563eb]
      text-white
      hover:shadow-[0_0_20px_rgba(59,130,246,0.4),0_0_40px_rgba(59,130,246,0.15)]
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
      bg-gradient-to-r from-[#10b981] to-[#059669]
      text-white
      hover:shadow-[0_0_20px_rgba(16,185,129,0.4),0_0_40px_rgba(16,185,129,0.15)]
      hover:-translate-y-0.5
      active:translate-y-0
    `,
    warning: `
      bg-gradient-to-r from-[#f59e0b] to-[#d97706]
      text-[#0a0e1a]
      hover:shadow-[0_0_20px_rgba(245,158,11,0.4),0_0_40px_rgba(245,158,11,0.15)]
      hover:-translate-y-0.5
      active:translate-y-0
    `,
    ghost: `
      bg-transparent border border-[rgba(148,163,184,0.15)]
      text-[var(--text-secondary)]
      hover:bg-[rgba(17,24,39,0.5)] hover:text-[var(--text-primary)]
      hover:border-[rgba(6,214,160,0.3)]
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
