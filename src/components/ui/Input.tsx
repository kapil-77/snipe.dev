import { forwardRef, useId, type InputHTMLAttributes } from 'react';

import { cn } from '@/lib/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  invalid?: boolean;
}

/**
 * Square-cornered terminal-style input. Figtree only, accent caret.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, invalid, className, id, required, ...props },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-faint">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={cn(
          'h-10 w-full border border-edge bg-abyss px-3 text-sm text-ink caret-accent',
          'placeholder:text-faint/70 focus:border-accent/70 focus:outline-none focus:ring-2 focus:ring-accent/25',
          'transition-[border-color,box-shadow] duration-200 ease-out',
          invalid && 'border-warning/70 focus:border-warning/70 focus:ring-warning/25',
          className,
        )}
        {...props}
      />
      {hint && <p className={cn('mt-1.5 text-xs text-faint', invalid && 'text-warning')}>{hint}</p>}
    </div>
  );
});