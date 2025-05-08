import React from 'react';
import { cn } from '@/utils/ui';

export interface ButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outline';
  size?: 'default' | 'sm' | 'lg';
  orientation?: 'horizontal' | 'vertical';
}

export const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(
  ({ className, variant = 'default', size = 'default', orientation = 'horizontal', ...props }, ref) => {
    return (
      <div
        className={cn(
          'inline-flex',
          orientation === 'horizontal' ? 'flex-row' : 'flex-col',
          variant === 'outline' ? 'border rounded-md' : '',
          size === 'sm' ? 'gap-1 p-1' : size === 'lg' ? 'gap-2 p-2' : 'gap-1 p-1',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

ButtonGroup.displayName = 'ButtonGroup';