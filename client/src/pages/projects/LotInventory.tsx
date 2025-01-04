import { useEffect, useState } from "react";
import { Table } from "../../component/table/Table";
import { Layout } from "../Layout";
import { getAllLots } from "../../services/lots.services";

export function LotInventory() {
  const [isLoading, setIsLoading] = useState(false);
  const [lots, setLots] = useState([]);
  useEffect(() => {
    setIsLoading(true);
    getAllLots().then((res) => {
      setLots(res?.data);
      setIsLoading(false);
    });
  }, []);

  const tableHead = [{
    key: "project",
    value: "Proyecto",
  },
  {
    key: "block",
    value: "Bloque",
  },
  {
    key: "lot",
    value: "Lote",
  },
  {
    key: "area",
    value: "Área",
  },
  {
    key: "status",
    value: "Estado",
  }];
  
  const tableRows = lots.map((lot: any) => {
    return {
      id: lot._id,
      project: lot.projectID?.name ?? "NaN",
      block: lot.block.length > 0 ? lot.block : "N/A",
      lot: lot.lot,
      area: lot.area,
      status: lot.status,
    };
  });
  return (
    <Layout title="Inventario de Lotes">
      <Table
      actions={false}
        isLoading={isLoading}
        path="/users/"
        tableHead={tableHead}
        tableRows={tableRows}
        title="Inventario de Lotes"
        description="Lista de todos los lotes registrados"
      />
    </Layout>
  );
}
