// src/components/usuarios/LoginForm.tsx
import React, { useState } from "react";
import { useAuth } from "../../hook/usuarios/useAuth";
import { LoginCredentials } from "../../types/usuarios/auth";
import { useNavigate } from "react-router-dom";
import { TextField, Button, Box, Typography, Alert } from "@mui/material";

const LoginForm: React.FC = () => {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    identificacion: "",
    password: "",
  });
  const [validationError, setValidationError] = useState<string | null>(null);
  const { login, isLoading, error } = useAuth();
  const navigate = useNavigate();

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
      navigate("/inicio");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundImage:
          "url('https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
      }}
    >
      <Box
        sx={{
          display: "flex",
          width: "100%",
          maxWidth: "1200px",
          height: "80vh",
          borderRadius: "20px",
          overflow: "hidden",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
        }}
      >
        <Box
          sx={{
            flex: 1,
            backgroundImage:
              "url('https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <Box
          sx={{
            flex: 1,
            backgroundColor: "rgba(255, 255, 255, 0.85)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: "40px",
            textAlign: "center",
          }}
        >
          <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold", color: "#333" }}>
            Iniciar Sesión
          </Typography>
          <form onSubmit={handleSubmit} style={{ width: "100%", maxWidth: "300px" }}>
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
              sx={{
                "& .MuiInputBase-root": { borderRadius: "10px" },
                "& .MuiInputLabel-root": { color: "#333" },
                "& .MuiInputBase-input": { color: "#333" },
                "& .MuiFormHelperText-root": { color: "#f44336" },
              }}
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
              sx={{
                "& .MuiInputBase-root": { borderRadius: "10px" },
                "& .MuiInputLabel-root": { color: "#333" },
                "& .MuiInputBase-input": { color: "#333" },
              }}
            />
            {error && (
              <Alert
                severity="error"
                sx={{
                  mt: 2,
                  mb: 2,
                  borderRadius: "10px",
                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                  color: "#fff",
                  fontWeight: "bold",
                }}
              >
                {error}
              </Alert>
            )}
            <Button
              type="submit"
              variant="contained"
              color="error"
              disabled={isLoading || !!validationError}
              sx={{
                marginTop: "10px",
                padding: "12px 30px",
                borderRadius: "20px",
                fontWeight: "bold",
                textTransform: "none",
              }}
            >
              {isLoading ? "Cargando..." : "Iniciar Sesión"}
            </Button>
          </form>
        </Box>
      </Box>
    </Box>
  );
};

export default LoginForm;
