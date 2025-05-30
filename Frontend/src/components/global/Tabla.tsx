import React, { useState } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Button,
  Pagination,
} from "@heroui/react";

interface Column {
  uid: string;
  name: string;
}

interface TablaProps {
  columns: Column[];
  data: any[];
}

const Tabla: React.FC<TablaProps> = ({ columns, data }) => {
  const [filterValue, setFilterValue] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const filteredItems = data.filter((item) => {
    const searchField = item.nombre || item.ubicacion || item.descripcion ||"";  
    return searchField.toLowerCase().includes(filterValue.toLowerCase());
  });
  
  const pages = Math.ceil(filteredItems.length / rowsPerPage);

  const items = filteredItems.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const onSearchChange = (value: string) => {
    setFilterValue(value);
    setPage(1);
  };

  const onClear = () => {
    setFilterValue("");
    setPage(1);
  };

  const onRowsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number(e.target.value));
    setPage(1);
  };

  return (
    <div>
      <div className="flex justify-between gap-3 items-end mb-4">
        <Input
          isClearable
          className="w-full sm:max-w-[44%]"
          placeholder="Buscar por nombre"
          value={filterValue}
          onClear={onClear}
          onValueChange={onSearchChange}
        />
        <label className="flex items-center text-default-400 text-small">
          Filas:
          <select
            className="bg-transparent outline-none text-default-400 text-small"
            onChange={onRowsPerPageChange}
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="15">15</option>
          </select>
        </label>
      </div>
      <Table>
        <TableHeader>
          {columns.map((column) => (
            <TableColumn key={column.uid}>{column.name}</TableColumn>
          ))}
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              {columns.map((column) => (
                <TableCell key={column.uid}>{item[column.uid]}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="py-2 px-2 flex justify-between items-center">
        <Pagination
          isCompact
          showControls
          showShadow
          color="primary"
          page={page}
          total={pages}
          onChange={setPage}
        />
        <div className="hidden sm:flex w-[30%] justify-end gap-2">
          <Button isDisabled={page === 1} size="sm" variant="flat" onPress={() => setPage(page - 1)}>
            Anterior
          </Button>
          <Button isDisabled={page === pages} size="sm" variant="flat" onPress={() => setPage(page + 1)}>
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Tabla;