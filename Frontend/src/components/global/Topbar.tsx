import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';
import { Typography } from '@mui/material';
import { useCurrentUser } from '../../hook/usuarios/useCurrentUser';

const Topbar: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useCurrentUser();

  const handleProfileClick = () => {
    navigate('/perfil');
  };

  if (isLoading) {
    return null; // O un spinner si prefieres
  }

  return (
    <header className="w-full h-16 bg-gray-800 text-white shadow-md fixed top-0 left-0 z-50 flex items-center px-4">
      <div className="flex-1 flex justify-between items-center">
        <span></span>
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={handleProfileClick}
        >
          {user?.first_name && (
            <Typography
              variant="body2"
              sx={{ color: 'white', userSelect: 'none' }}
            >
              {user.first_name}
            </Typography>
          )}
          <div className="w-px h-6 bg-gray-600 mx-1" />
          <button
            className="p-2 rounded-full hover:bg-gray-700 transition-all"
            title="Perfil"
          >
            <User size={24} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
