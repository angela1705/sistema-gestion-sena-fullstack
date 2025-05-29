// src/App.tsx
import { Route, Routes } from "react-router-dom";
import Login from "./pages/usuarios/Login";
import Navbar from "./components/global/navbar";
import Inicio from "./pages/usuarios/Inicio"; // Página de Inicio que crearemos
import { useState } from "react";
import { GlobalStyles } from "./components/global/navbar";

function App() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <GlobalStyles />
      <Navbar isOpen={isOpen} toggleSidebar={toggleSidebar} />
      <div className={`transition-all ${isOpen ? "ml-64" : "ml-20"}`}>
        <Routes>
          <Route element={<Login />} path="/" />
          <Route element={<Inicio />} path="/inicio" />
          {/* Agrega más rutas según necesites */}
        </Routes>
      </div>
    </>
  );
}

export default App;