
// src/pages/usuarios/Login.tsx
import React from 'react';
import LoginForm from '../../components/usuarios/LoginForm';
import { Box } from '@mui/material';

const Login: React.FC = () => {
  return (
    <Box sx={{ minHeight: "100vh" }}>
      <LoginForm />
    </Box>
  );
};

export default Login;