// src/pages/usuarios/Login.tsx
import React from 'react';
import LoginForm from '../../components/usuarios/LoginForm';
import { Typography, Box } from '@mui/material';

const Login: React.FC = () => {
  return (
    <Box sx={{ textAlign: 'center', padding: '50px' }}>
      <Typography variant="h3" gutterBottom>
        Bienvenido
      </Typography>
      <LoginForm />
    </Box>
  );
};

export default Login;