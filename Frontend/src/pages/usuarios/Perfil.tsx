
import React, { useRef } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { Card, CardBody } from '@nextui-org/react';
import { User } from 'lucide-react';
import { useCurrentUser } from '../../hook/usuarios/useCurrentUser';
import { useUpdateProfilePhoto } from '../../hook/usuarios/useUpdateProfilePhoto';

const Perfil: React.FC<{ isNavbarOpen: boolean }> = ({ isNavbarOpen }) => {
  const { user, isLoading: userLoading, error: userError, refetch } = useCurrentUser();
  const { updatePhoto, isLoading: photoLoading, error: photoError } = useUpdateProfilePhoto();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && user?.id) {
      const updatedUser = await updatePhoto(file, user.id);
      if (updatedUser) {
        refetch();
      }
    }
  };

  if (userLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (userError) {
    return (
      <Box sx={{ textAlign: 'center', padding: '50px' }}>
        <Typography color="error">{userError}</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom right, #f3f4f6, #d1d5db)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '4rem',
        marginLeft: isNavbarOpen ? '16rem' : '4rem',
        transition: 'margin-left 0.3s',
      }}
    >
      <Card className="w-full max-w-5xl" sx={{ minHeight: '80vh' }}>
        <CardBody className="p-12 flex flex-col md:flex-row gap-8 items-center">
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
            <Box
              sx={{
                width: 240,
                height: 240,
                borderRadius: '50%',
                overflow: 'hidden',
                border: '2px solid #ccc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                position: 'relative',
                '&:hover': { opacity: 0.8 },
                mb: 2,
              }}
              onClick={handlePhotoClick}
            >
              {photoLoading ? (
                <CircularProgress size={48} />
              ) : user?.foto_url ? (
                <img
                  src={user.foto_url}
                  alt="Foto de perfil"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <User size={96} color="#999" />
              )}
            </Box>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            <Typography variant="h6" sx={{ fontWeight: 'bold', userSelect: 'none', color: '#333' }}>
              {user?.identificacion || 'N/A'}
            </Typography>
            <Typography variant="h6" sx={{ userSelect: 'none', color: '#333' }}>
              {user?.first_name || 'N/A'} {user?.last_name || 'N/A'}
            </Typography>
          </Box>
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', userSelect: 'none' }}>
              Detalles Adicionales
            </Typography>
            <Box sx={{ display: 'grid', gap: 2, userSelect: 'none' }}>
              <Typography variant="h6">
                <strong>Cargo:</strong>
              </Typography>
              <Typography variant="h6">{user?.cargo_nombre || 'N/A'}</Typography>
              <Typography variant="h6">
                <strong>Sede:</strong>
              </Typography>
              <Typography variant="h6">{user?.sede_nombre || 'N/A'}</Typography>
              <Typography variant="h6">
                <strong>Número de Ficha:</strong>
              </Typography>
              <Typography variant="h6">{user?.numFicha || 'N/A'}</Typography>
            </Box>
          </Box>
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', userSelect: 'none' }}>
              Detalles de Contacto
            </Typography>
            <Box sx={{ display: 'grid', gap: 2, userSelect: 'none' }}>
              <Typography variant="h6">
                <strong>Correo Electrónico:</strong>
              </Typography>
              <Typography variant="h6">{user?.email || 'N/A'}</Typography>
              <Typography variant="h6">
                <strong>Teléfono:</strong>
              </Typography>
              <Typography variant="h6">{user?.telefono || 'N/A'}</Typography>
            </Box>
          </Box>
        </CardBody>
      </Card>
    </Box>
  );
};

export default Perfil;