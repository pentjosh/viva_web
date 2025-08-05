import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    className?: string;
}

const Button = ({ children, className = '', ...props }: ButtonProps) => {
  return (
    <button {...props} className={`btn btn-primary ${className}`} >{children}</button>
  );
};

export default Button;