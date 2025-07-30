import { Dropdown, Button, DropdownTrigger, DropdownMenu, DropdownItem } from "@nextui-org/react";
import { FaEllipsisV } from "react-icons/fa";

interface DropdownEdicionProps {
  userId: number;
  onEdit: (id: number) => void;
  onResetPassword: () => void;
}

export const DropdownEdicion = ({ userId, onEdit, onResetPassword }: DropdownEdicionProps) => {
  return (
    <Dropdown>
      <DropdownTrigger>
        <Button isIconOnly size="sm" variant="light">
          <FaEllipsisV />
        </Button>
      </DropdownTrigger>
      <DropdownMenu aria-label="Acciones de usuario">
        <DropdownItem key="edit" onClick={() => onEdit(userId)}>Editar</DropdownItem>
        <DropdownItem key="reset" onClick={onResetPassword}>Reiniciar contraseña</DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};
