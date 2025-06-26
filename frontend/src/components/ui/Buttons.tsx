import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    label: string;
    className?: string;
}

const Button = ({ label, className = '', ...props }: ButtonProps) => {
  return (
    <button {...props} className={`btn btn-primary ${className}`} >{label}</button>
  );
};

export default Button;