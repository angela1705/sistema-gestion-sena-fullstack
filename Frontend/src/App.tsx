// src/App.tsx
import { Route, Routes, useLocation } from "react-router-dom";
import Login from "./pages/usuarios/Login";
import Navbar from "./components/global/navbar";
import Topbar from "./components/global/Topbar";
import Inicio   from "./pages/usuarios/Inicio";
import { useState } from "react";
import { GlobalStyles } from "./components/global/navbar";

function App() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  // Determinar si estamos en la página de login
  const isLoginPage = location.pathname === "/";

  return (
    <>
      <GlobalStyles />
      {!isLoginPage && <Topbar />}
      {!isLoginPage && <Navbar isOpen={isOpen} toggleSidebar={toggleSidebar} />}
      <div
        className={`transition-all ${
          isLoginPage
            ? "ml-0 mt-0 p-0"
            : isOpen
            ? "ml-64 mt-16 p-4"
            : "ml-16 mt-16 p-4"
        }`}
      >
        <Routes>
          <Route element={<Login />} path="/" />
          <Route element={<Inicio />} path="/Inicio" />
        </Routes>
      </div>
    </>
  );
}

export default App;