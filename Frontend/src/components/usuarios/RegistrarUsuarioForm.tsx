import React, { useState, useEffect } from 'react';
import { useRegistrarUsuario } from '../../hook/usuarios/useRegistrarUsuario';
import { useRegistrarCargo } from '../../hook/usuarios/useRegistrarCargo';
import {
  Button,
  Card,
  CardBody,
  Input,
  Select,
  SelectItem,
} from '@nextui-org/react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@heroui/modal';
import { useNavigate } from 'react-router-dom';

interface RegistrarUsuarioFormProps {
  isNavbarOpen: boolean;
}

const RegistrarUsuarioForm: React.FC<RegistrarUsuarioFormProps> = ({ isNavbarOpen }) => {
  const { success: successUsuario, error: errorUsuario, loading: loadingUsuario, registrarUsuario } = useRegistrarUsuario();
  const { success: successCargo, error: errorCargo, loading: loadingCargo, registrarCargo } = useRegistrarCargo();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    identificacion: '',
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    telefono: '',
    rol: '',
    cargo: '',
    sede: '',
    numFicha: '',
  });

  const [isCargoModalOpen, setIsCargoModalOpen] = useState(false);
  const [newCargo, setNewCargo] = useState('');
  const [cargos, setCargos] = useState<{ id: number; nombre: string }[]>([]);
  const [roles, setRoles] = useState<{ id: number; nombre_display: string }[]>([]);
  const [sedes, setSedes] = useState<{ id: number; nombre_display: string }[]>([]);
  const [cargosLoading, setCargosLoading] = useState(true);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [sedesLoading, setSedesLoading] = useState(true);
  const [cargosError, setCargosError] = useState<string | null>(null);
  const [rolesError, setRolesError] = useState<string | null>(null);
  const [sedesError, setSedesError] = useState<string | null>(null);

  // Mapeo de nombre a nombre_display basado en OPCIONES_ROL del modelo Rol
  const OPCIONES_ROL: { [key: string]: string } = {
    consumidor: 'Consumidor',
    pasante: 'Pasante',
    liderup: 'Lider de unidad productiva',
    vocera: 'Vocera',
    administrador: 'Administrador',
    cajero: 'Cajero',
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('Token al cargar RegistrarUsuarioForm:', token);
    if (!token) {
      alert('Sesión no encontrada. Por favor, inicia sesión.');
      navigate('/login');
    }
  }, [navigate]);

  const fetchCargos = async () => {
    setCargosLoading(true);
    setCargosError(null);
    const token = localStorage.getItem('token');
    if (!token) {
      setCargosError('No hay token de autenticación');
      setCargosLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/cargo/', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('Respuesta de /api/cargo/:', response.status, response.statusText);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }
      const data = await response.json();
      console.log('Datos de cargos:', data);
      const normalizedCargos = Array.isArray(data) ? data : data.results || [];
      if (!Array.isArray(normalizedCargos)) {
        throw new Error('Formato de datos inválido');
      }
      setCargos(normalizedCargos);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      console.error('Error al cargar cargos:', errorMessage);
      setCargosError(errorMessage);
      setCargos([]);
    } finally {
      setCargosLoading(false);
    }
  };

  const fetchRoles = async () => {
    setRolesLoading(true);
    setRolesError(null);
    const token = localStorage.getItem('token');
    console.log('Token para cargar roles:', token);
    if (!token) {
      setRolesError('No hay token de autenticación');
      setRolesLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/rol/', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('Respuesta de /api/rol/:', response.status, response.statusText);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }
      const data = await response.json();
      console.log('Datos de roles:', data);
      const normalizedRoles = Array.isArray(data) ? data : data.results || [];
      if (!Array.isArray(normalizedRoles)) {
        throw new Error('Formato de datos inválido');
      }
      const formattedRoles = normalizedRoles.map((rol: any) => ({
        id: rol.id,
        nombre_display: OPCIONES_ROL[rol.nombre] || rol.nombre.charAt(0).toUpperCase() + rol.nombre.slice(1).toLowerCase(),
      }));
      setRoles(formattedRoles);
      console.log('Roles formateados:', formattedRoles);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      console.error('Error al cargar roles:', errorMessage);
      setRolesError(errorMessage);
      setRoles([]);
    } finally {
      setRolesLoading(false);
    }
  };

  const fetchSedes = async () => {
    setSedesLoading(true);
    setSedesError(null);
    const token = localStorage.getItem('token');
    console.log('Token para cargar sedes:', token);
    if (!token) {
      setSedesError('No hay token de autenticación');
      setSedesLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/sedes/', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('Respuesta de /api/sedes/:', response.status, response.statusText);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }
      const data = await response.json();
      console.log('Datos de sedes:', data);
      const normalizedSedes = Array.isArray(data) ? data : data.results || [];
      if (!Array.isArray(normalizedSedes)) {
        throw new Error('Formato de datos inválido');
      }
      const formattedSedes = normalizedSedes.map((sede: any) => ({
        id: sede.id,
        nombre_display: sede.nombre_display || sede.nombre,
      }));
      setSedes(formattedSedes);
      console.log('Sedes formateadas:', formattedSedes);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      console.error('Error al cargar sedes:', errorMessage);
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
      setNewCargo('');
      setIsCargoModalOpen(false);
    }
  }, [successCargo]);

  useEffect(() => {
    if (successUsuario) {
      alert('Usuario registrado exitosamente.');
      navigate('/usuarios');
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
    if (formData.rol === '3' && !formData.numFicha) {
      alert('El número de ficha es obligatorio para el rol Pasante.');
      return;
    }
    const payload = {
      identificacion: formData.identificacion,
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email,
      password: formData.password,
      telefono: formData.telefono || null,
      rol: formData.rol ? parseInt(formData.rol) : null,
      cargo: formData.cargo ? parseInt(formData.cargo) : null,
      sede: formData.sede ? parseInt(formData.sede) : null,
      numFicha: formData.numFicha ? parseInt(formData.numFicha) : null,
    };

    console.log('Payload enviado:', payload);
    await registrarUsuario(payload);
  };

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-800 dark:to-gray-900 transition-all duration-300 p-4 ${
        isNavbarOpen ? 'ml-64' : 'ml-16'
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
              placeholder="Ingrese la identificación"
              value={formData.identificacion}
              onChange={handleInputChange}
              isRequired
            />
            <Input
              name="first_name"
              label="Nombre"
              placeholder="Ingrese el nombre"
              value={formData.first_name}
              onChange={handleInputChange}
              isRequired
            />
            <Input
              name="last_name"
              label="Apellido"
              placeholder="Ingrese el apellido"
              value={formData.last_name}
              onChange={handleInputChange}
              isRequired
            />
            <Input
              name="email"
              label="Correo Electrónico"
              type="email"
              placeholder="Ingrese el correo"
              value={formData.email}
              onChange={handleInputChange}
              isRequired
            />
            <Input
              name="password"
              label="Contraseña"
              type="password"
              placeholder="Ingrese la contraseña"
              value={formData.password}
              onChange={handleInputChange}
              isRequired
            />
            <Input
              name="telefono"
              label="Teléfono"
              placeholder="Ingrese el teléfono"
              value={formData.telefono}
              onChange={handleInputChange}
            />
            <Select
              name="rol"
              label="Rol"
              placeholder={rolesLoading ? 'Cargando roles...' : rolesError ? 'Error al cargar roles' : 'Seleccione un rol'}
              selectedKeys={formData.rol ? [formData.rol] : []}
              onChange={(e) => handleSelectChange('rol', e.target.value)}
              isDisabled={rolesLoading || !!rolesError || roles.length === 0}
            >
              {roles.length === 0 && !rolesLoading && !rolesError ? (
                <SelectItem key="no-options" isDisabled>
                  No hay roles disponibles
                </SelectItem>
              ) : (
                roles.map((rol) => (
                  <SelectItem key={rol.id.toString()} value={rol.id.toString()}>
                    {rol.nombre_display}
                  </SelectItem>
                ))
              )}
            </Select>
            <div className="flex items-end gap-2">
              <Select
                name="cargo"
                label="Cargo"
                placeholder={cargosLoading ? 'Cargando cargos...' : cargosError ? 'Error al cargar cargos' : 'Seleccione un cargo'}
                selectedKeys={formData.cargo ? [formData.cargo] : []}
                onChange={(e) => handleSelectChange('cargo', e.target.value)}
                isDisabled={cargosLoading || !!cargosError || cargos.length === 0}
              >
                {cargos.length === 0 && !cargosLoading && !cargosError ? (
                  <SelectItem key="no-options" isDisabled>
                    No hay cargos disponibles
                  </SelectItem>
                ) : (
                  cargos.map((cargo) => (
                    <SelectItem key={cargo.id.toString()} value={cargo.id.toString()}>
                      {cargo.nombre}
                    </SelectItem>
                  ))
                )}
              </Select>
              <Button
                color="primary"
                onPress={() => setIsCargoModalOpen(true)}
                isDisabled={cargosLoading || !!cargosError}
              >
                +
              </Button>
            </div>
            <Select
              name="sede"
              label="Sede"
              placeholder={sedesLoading ? 'Cargando sedes...' : sedesError ? 'Error al cargar sedes' : 'Seleccione una sede'}
              selectedKeys={formData.sede ? [formData.sede] : []}
              onChange={(e) => handleSelectChange('sede', e.target.value)}
              isDisabled={sedesLoading || !!sedesError || sedes.length === 0}
            >
              {sedes.length === 0 && !sedesLoading && !sedesError ? (
                <SelectItem key="no-options" isDisabled>
                  No hay sedes disponibles
                </SelectItem>
              ) : (
                sedes.map((sede) => (
                  <SelectItem key={sede.id.toString()} value={sede.id.toString()}>
                    {sede.nombre_display}
                  </SelectItem>
                ))
              )}
            </Select>
            <Input
              name="numFicha"
              label="Número de Ficha"
              type="number"
              placeholder="Ingrese el número de ficha (si aplica)"
              value={formData.numFicha}
              onChange={handleInputChange}
              isRequired={formData.rol === '3'}
              isInvalid={formData.rol === '3' && !formData.numFicha}
              errorMessage={formData.rol === '3' && !formData.numFicha ? 'El número de ficha es obligatorio para Pasante' : ''}
            />
            <div className="col-span-2 flex justify-end gap-4 mt-4">
              <Button color="danger" variant="light" onPress={() => navigate('/usuarios')}>
                Cancelar
              </Button>
              <Button
                type="submit"
                color="primary"
                isDisabled={loadingUsuario || cargosLoading || rolesLoading || sedesLoading || (formData.rol === '3' && !formData.numFicha)}
              >
                {loadingUsuario ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      <Modal isOpen={isCargoModalOpen} onClose={() => setIsCargoModalOpen(false)} placement="center">
        <ModalContent>
          <ModalHeader>Registrar Nuevo Cargo</ModalHeader>
          <ModalBody>
            {errorCargo && <p className="text-red-500 mb-4">Error al registrar cargo: {errorCargo}</p>}
            <Input
              label="Nombre del Cargo"
              placeholder="Ingrese el nombre del cargo"
              value={newCargo}
              onChange={(e) => setNewCargo(e.target.value)}
              isRequired
            />
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={() => setIsCargoModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              color="primary"
              onPress={() => registrarCargo(newCargo)}
              isDisabled={loadingCargo || !newCargo}
            >
              {loadingCargo ? 'Guardando...' : 'Guardar'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default RegistrarUsuarioForm;