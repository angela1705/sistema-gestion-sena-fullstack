// src/components/global/Tabla.tsx
import React, { useState } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Pagination,
  Select,
  SelectItem,
} from "@nextui-org/react";

interface Column {
  uid: string;
  name: string;
  render?: (data: any, row: any, senaEmpresas: any[]) => React.ReactNode;
}

interface TablaProps {
  columns: Column[];
  data: any[] | { count: number; next: string | null; previous: string | null; results: any[] } | undefined;
  searchableFields?: string[];
  extraControls?: React.ReactNode;
  senaEmpresas?: any[];
  onRowsPerPageChange?: (value: number) => void;
}

const Tabla: React.FC<TablaProps> = ({
  columns,
  data = [],
  searchableFields = ["nombre"],
  extraControls,
  senaEmpresas = [],
  onRowsPerPageChange,
}) => {
  const [filterValue, setFilterValue] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Normalizar data para que siempre sea un array
  const normalizedData = Array.isArray(data) ? data : data?.results || [];
  console.log("Tabla Props - Data:", data, "Normalized Data:", normalizedData, "SenaEmpresas:", senaEmpresas);

  const filteredItems = normalizedData.filter((item: any) =>
    searchableFields.some((field) => {
      const value = item[field] || "";
      return value.toString().toLowerCase().includes(filterValue.toLowerCase());
    })
  );

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

  const handleRowsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRowsPerPage = Number(e.target.value);
    setRowsPerPage(newRowsPerPage);
    setPage(1);
    if (onRowsPerPageChange) onRowsPerPageChange(newRowsPerPage);
  };

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-3">
        <Input
          isClearable
          className="w-full sm:w-1/3"
          placeholder="Buscar por nombre, apellido o identificación"
          value={filterValue}
          onClear={onClear}
          onValueChange={onSearchChange}
        />
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-gray-600 dark:text-gray-400 text-sm">Filas por página:</span>
            <Select
              defaultSelectedKeys={["5"]}
              className="w-20"
              size="sm"
              onChange={handleRowsPerPageChange}
              aria-label="filasSelector"
            >
              <SelectItem key="5" value="5">5</SelectItem>
              <SelectItem key="10" value="10">10</SelectItem>
              <SelectItem key="15" value="15">15</SelectItem>
            </Select>
          </div>
          {extraControls}
        </div>
      </div>
      <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <Table aria-label="Tabla de usuarios" className="w-full">
          <TableHeader>
            {columns.map((column) => (
              <TableColumn
                key={column.uid}
                className="text-center text-sm bg-gray-200 dark:bg-gray-700"
              >
                {column.name}
              </TableColumn>
            ))}
          </TableHeader>
          <TableBody>
            {items.map((item, index) => (
              <TableRow
                key={item.id || index}
                className={index % 2 === 0 ? "bg-gray-50 dark:bg-gray-900" : "bg-white dark:bg-gray-800"}
              >
                {columns.map((column) => (
                  <TableCell key={column.uid} className="text-center text-sm whitespace-nowrap">
                    {column.render
                      ? column.render(item[column.uid], item, senaEmpresas)
                      : item[column.uid] ?? "N/A"}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="flex justify-center p-2">
          <Pagination
            isCompact
            showControls
            color="primary"
            page={page}
            total={pages}
            onChange={setPage}
          />
        </div>
      </div>
    </div>
  );
};

export default Tabla;