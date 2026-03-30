import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

/**
 * A simple input component that applies consistent styling to form
 * fields throughout the app.  Accepts all native input props and
 * forwards the ref for form libraries.
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100',
          className,
        )}
        {...props}
      />
    );
  },
);

Input.displayName = 'Input';
