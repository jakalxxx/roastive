import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground hover:opacity-90',
        secondary: 'bg-secondary text-secondary-foreground hover:opacity-90 border border-border',
        neutral: 'bg-neutral text-neutral-foreground hover:opacity-90 border border-border',
      },
    },
    defaultVariants: { variant: 'primary' },
  }
);

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>;

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant, ...props }, ref) => {
    return <button ref={ref} className={twMerge(buttonVariants({ variant }), className)} {...props} />;
  }
);

Button.displayName = 'Button';

