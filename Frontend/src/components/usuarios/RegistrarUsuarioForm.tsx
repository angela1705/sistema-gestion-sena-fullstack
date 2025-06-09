// src/components/usuarios/RegistrarUsuarioForm.tsx
import React, { useState, useEffect } from "react";
import { useRegistrarUsuario } from "../../hook/usuarios/useRegistrarUsuario";
import { useRegistrarCargo } from "../../hook/usuarios/useRegistrarCargo";
import {
  Button,
  Card,
  CardBody,
  Input,
  Select,
  SelectItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/react";
import { useNavigate } from "react-router-dom";

interface RegistrarUsuarioFormProps {
  isNavbarOpen: boolean;
}

const RegistrarUsuarioForm: React.FC<RegistrarUsuarioFormProps> = ({ isNavbarOpen }) => {
  const { success: successUsuario, error: errorUsuario, loading: loadingUsuario, registrarUsuario } = useRegistrarUsuario("http://localhost:8000/api/personas/register/");
  const { success: successCargo, error: errorCargo, loading: loadingCargo, registrarCargo } = useRegistrarCargo("http://localhost:8000/api/cargo/");
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    identificacion: "",
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    telefono: "",
    rol: "",
    cargo: "",
    sede: "",
    numFicha: "",
  });

  const [isCargoModalOpen, setIsCargoModalOpen] = useState(false);
  const [newCargo, setNewCargo] = useState("");
  const [cargos, setCargos] = useState<{ id: number; nombre: string }[]>([]);
  const [roles, setRoles] = useState<{ id: number; nombre_display: string }[]>([]);
  const [sedes, setSedes] = useState<{ id: number; nombre_display: string }[]>([]);
  const [cargosLoading, setCargosLoading] = useState(true);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [sedesLoading, setSedesLoading] = useState(true);
  const [cargosError, setCargosError] = useState<string | null>(null);
  const [rolesError, setRolesError] = useState<string | null>(null);
  const [sedesError, setSedesError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("Token al cargar RegistrarUsuarioForm:", token);
    if (!token) {
      alert("Sesión no encontrada. Por favor, inicia sesión.");
      navigate("/login");
    }
  }, [navigate]);

  const fetchCargos = async () => {
    setCargosLoading(true);
    setCargosError(null);
    const token = localStorage.getItem("token");
    if (!token) {
      setCargosError("No hay token de autenticación");
      setCargosLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/api/cargo/", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Respuesta de /api/cargo/:", response.status, response.ok);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }
      const data = await response.json();
      console.log("Datos de cargos:", data);
      // Normalizar datos
      const normalizedCargos = Array.isArray(data) ? data : data.results || [];
      if (!Array.isArray(normalizedCargos)) {
        throw new Error("Formato de datos inválido");
      }
      setCargos(normalizedCargos);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error desconocido";
      console.error("Error al cargar cargos:", errorMessage);
      setCargosError(errorMessage);
      setCargos([]);
    } finally {
      setCargosLoading(false);
    }
  };

  const fetchRoles = async () => {
    setRolesLoading(true);
    setRolesError(null);
    const token = localStorage.getItem("token");
    console.log("Token para cargar roles:", token);
    if (!token) {
      setRolesError("No hay token de autenticación");
      setRolesLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/api/rol/", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Respuesta de /api/rol/:", response.status, response.ok);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }
      const data = await response.json();
      console.log("Datos de roles:", data);
      // Normalizar datos
      const normalizedRoles = Array.isArray(data) ? data : data.results || [];
      if (!Array.isArray(normalizedRoles)) {
        throw new Error("Formato de datos inválido");
      }
      const formattedRoles = normalizedRoles.map((rol: any) => ({
        id: rol.id,
        nombre_display: rol.nombre_display || rol.nombre,
      }));
      setRoles(formattedRoles);
      console.log("Roles formateados:", formattedRoles);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error desconocido";
      console.error("Error al cargar roles:", errorMessage);
      setRolesError(errorMessage);
      setRoles([]);
    } finally {
      setRolesLoading(false);
    }
  };

  const fetchSedes = async () => {
    setSedesLoading(true);
    setSedesError(null);
    const token = localStorage.getItem("token");
    console.log("Token para cargar sedes:", token);
    if (!token) {
      setSedesError("No hay token de autenticación");
      setSedesLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/api/sedes/", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Respuesta de /api/sedes/:", response.status, response.ok);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }
      const data = await response.json();
      console.log("Datos de sedes:", data);
      // Normalizar datos
      const normalizedSedes = Array.isArray(data) ? data : data.results || [];
      if (!Array.isArray(normalizedSedes)) {
        throw new Error("Formato de datos inválido");
      }
      const formattedSedes = normalizedSedes.map((sede: any) => ({
        id: sede.id,
        nombre_display: sede.nombre_display || sede.nombre,
      }));
      setSedes(formattedSedes);
      console.log("Sedes formateadas:", formattedSedes);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error desconocido";
      console.error("Error al cargar sedes:", errorMessage);
      setSedesError(errorMessage);
      setSedes([]);
    } finally {
      setSedesLoading(false);
    }
  };

  useEffect(() => {
    fetchCargos();
    fetchRoles();
    fetchSedes();
  }, []);

  useEffect(() => {
    if (successCargo) {
      fetchCargos();
      setNewCargo("");
      setIsCargoModalOpen(false);
    }
  }, [successCargo]);

  useEffect(() => {
    if (successUsuario) {
      alert("Usuario registrado exitosamente.");
      navigate("/usuarios");
    }
  }, [successUsuario, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      identificacion: formData.identificacion,
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email,
      password: formData.password,
      telefono: formData.telefono,
      rol: formData.rol ? parseInt(formData.rol) : null,
      cargo: formData.cargo ? parseInt(formData.cargo) : null,
      sede: formData.sede ? parseInt(formData.sede) : null,
      numFicha: formData.numFicha || null,
    };

    console.log("Payload enviado:", payload);
    await registrarUsuario(payload);
  };

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-800 dark:to-gray-900 transition-all duration-300 p-4 ${
        isNavbarOpen ? "ml-64" : "ml-16"
      } flex items-center justify-center`}
    >
      <Card className="w-full max-w-5xl">
        <CardBody className="flex flex-col p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Registrar Nuevo Usuario</h1>
          {errorUsuario && <p className="text-red-500 mb-4">Error al registrar usuario: {errorUsuario}</p>}
          {cargosError && <p className="text-red-500 mb-4">Error al cargar cargos: {cargosError}</p>}
          {rolesError && <p className="text-red-500 mb-4">Error al cargar roles: {rolesError}</p>}
          {sedesError && <p className="text-red-500 mb-4">Error al cargar sedes: {sedesError}</p>}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              name="identificacion"
              label="Identificación"
              value={formData.identificacion}
              onChange={handleInputChange}
              required
            />
            <Input
              name="first_name"
              label="Nombre"
              value={formData.first_name}
              onChange={handleInputChange}
              required
            />
            <Input
              name="last_name"
              label="Apellido"
              value={formData.last_name}
              onChange={handleInputChange}
              required
            />
            <Input
              name="email"
              label="Correo Electrónico"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
            <Input
              name="password"
              label="Contraseña"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
            <Input
              name="telefono"
              label="Teléfono"
              value={formData.telefono}
              onChange={handleInputChange}
            />
            <Select
              name="rol"
              label="Rol"
              selectedKeys={formData.rol ? [formData.rol] : []}
              onChange={(e) => handleSelectChange("rol", e.target.value)}
              isDisabled={rolesLoading || !!rolesError}
              placeholder={rolesLoading ? "Cargando roles..." : rolesError ? "Error al cargar roles" : "Seleccione un rol"}
            >
              {roles.map((rol) => (
                <SelectItem key={rol.id} value={rol.id.toString()}>
                  {rol.nombre_display}
                </SelectItem>
              ))}
            </Select>
            <div className="flex items-center gap-2">
              <Select
                name="cargo"
                label="Cargo"
                selectedKeys={formData.cargo ? [formData.cargo] : []}
                onChange={(e) => handleSelectChange("cargo", e.target.value)}
                isDisabled={cargosLoading || !!cargosError}
                placeholder={cargosLoading ? "Cargando cargos..." : cargosError ? "Error al cargar cargos" : "Seleccione un cargo"}
              >
                {cargos.map((cargo) => (
                  <SelectItem key={cargo.id} value={cargo.id.toString()}>
                    {cargo.nombre}
                  </SelectItem>
                ))}
              </Select>
              <Button color="primary" onPress={() => setIsCargoModalOpen(true)} disabled={cargosLoading || !!cargosError}>
                +
              </Button>
            </div>
            <Select
              name="sede"
              label="Sede"
              selectedKeys={formData.sede ? [formData.sede] : []}
              onChange={(e) => handleSelectChange("sede", e.target.value)}
              isDisabled={sedesLoading || !!sedesError}
              placeholder={sedesLoading ? "Cargando sedes..." : sedesError ? "Error al cargar sedes" : "Seleccione una sede"}
            >
              {sedes.map((sede) => (
                <SelectItem key={sede.id} value={sede.id.toString()}>
                  {sede.nombre_display}
                </SelectItem>
              ))}
            </Select>
            <Input
              name="numFicha"
              label="Número de Ficha"
              type="number"
              value={formData.numFicha}
              onChange={handleInputChange}
            />
            <div className="col-span-2 flex justify-end gap-4 mt-4">
              <Button color="danger" variant="light" onPress={() => navigate("/usuarios")}>
                Cancelar
              </Button>
              <Button type="submit" color="primary" disabled={loadingUsuario || cargosLoading || rolesLoading || sedesLoading}>
                {loadingUsuario ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      <Modal isOpen={isCargoModalOpen} onOpenChange={setIsCargoModalOpen} placement="center">
        <ModalContent>
          <ModalHeader>Registrar Nuevo Cargo</ModalHeader>
          <ModalBody>
            {errorCargo && <p className="text-red-500 mb-4">Error al registrar cargo: {errorCargo}</p>}
            <Input
              label="Nombre del Cargo"
              value={newCargo}
              onChange={(e) => setNewCargo(e.target.value)}
              required
            />
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={() => setIsCargoModalOpen(false)}>
              Cancelar
            </Button>
            <Button color="primary" onPress={() => registrarCargo(newCargo)} disabled={loadingCargo}>
              {loadingCargo ? "Guardando..." : "Guardar"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default RegistrarUsuarioForm;