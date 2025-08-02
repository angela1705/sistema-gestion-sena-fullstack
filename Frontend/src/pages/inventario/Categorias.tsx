import { useState, useEffect } from 'react';
import {
  Button,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Card,
  CardBody,
  Input
} from '@nextui-org/react';
import { FaPlus, FaEdit } from 'react-icons/fa';
import { TipoCategoria } from '@/types/inventario/Categoria';
import { useTipoCategorias } from '@/hook/inventario/useTipoCategorias';
import { useManageCategoria } from '@/hook/inventario/useManageCategoria';
import { TipoCategoriaForm } from '@/components/inventario/TipoCategoriaForm';

interface CategoriasProps {
  isNavbarOpen: boolean;
}

const Categorias = ({ isNavbarOpen }: CategoriasProps) => {
  const { categorias, retry } = useTipoCategorias();
  const { success, error: manageError, loading: manageLoading, createUpdateCategoria, reset } =
    useManageCategoria('http://localhost:8000/api/categoria/');

  const [selectedCategoria, setSelectedCategoria] = useState<TipoCategoria | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // 🔍 Search and pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filteredCategorias = categorias.filter((cat) =>
    cat.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCategorias.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCategorias = filteredCategorias.slice(indexOfFirstItem, indexOfLastItem);

  useEffect(() => {
    if (success) {
      setIsFormOpen(false);
      setSelectedCategoria(null);
      reset();
      retry();
    }
  }, [success, reset, retry]);

  const handleSubmit = async (data: FormData) => {
    await createUpdateCategoria(data, !!selectedCategoria?.id, selectedCategoria?.id);
  };

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-800 dark:to-gray-900 transition-all duration-300 p-4 pt-16 ${
        isNavbarOpen ? 'ml-64' : 'ml-16'
      } flex items-center justify-center`}
    >
      <Card className="w-full max-w-5xl">
        <CardBody className="p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
            <h2 className="text-2xl font-semibold">Categorías</h2>
            <Button
              startContent={<FaPlus />}
              color="primary"
              onPress={() => {
                setSelectedCategoria(null);
                setIsFormOpen(true);
              }}
            >
              Nueva
            </Button>
          </div>

          <Input
            type="text"
            label="Buscar"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="mb-4"
          />

          <Table aria-label="tabla tipo categorias">
            <TableHeader>
              <TableColumn>ID</TableColumn>
              <TableColumn>NOMBRE</TableColumn>
              <TableColumn>ACCIONES</TableColumn>
            </TableHeader>
            <TableBody emptyContent="No hay categorías registradas.">
              {currentCategorias.map((cat) => (
                <TableRow key={cat.id}>
                  <TableCell>{cat.id}</TableCell>
                  <TableCell>{cat.nombre}</TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      isIconOnly
                      onPress={() => {
                        setSelectedCategoria(cat);
                        setIsFormOpen(true);
                      }}
                    >
                      <FaEdit />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Paginación */}
          <div className="flex justify-center items-center gap-4 mt-6">
            <Button
              isDisabled={currentPage === 1}
              onPress={() => setCurrentPage((prev) => prev - 1)}
              size="sm"
            >
              Anterior
            </Button>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Página {currentPage} de {totalPages}
            </span>
            <Button
              isDisabled={currentPage === totalPages}
              onPress={() => setCurrentPage((prev) => prev + 1)}
              size="sm"
            >
              Siguiente
            </Button>
          </div>
        </CardBody>
      </Card>

      <TipoCategoriaForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmit}
        isSubmitting={manageLoading}
        categoria={selectedCategoria}
        error={manageError}
      />
    </div>
  );
};

export default Categorias;
