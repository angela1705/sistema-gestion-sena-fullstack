import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
  } from "@heroui/react";
  
  interface ReusableModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    children: React.ReactNode;
    onConfirm?: () => void;
  }
  
  export default function ReuModal({
    isOpen,
    onOpenChange,
    title,
    children,
    onConfirm,
  }: ReusableModalProps) {
    return (
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">{title}</ModalHeader>
              <ModalBody>{children}</ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cerrar
                </Button>
                {onConfirm && (
                  <Button
                    color="primary"
                    onPress={() => {
                      onConfirm();
                      onClose();
                    }}
                  >
                    Confirmar
                  </Button>
                )}
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    );
  }
  