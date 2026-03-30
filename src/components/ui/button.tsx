import React from 'react';
import { cn } from '@/lib/utils';

type Variant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
type Size = 'default' | 'sm' | 'lg' | 'icon';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantClasses: Record<Variant, string> = {
  default: 'bg-blue-600 text-white hover:bg-blue-700',
  destructive: 'bg-red-600 text-white hover:bg-red-700',
  outline: 'border border-gray-300 bg-white hover:bg-gray-50',
  secondary: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
  ghost: 'bg-transparent text-gray-800 hover:bg-gray-50',
  link: 'text-blue-600 underline hover:text-blue-700',
};

const sizeClasses: Record<Size, string> = {
  default: 'h-10 px-4 py-2 text-sm',
  sm: 'h-8 px-3 py-1 text-sm',
  lg: 'h-12 px-6 py-3 text-base',
  icon: 'h-10 w-10 p-2',
};

/**
 * A reusable button component with basic variant and size support.  This
 * simplified implementation is based on the more sophisticated
 * class‑variance‑authority version used in the reference UI, but avoids
 * introducing external dependencies.  Additional variants or sizes can
 * be added as required.
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const classes = cn(
      'inline-flex items-center justify-center gap-2 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50',
      variantClasses[variant],
      sizeClasses[size],
      className,
    );
    return <button ref={ref} className={classes} {...props} />;
  },
);

Button.displayName = 'Button';
