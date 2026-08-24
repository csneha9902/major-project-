import { forwardRef } from 'react';

/**
 * Reusable glassmorphic card with 3D hover tilt and glow border.
 * @param {'cyan' | 'violet' | 'blue' | 'none'} glow - Glow color on hover
 * @param {string} className - Additional classes
 * @param {boolean} noPadding - Skip default padding
 */
const GlassCard = forwardRef(function GlassCard(
  { children, glow = 'cyan', className = '', noPadding = false, ...props },
  ref
) {
  const glowClass = glow === 'cyan'
    ? 'glass-card-cyan'
    : glow === 'violet'
    ? 'glass-card-violet'
    : '';

  return (
    <div
      ref={ref}
      className={`glass-card ${glowClass} ${noPadding ? '' : 'p-6'} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

export default GlassCard;
