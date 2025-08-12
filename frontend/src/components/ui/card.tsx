import { HTMLAttributes, forwardRef } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`bg-white shadow-lg rounded-lg ${className}`}
        {...props}
      />
    );
  }
);

Card.displayName = 'Card';

export { Card };
