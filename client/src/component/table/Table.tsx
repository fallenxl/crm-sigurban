import { PencilIcon, TrashIcon } from "@heroicons/react/24/solid";
import {
  Card,
  CardHeader,
  CardBody,
  Chip,
  CardFooter,
  IconButton,
} from "@material-tailwind/react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { AppStore } from "../../redux/store";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpDownIcon,
} from "@heroicons/react/24/outline";
import { SkeletonRow } from "./SkeletonRow";
import { useEffect, useState } from "react";
import { paginateArray } from "../../utils";
import { Input } from "../inputs/input";
import { getStatusColor } from "../../utils/charts";

interface Props {
  title: string;
  description?: string;
  tableHead: {
    key: string;
    value: string;
  }[];
  tableRows: any[];
  role?: string;
  path: string;
  handleDelete?: (id: string) => void;
  isLoading?: boolean;
  children?: React.ReactNode;
  searchInput?: boolean;
  actions?: boolean;
}
export function Table({
  title,
  description,
  tableHead,
  tableRows,
  handleDelete,
  path,
  isLoading,
  children,
  searchInput,
  actions = true,
}: Props) {
  const { user } = useSelector((state: AppStore) => state.auth);
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState<any[]>(tableRows);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [totalPages, setTotalPages] = useState(0);

  const handleSearch = (e: any) => {
    setSearch(e.target.value);
  };

  const handleNext = () => {
    setCurrentPage((prev) => prev + 1);
    const { paginatedItems, hasNext, hasPrevious, totalPages } = paginateArray(
      tableRows,
      rowsPerPage,
      currentPage
    );
    setFiltered(paginatedItems);
    setHasNext(hasNext);
    setHasPrevious(hasPrevious);
    setTotalPages(totalPages);
  };

  const handlePrevious = () => {
    setCurrentPage(currentPage - 1);
    const { paginatedItems, hasNext, hasPrevious, totalPages } = paginateArray(
      tableRows,
      rowsPerPage,
      currentPage - 1
    );
    setFiltered(paginatedItems);
    setHasNext(hasNext);
    setHasPrevious(hasPrevious);
    setTotalPages(totalPages);
  };
  useEffect(() => {
    const { paginatedItems, hasNext, hasPrevious, totalPages } = paginateArray(
      tableRows,
      rowsPerPage,
      currentPage
    );
    if (search) {
      // set search query param to URL
      const params = new URLSearchParams();
      params.append("search", search);
      window.history.pushState({}, "", `?${params.toString()}`);

      setFiltered(
        
        tableRows.filter((row) =>
            Object.values(row).some((value:any) =>
                value.toString().toLowerCase().includes(search.toLowerCase())
            )
        )
      );
    } else {
      const params = new URLSearchParams();
      params.delete("search");
      window.history.pushState({}, "", `?${params.toString()}`);
      setFiltered(paginatedItems);
      setHasNext(hasNext);
      setHasPrevious(hasPrevious);
      setTotalPages(totalPages);
    }
  }, [search, tableRows, currentPage, rowsPerPage]);

  const [typeSort, setTypeSort] = useState<"asc" | "desc">("asc");

  const handleSortColumn = (column: string) => {
    const sorted = [...filtered].sort((a, b) => {
      if (typeSort === "asc") {
        return a[column] > b[column] ? 1 : -1;
      } else {
        return a[column] < b[column] ? 1 : -1;
      }
    });
    console.log(filtered);
    setFiltered(sorted);
    setTypeSort(typeSort === "asc" ? "desc" : "asc");
  }

  return (
    <Card className="h-full mx-auto w-full p-4 m-0 ">
      <CardHeader floated={false} shadow={false} className="rounded-none" >
        <div className="mb-8 flex items-center justify-between gap-4">
          <div className="flex flex-col gap-5">
            <span className="font-bold text-xl">{title}</span>
            <small color="gray" className="mt-1 font-normal">
              {description}
            </small>
          </div>
          {/* search */}
        </div>
        <div className="flex flex-col-reverse md:flex-row items-center justify-between  w-full gap-5">
          <div className="flex  items-center gap-4">
            <select
              onChange={(e) => {
                setRowsPerPage(parseInt(e.target.value));
                setCurrentPage(1);
              }}
              className="rounded-md bg-gray-100 text-sm text-gray-700 ml-4 p-3 flex justify-end"
            >
              <option className="p-2" value="10">
                10 por página
              </option>
              <option value="25">25 por página</option>
              <option value="50">50 por página</option>
              <option value="100">100 por página</option>
            </select>
            {children}
          </div>
         {searchInput && <div className="w-full md:w-2/3 flex flex-row-reverse">
            <Input
              onChange={handleSearch}
              placeholder="Buscar... "
              value={search}
            />
          </div>}
        </div>
      </CardHeader>
      <CardBody className="overflow-x-scroll md:overflow-auto px-0">
        <table className="mt-4 w-full  table-auto text-left border">
          <thead>
            <tr>
              {tableHead.map((head) => (
                <th
                  key={head.key}
                  onClick={() => handleSortColumn(head.key)}
                  className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4 cursor-pointer hover:bg-blue-gray-50 "
                >
                  <span className="font-bold leading-none opacity-90 flex justify-between text-sm">
                    {head.value}
                    <ChevronUpDownIcon className="w-4 h-4 inline-block ml-1" />
                  </span>
                </th>
              ))}
            {actions &&  <th className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4">
                <span className="font-bold leading-none opacity-90 text-sm">
                  Acciones
                </span>
              </th>}
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map((item, index) => {
                const isLast = index === tableRows.length - 1;
                const classes = isLast
                  ? "p-4"
                  : "p-4 ";

                return (
                  <tr key={item._id} className="border-b border-blue-gray-50">
                    {Object.keys(item).map((value, _index) => {
                      return (
                        <>
                          {value !== "id" && (
                            <td key={index} className={classes}>
                              <div className="flex items-center">
                                {value === "status" ? (
                                  <Chip
                                    value={item[value]}
                                    style={{ backgroundColor: getStatusColor(item[value]) }}
                                  />
                                ) : value === "date" ? (
                                  <Chip
                                    value={item[value]}
                                    className="bg-gray-400"
                                  />
                                ) : (
                                  <span className="text-sm text-gray-700">
                                    {item[value]}
                                  </span>
                                )}
                              </div>
                            </td>
                          )}
                        </>
                      );
                    })}

                  {actions &&  <td className={classes + " flex gap-x-2"}>
                      {/* Boton de editar */}
                      <div className="flex items-center gap-x-2">
                        <Link replace={true} to={path + item["id"]}>
                          <IconButton
                            className="w-8 h-8 p-2 bg-gray-400"
                            aria-label="Delete lead"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </IconButton>
                        </Link>
                      </div>
                      {/* Boton de eliminar */}
                      {item["role"] !== "Super Administrador" &&
                        user.role === "ADMIN" && (
                          <div className="flex items-center gap-x-2">
                            <IconButton
                              onClick={() =>
                                handleDelete && handleDelete(item.id)
                              }
                              className="w-8 h-8 p-2 bg-gray-400 hover:bg-red-400"
                              aria-label="Delete lead"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </IconButton>
                          </div>
                        )}
                    </td>}
                  </tr>
                );
              })
            ) : isLoading ? (
              <SkeletonRow cols={tableHead.length + 1} rows={5} />
            ) : (
              <tr>
                <td
                  className="text-center p-2 mb-2 text-sm text-gray-200"
                  colSpan={tableHead.length + 1}
                >
                  <span className="p-4 text-gray-600 font-medium">
                    No hay registros
                  </span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </CardBody>
      <CardFooter className="flex items-center justify-between border-t border-blue-gray-50 p-4">
        <span className="font-normal text-sm">{`Pagina ${currentPage} de ${totalPages == 0? 1 : totalPages}`}</span>
        <div className="flex gap-2 text-sm">
          {hasPrevious && (
            <button
              onClick={handlePrevious}
              className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-gray-100"
            >
              <ChevronLeftIcon className="w-4 h-4 inline-block ml-1" />
              Anterior
            </button>
          )}
          {hasNext && (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-gray-100"
            >
              Siguiente
              <ChevronRightIcon className="w-4 h-4 inline-block ml-1" />
            </button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
