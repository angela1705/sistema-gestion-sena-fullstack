
import { Route, Routes, useLocation } from 'react-router-dom';
import Login from './pages/usuarios/Login';
import Navbar from './components/global/navbar';
import Topbar from './components/global/Topbar';
import Inicio from './pages/usuarios/Inicio';
import Usuarios from './pages/usuarios/Usuarios';
import RegistrarUsuario from './pages/usuarios/RegistrarUsuario';
import SenaEmpresas from './pages/entidades/SenaEmpresas';
import Sedes from './pages/entidades/Sedes';
import Productos from './pages/inventario/Productos';
import UnidadesProductivas from './pages/entidades/UnidadesProductivas';
import Categorias from './pages/inventario/Categorias';
import Precios from './pages/inventario/Precios';
import Perfil from './pages/usuarios/Perfil';
import CajaDiaria from './pages/gestion_operativa/CajaDiaria';
import Reserva from './pages/gestion_operativa/Reserva';
import ProtectedRoute from './components/global/ProtectedRoute';
import { useState } from 'react';
import { GlobalStyles } from './components/global/navbar';

function App() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const isLoginPage = location.pathname === '/';

  return (
    <>
      <GlobalStyles />
      {!isLoginPage && <Topbar />}
      {!isLoginPage && <Navbar isOpen={isOpen} toggleSidebar={toggleSidebar} />}
      <div className="flex-grow">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/inicio" element={<Inicio isNavbarOpen={isOpen} />} />
            <Route path="/usuarios" element={<Usuarios isNavbarOpen={isOpen} />} />
            <Route path="/usuarios/registrar" element={<RegistrarUsuario isNavbarOpen={isOpen} />} />
            <Route path="/entidades/empresas-sena" element={<SenaEmpresas isNavbarOpen={isOpen} />} />
            <Route path="/entidades/sede" element={<Sedes isNavbarOpen={isOpen} />} />
            <Route path="/entidades/unidades-productivas" element={<UnidadesProductivas isNavbarOpen={isOpen} />} />
            <Route path="/inventario/productos" element={<Productos isNavbarOpen={isOpen} />} />
            <Route path="/inventario/categorias" element={<Categorias isNavbarOpen={isOpen} />} />
            <Route path="/inventario/precios" element={<Precios isNavbarOpen={isOpen} />} />
            <Route path="/perfil" element={<Perfil isNavbarOpen={isOpen} />} />
            <Route path="/gestion_operaciones/caja_diaria" element={<CajaDiaria isNavbarOpen={isOpen} />} />
            <Route path="/gestion_operaciones/reservas" element={<Reserva isNavbarOpen={isOpen} />} />
          </Route>
        </Routes>
      </div>
    </>
  );
}

export default App;