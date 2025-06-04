// src/components/usuarios/LoginForm.tsx
import React, { useState } from "react";
import { useAuth } from "../../hook/usuarios/useAuth";
import { LoginCredentials } from "../../types/usuarios/auth";
import { useNavigate } from "react-router-dom";
import { TextField, Button, Box, Typography, Alert } from "@mui/material";
import Toast from "../../components/global/Toast"; // Importa el componente Toast

const LoginForm: React.FC = () => {
  const [credentials, setCredentials] = useState<LoginCredentials>({ identificacion: "", password: "" });
  const [validationError, setValidationError] = useState<string | null>(null);
  const { login, isLoading, error } = useAuth();
  const navigate = useNavigate();
  const [toastState, setToastState] = useState<{ isOpen: boolean; message: string; type: "success" | "error" }>({
    isOpen: false,
    message: "",
    type: "error",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials({ ...credentials, [name]: value });
    if (name === "identificacion") {
      const regex = /^[0-9]{6,20}$/;
      if (!regex.test(value) && value !== "") {
        setValidationError("La identificación debe ser un número de 6 a 20 dígitos.");
      } else {
        setValidationError(null);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validationError) return;

    const result = await login(credentials);
    if (result) {
      setToastState({
        isOpen: true,
        message: "Inicio de sesión exitoso",
        type: "success",
      });
      navigate("/inicio"); // Redirige al usuario a la página de inicio después del login exitoso
    } else {
      setToastState({
        isOpen: true,
        message: error || "Error al iniciar sesión",
        type: "error",
      });
    }
  };

  const handleCloseToast = () => {
    setToastState({ ...toastState, isOpen: false });
  };

  return (
    <Box
      sx={{
        padding: "20px",
        maxWidth: "400px",
        margin: "0 auto",
        textAlign: "center",
      }}
    >
      <Typography variant="h4" gutterBottom>
        Iniciar Sesión
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          id="identificacion"
          name="identificacion"
          label="Identificación"
          value={credentials.identificacion}
          onChange={handleChange}
          required
          margin="normal"
          error={!!validationError}
          helperText={validationError}
        />
        <TextField
          fullWidth
          id="password"
          name="password"
          label="Contraseña"
          type="password"
          value={credentials.password}
          onChange={handleChange}
          required
          margin="normal"
        />
        {error && <Alert severity="error" sx={{ marginBottom: "10px" }}>{error}</Alert>}
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={isLoading || !!validationError}
          sx={{ marginTop: "10px", padding: "10px 20px" }}
        >
          {isLoading ? "Cargando..." : "Iniciar Sesión"}
        </Button>
      </form>
      <Toast
        message={toastState.message}
        type={toastState.type}
        isOpen={toastState.isOpen}
        onClose={handleCloseToast}
      />
    </Box>
  );
};

export default LoginForm;