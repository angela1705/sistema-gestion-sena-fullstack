import React from "react";
import { Input } from "@heroui/react";

interface ReusableInputProps {
  label: string;
  placeholder?: string;
  type: string;
  radius?: "full" | "lg" | "md" | "sm" | "none";
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}



export const ReuInput: React.FC<ReusableInputProps> = ({
  label,
  placeholder,
  type,
  radius = "md",
  value,
  onChange,
}) => {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <Input
        className="w-full"
        type={type}
        placeholder={placeholder}
        radius={radius}
        value={value.toString()}
        onChange={onChange}
      />
    </div>
  );
};