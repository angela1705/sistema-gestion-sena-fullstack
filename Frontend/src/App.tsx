import { Route, Routes } from "react-router-dom";
import Login from "./pages/usuarios/Login";

function App() {
  return (
    <Routes>
      <Route element={<Login />} path="/" />
    </Routes>
  );
}

export default App;
