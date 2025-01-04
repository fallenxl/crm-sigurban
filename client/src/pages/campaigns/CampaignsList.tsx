import { useEffect, useState } from "react";
import { Table } from "../../component/table/Table";
import { Layout } from "../Layout";
import { deleteCampaign, getAllCampaigns } from "../../services/campaign";
import { getFormattedDate } from "../../utils";
import Swal from "sweetalert2";
import { errorAlert, successAlert } from "../../component/alerts/Alerts";

export function CampaignsList() {
  const [isLoading, setIsLoading] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  useEffect(() => {
    setIsLoading(true);
    getAllCampaigns().then((res) => {
      setIsLoading(false);
      setCampaigns(res);
    });
  }, []);
  const handleDelete = (id: string) => {
    Swal.fire({
      title: "¿Estas seguro?",
      text: "No podrás revertir esta acción",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Si, eliminar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteCampaign(id).then((res) => {
          if (!res || typeof res === "string") {
            return errorAlert(
              "No se pudo eliminar la campaña",
              res ?? "No se pudo eliminar la campaña"
            );
          }
          successAlert(
            "Campaña eliminada correctamente",
            "Se ha eliminado la campaña correctamente"
          );
          setCampaigns(
            campaigns.filter((campaign: any) => campaign._id !== id)
          );
        });
      }
    });
  };

  const tableHead = [
    {
      key: "name",
      value:"Nombre de la campaña"
    },
    {
      key: "description",
      value:"Descripción"
    },
    {
      key: "startDate",
      value:"Inicio"
    },
    {
      key: "endDate",
      value:"Finalización"
    },
    {
      key: "status",
      value:"Estado"
    },
  ];
  const tableRows = campaigns.map((campaign: any) => {
    return {
      id: campaign._id,
      name: campaign.name,
      description: campaign.description ?? "Sin descripción",
      startDate: campaign.startDate
        ? getFormattedDate(campaign.startDate)
        : "Sin fecha de inicio",
      endDate: campaign.endDate
        ? getFormattedDate(campaign.endDate)
        : "Sin fecha de finalización",
      status: campaign.status? "Activa" : "Inactiva",
    };
  });
  return (
    <Layout title="Lista de campañas">
      <Table
        isLoading={isLoading}
        path="/campañas/"
        tableHead={tableHead}
        tableRows={tableRows}
        title="Lista de campañas"
        description="Lista de todos las campañas"
        handleDelete={handleDelete}
      />
    </Layout>
  );
}
