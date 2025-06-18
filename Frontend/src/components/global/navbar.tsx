import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@mui/material';
import { Menu, X, ChevronDown, ChevronRight, LogOut } from 'lucide-react';
import {
  FaHome,
  FaUser,
  FaBox,
  FaBuilding,
  FaShoppingCart,
} from 'react-icons/fa';

interface MenuItem {
  id: number;
  label: string;
  path?: string;
  icon: JSX.Element;
  subItems?: { id: number; label: string; path: string }[];
}

const menuItems: MenuItem[] = [
  { id: 1, label: 'Inicio', path: '/inicio', icon: <FaHome /> },
  { id: 2, label: 'Usuarios', path: '/usuarios', icon: <FaUser /> },
  {
    id: 5,
    label: 'Entidades',
    icon: <FaBuilding />,
    subItems: [
      { id: 6, label: 'Sede', path: '/entidades/sede' },
      { id: 7, label: 'Unidades Productivas', path: '/entidades/unidades-productivas' },
      { id: 8, label: 'Empresas SENA', path: '/entidades/empresas-sena' },
    ],
  },
  {
    id: 9,
    label: 'Gestión Operaciones',
    icon: <FaShoppingCart />,
    subItems: [
      { id: 10, label: 'Caja Diaria', path: '/gestion_operaciones/caja_diaria' },
      { id: 11, label: 'Detalle Caja', path: '/gestion_operaciones/detalle_caja' },
      { id: 12, label: 'Reservas', path: '/gestion_operaciones/reservas' },
      { id: 13, label: 'Transacciones', path: '/gestion_operaciones/transacciones' },
    ],
  },
  {
    id: 14,
    label: 'Inventario',
    icon: <FaBox />,
    subItems: [
      { id: 15, label: 'Categorías', path: '/inventario/categorias' },
      { id: 16, label: 'Precios', path: '/inventario/precios' },
      { id: 17, label: 'Productos', path: '/inventario/productos' },
    ],
  },
];

const Navbar: React.FC<{ isOpen: boolean; toggleSidebar: () => void }> = ({
  isOpen,
  toggleSidebar,
}) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    console.log('Token eliminado:', localStorage.getItem('token'));
    navigate('/', { replace: true });
  };

  return (
    <aside
      className={`h-screen bg-gray-800 text-white shadow-lg transition-all duration-300 flex flex-col fixed top-0 bottom-0 z-50
      ${isOpen ? 'w-64 p-4' : 'w-16 p-2'} rounded-r-2xl`}
    >
      <div className="flex justify-between items-center mb-4">
        <Button variant="text" onClick={toggleSidebar} sx={{ color: 'white' }}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </Button>
      </div>

      <nav className="flex flex-col gap-2 overflow-y-auto scrollbar-hidden flex-1">
        {menuItems.map((item) => (
          <SidebarItem key={item.id} item={item} isOpen={isOpen} />
        ))}
      </nav>

      <div className="mt-auto">
        <Button
          variant="text"
          onClick={handleLogout}
          sx={{
            color: 'white',
            width: '100%',
            justifyContent: isOpen ? 'flex-start' : 'center',
            padding: '12px',
            '&:hover': { backgroundColor: '#4b5563' },
          }}
        >
          <LogOut size={20} />
          {isOpen && <span className="ml-3 text-sm">Cerrar Sesión</span>}
        </Button>
      </div>
    </aside>
  );
};

const SidebarItem: React.FC<{ item: MenuItem; isOpen: boolean }> = ({
  item,
  isOpen,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const location = useLocation();

  const isActive = (path?: string) => location.pathname === path;

  const itemIsActive =
    isActive(item.path) || (item.subItems && item.subItems.some((sub) => isActive(sub.path)));

  return (
    <div>
      <Link
        to={item.path || '#'}
        className={`flex items-center gap-3 p-3 rounded-lg transition-all cursor-pointer
        ${itemIsActive ? 'bg-gray-700' : 'hover:bg-gray-700'}
        ${isOpen ? 'w-full' : 'justify-center'}`}
        onClick={(e) => {
          if (item.subItems) {
            e.preventDefault();
            setIsExpanded(!isExpanded);
          }
        }}
      >
        <span className="text-xl">{item.icon}</span>
        {isOpen && <span className="text-sm">{item.label}</span>}
        {item.subItems && isOpen && (
          <span className="ml-auto">
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </span>
        )}
      </Link>

      {isOpen && isExpanded && item.subItems && (
        <div className="flex flex-col gap-1 ml-6 mt-1">
          {item.subItems.map((subItem) => (
            <Link
              key={subItem.id}
              to={subItem.path}
              className={`flex items-center gap-2 p-2 rounded-lg transition-all cursor-pointer
              ${isActive(subItem.path) ? 'bg-gray-700 text-white' : 'hover:bg-gray-600 text-gray-300'}
              text-sm`}
            >
              <span className="text-sm">{subItem.label}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = `
  .scrollbar-hidden::-webkit-scrollbar {
    display: none;
  }
  .scrollbar-hidden {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`;

export const GlobalStyles = () => <style>{styles}</style>;

export default Navbar;
