import { useEffect, useState } from "react";
import { Table } from "../../component/table/Table";
import { Layout } from "../Layout";
import { deleteBankById, getAllBanks } from "../../services/bank.services";
import { successAlertWithRedirect } from "../../component/alerts/Alerts";

export const ListBanks = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [banks, setBanks] = useState([]);
  useEffect(() => {
    setIsLoading(true);
    getAllBanks().then((res) => {
      setIsLoading(false);
      setBanks(res);
    });
  }, []);
  const tableHead = [{
    key: "name",
    value: "Nombre del banco",
  },
  {
    key: "description",
    value: "Descripción",
  }];
  const tableRows = banks.map((bank: any) => {
    return {
      id: bank._id,
      name: bank.name,
      description: bank.description ?? "Sin descripción",
    };
  });
  const handleDelete = (id: string) => {
    deleteBankById(id).then((_res) => {
      successAlertWithRedirect(
        "Banco eliminado",
        "El banco se ha eliminado correctamente",
        "/bancos/lista"
      );
    });
  };
  return (
    <Layout title="Bancos">
      <Table
        isLoading={isLoading}
        tableHead={tableHead}
        tableRows={tableRows}
        title="Lista de Bancos"
        path="/bancos/"
        description="Lista de todos los bancos"
        handleDelete={handleDelete}
      />
    </Layout>
  );
};
