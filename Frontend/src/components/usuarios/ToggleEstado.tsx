import { Switch } from "@nextui-org/react";
import { useState } from "react";
import { updateUser } from "@/services/userService";

interface ToggleEstadoProps {
  initialValue: boolean;
  userId: number;
  onToggle?: () => void; // <-- AÑADIR ESTA LÍNEA
}

export const ToggleEstado = ({ initialValue, userId, onToggle }: ToggleEstadoProps) => {
  const [isActive, setIsActive] = useState(initialValue);

  const handleToggle = async () => {
    try {
      await updateUser(userId, { is_active: !isActive });
      setIsActive(!isActive);
      if (onToggle) onToggle(); 
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  return (
    <Switch 
      isSelected={isActive}
      onValueChange={handleToggle}
      color="success"
    />
  );
};
