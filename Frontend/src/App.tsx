// src/App.tsx
import { Route, Routes, useLocation } from "react-router-dom";
import Login from "./pages/usuarios/Login";
import Navbar from "./components/global/navbar";
import Topbar from "./components/global/Topbar";
import Inicio from "./pages/usuarios/Inicio";
import Usuarios from "./pages/usuarios/Usuarios";
import RegistrarUsuario from "./pages/usuarios/RegistrarUsuario";
import SenaEmpresas from "./pages/entidades/SenaEmpresas"; // Asegúrate de que esta importación esté presente
import { useState } from "react";
import { GlobalStyles } from "./components/global/navbar";

function App() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const isLoginPage = location.pathname === "/";

  return (
    <>
      <GlobalStyles />
      {!isLoginPage && <Topbar />}
      {!isLoginPage && <Navbar isOpen={isOpen} toggleSidebar={toggleSidebar} />}
      <div className="flex-grow">
        <Routes>
          <Route element={<Login />} path="/" />
          <Route element={<Inicio isNavbarOpen={isOpen} />} path="/Inicio" />
          <Route element={<Usuarios isNavbarOpen={isOpen} />} path="/usuarios" />
          <Route element={<RegistrarUsuario isNavbarOpen={isOpen} />} path="/usuarios/registrar" />
          <Route element={<SenaEmpresas isNavbarOpen={isOpen} />} path="/entidades/empresas-sena" /> {/* Ruta añadida */}
        </Routes>
      </div>
    </>
  );
}

export default App;