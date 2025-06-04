import React, { FormEvent } from "react";

interface FormContainerProps {
  title: string;
  children: React.ReactNode;
  onSubmit?: (e: FormEvent<HTMLFormElement>) => void;
  className?: string;
}

const Formulario: React.FC<FormContainerProps> = ({ title, children, onSubmit, className }) => {
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (onSubmit) onSubmit(e);
  };

  return (
    <div className={`flex justify-center items-center min-h-screen${className}`}>
      <div className="w-full max-w-md rounded-2xl p-8 transform transition-all duration-300 hover:shadow-3xl">
        <h1 id="form-title" className="text-center text-3xl font-extrabold text-gray-900 mb-8">
          {title}
        </h1>
        <form className="space-y-6" onSubmit={handleSubmit} aria-labelledby="form-title">
          {children}
        </form>
      </div>
    </div>
  );
};

export default Formulario;