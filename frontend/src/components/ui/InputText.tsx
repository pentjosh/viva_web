import React from 'react';

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  className?: string;
  inputClassName?: string;
}

const TextInput = ({
  id,
  label,
  className = '',
  inputClassName = '',
  ...props}:TextInputProps) => (
  <div className={`relative ${className}`}>
      <input
        id={id}
        placeholder=" "
        {...props}
        className={`border-1 peer block w-full appearance-none rounded-lg px-2.5 pt-4 pb-2.5 text-sm 
          focus:outline-none focus:ring-0 ${inputClassName}`}
      />
      <label
        htmlFor={id}
        className="origin-[0] peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 
        peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 
        peer-focus:px-2 peer-focus:text-base-content absolute left-1 top-2 z-10 -translate-y-4 scale-75 
        transform cursor-text select-none bg-base-100 px-2 text-sm text-gray-400 duration-300"
      >
        {label}
      </label>
    </div>
);

export default TextInput;