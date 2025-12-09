import React from 'react';

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'outline' | 'ghost' }> = ({
  children,
  variant = 'primary',
  className = '',
  ...props
}) => {
  const baseStyle = "px-6 py-3 rounded-xl font-medium transition-all duration-200 active:scale-95 flex items-center justify-center gap-2";
  const variants = {
    primary: "bg-sage-600 text-white hover:bg-sage-700 shadow-md hover:shadow-lg",
    secondary: "bg-sage-200 text-sage-800 hover:bg-sage-300",
    outline: "border-2 border-sage-600 text-sage-600 hover:bg-sage-50",
    ghost: "text-sage-600 hover:bg-sage-100"
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className = '', ...props }) => (
  <div className={`bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden ${className}`} {...props}>
    {children}
  </div>
);

export const Badge: React.FC<{ children: React.ReactNode; color?: 'green' | 'blue' | 'orange' }> = ({ children, color = 'green' }) => {
  const colors = {
    green: "bg-sage-100 text-sage-800",
    blue: "bg-blue-50 text-blue-700",
    orange: "bg-orange-50 text-orange-700"
  };
  return (
    <span className={`px-2 py-1 rounded-md text-xs font-semibold tracking-wide ${colors[color]}`}>
      {children}
    </span>
  );
};
