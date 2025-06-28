import React, { useRef, useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, CircularProgress } from '@mui/material';
import { Card, CardBody } from '@nextui-org/react';
import { User } from 'lucide-react';
import { useCurrentUser } from '../../hook/usuarios/useCurrentUser';
import { useUpdateProfilePhoto } from '../../hook/usuarios/useUpdateProfilePhoto';

const Perfil: React.FC<{ isNavbarOpen: boolean }> = ({ isNavbarOpen }) => {
  const { user, isLoading: userLoading, error: userError, refetch } = useCurrentUser();
  const { updatePhoto, isLoading: photoLoading } = useUpdateProfilePhoto();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [isLoadingForm, setIsLoadingForm] = useState(false);
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    email: user?.email || '',
    telefono: user?.telefono || '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        email: user.email || '',
        telefono: user.telefono || '',
      });
    }
  }, [user]);

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

  const handleDeleteAvatar = async () => {
    if (user?.id) {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch(`http://localhost:8000/api/personas/${user.id}/`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ foto: null }),
        });
        if (!response.ok) throw new Error('Error al eliminar la foto');
        await response.json(); // Solo para confirmar, no asignamos a variable
        refetch();
      } catch (err) {
        console.error('Error al eliminar la foto:', err);
      }
    }
  };

  const handleUpdate = () => {
    setIsEditing(true);
  };

  const handleConfirm = async () => {
    setIsLoadingForm(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/personas/${user?.id}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: formData.first_name,
          email: formData.email,
          telefono: formData.telefono,
        }),
      });

      if (!response.ok) throw new Error('Error al actualizar perfil');
      await response.json(); // Solo para confirmar, no asignamos a variable
      refetch();
      setIsEditing(false);
    } catch (err) {
      console.error('Error al guardar:', err);
    } finally {
      setIsLoadingForm(false);
    }
  };

  const handleChange = (field: keyof typeof formData) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [field]: event.target.value });
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
        padding: '2rem',
        marginLeft: isNavbarOpen ? '16rem' : '4rem',
        transition: 'margin-left 0.3s',
      }}
    >
      <Card className="w-full max-w-3xl">
        <CardBody className="p-6 flex flex-col md:flex-row gap-6 items-center">
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
            <Box
              sx={{
                width: 180,
                height: 180,
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
                <CircularProgress size={36} />
              ) : user?.foto_url ? ( // Cambiado a foto_url para coincidir con el código original
                <img
                  src={user.foto_url}
                  alt="Foto de perfil"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <User size={72} color="#999" />
              )}
            </Box>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            <Button
              variant="contained"
              color="primary"
              sx={{ mb: 1, backgroundColor: '#007bff ', '&:hover': { backgroundColor: '#1b2433' }, fontSize: '0.875rem' }}
            >
              Change Avatar
            </Button>
            <Button
              variant="outlined"
              sx={{ color: '#d32f2f', borderColor: '#d32f2f', fontSize: '0.875rem' }}
              onClick={handleDeleteAvatar}
            >
              Delete Avatar
            </Button>
          </Box>
          <Box sx={{ flex: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom sx={{ fontSize: '1.125rem' }}>
              ACCOUNT
            </Typography>
            <Typography variant="caption" color="text.secondary" gutterBottom sx={{ fontSize: '0.75rem' }}>
              Edit your name, avatar, etc.
            </Typography>
            <Box sx={{ display: 'grid', gap: 1 }}>
              <TextField
                label="Identification"
                value={user?.identificacion || 'N/A'}
                fullWidth
                variant="outlined"
                disabled={true}
                size="small"
              />
              <TextField
                label="Name"
                value={formData.first_name}
                onChange={handleChange('first_name')}
                fullWidth
                variant="outlined"
                disabled={!isEditing}
                size="small"
              />
              <TextField
                label="Cargo"
                value={user?.cargo_nombre || 'N/A'} // Cambiado a cargo_nombre para coincidir con el original
                fullWidth
                variant="outlined"
                disabled={true}
                size="small"
              />
              <TextField
                label="Sede"
                value={user?.sede_nombre || 'N/A'} // Cambiado a sede_nombre para coincidir con el original
                fullWidth
                variant="outlined"
                disabled={true}
                size="small"
              />
              <TextField
                label="Número de Ficha"
                value={user?.numFicha?.toString() || 'N/A'}
                fullWidth
                variant="outlined"
                disabled={true}
                size="small"
              />
              <TextField
                label="Email"
                value={formData.email}
                onChange={handleChange('email')}
                fullWidth
                variant="outlined"
                disabled={!isEditing}
                size="small"
              />
              <TextField
                label="Teléfono"
                value={formData.telefono}
                onChange={handleChange('telefono')}
                fullWidth
                variant="outlined"
                disabled={!isEditing}
                size="small"
              />
              {isEditing ? (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleConfirm}
                  sx={{ mt: 1, backgroundColor: '#e57373', '&:hover': { backgroundColor: '#d32f2f' }, fontSize: '0.875rem' }}
                  disabled={isLoadingForm}
                >
                  {isLoadingForm ? <CircularProgress size={20} /> : 'Confirmar'}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleUpdate}
                  sx={{ mt: 1, backgroundColor: '#007bff', '&:hover': { backgroundColor: '#1b2433' }, fontSize: '0.875rem' }}
                >
                  Update Setting
                </Button>
              )}
            </Box>
          </Box>
        </CardBody>
      </Card>
    </Box>
  );
};

export default Perfil;