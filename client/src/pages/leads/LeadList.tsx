import { useEffect, useState } from "react";
import { Table } from "../../component/table/Table";
import { Layout } from "../Layout";
import { getDays } from "../../utils";
import { useSelector } from "react-redux";
import { AppStore } from "../../redux/store";
import { deleteLead, getLeadsByRole } from "../../services/lead.services";
import Swal from "sweetalert2";
import {
  errorAlertWithTimer,
  successAlertWithTimer,
} from "../../component/alerts/Alerts";
import { Roles } from "../../constants";

export function LeadList() {
  const query = new URLSearchParams(window.location.search);
  const [isLoading, setIsLoading] = useState(false);
  const [leads, setLeads] = useState([]);
  const { user } = useSelector((state: AppStore) => state.auth);
  const [filter, setFilter] = useState("");
  const handleFilter = (e: any) => {
    query.set("status", e.target.value);
    window.history.replaceState(
      {},
      "",
      `${window.location.pathname}?${query.toString()}`
    );
    setFilter(e.target.value);
  };
  const socket = useSelector((state: AppStore) => state.socket.socket);

  useEffect(() => {
    setIsLoading(true);
    if (user.role) {
      getLeadsByRole(user.role, user.id).then((res) => {
        setIsLoading(false);
        setLeads(
          filter ? res.filter((lead: any) => lead.status.type === filter) : res
        );
      });
    }
    socket.on("leadUpdated", (_data: any) => {
      getLeadsByRole(user.role as Roles, user.id).then((res) => {
        setLeads(
          filter ? res.filter((lead: any) => lead.status.type === filter) : res
        );
      });
    });

    if (query.get("status")) {
      setFilter(query.get("status")!);
    }
  }, [filter]);
  const handleDelete = (id: string) => {
    Swal.fire({
      title: "¿Estas seguro?",
      text: "No podrás revertir esta acción",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",

      confirmButtonText: "Si, eliminar",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteLead(id).then((res) => {
          if (typeof res === "string") {
            return errorAlertWithTimer("No se pudo eliminar el prospecto", res);
          }
          successAlertWithTimer(
            "Prospecto eliminado correctamente",
            "Se ha eliminado el prospecto correctamente"
          );
          setLeads(leads.filter((lead: any) => lead._id !== id));
        });
      }
    });
  };
  const statusList = [
    "Oportunidad de venta futura",
    "Pendiente de Llamar",
    "Por Asignar",
    "A Contactar",
    "Precalificar Buró",
    "Precalificar Banco",
    "Por Asignar Proyecto",
    "Por Asignar Modelo de Casa",
    "Prospecto Definido",
    "Cliente Potencial",
    "Enviado a Revision 1era Etapa",
    "Primera Etapa de Expediente",
    "Segunda Etapa de Expediente",
    "Enviado a Revision en Banco",
    "Revision de Expediente",
    "Enviar a Banco",
    "Anulado",
  ];

  const tableHead = [
    {
      key:"date",
      value: "Fecha",
    },
    {
      key:"name",
      value: "Nombre Completo",
    },
    {
      key:"dni",
      value: "DNI / Pasaporte / Carne de Residencia",
    },
    {
      key:"phone",
      value: "Teléfono",
    },
    {
      key:"status",
      value: "Estado",
    },
    {
      key:"advisor",
      value: "Asesor",
    },
  ];
  const tableRows = leads.map((lead: any) => {
    return {
      id: lead._id,
      date: getDays(lead.createdAt),
      name: lead.name,
      dni: lead.dni?.length > 0 ? lead.dni : lead.passport?.length > 0 ? lead.passport : lead.residenceNumber,
      phone: lead.phone,
      status: lead.status.type,
      advisor: lead.advisorID?.name ?? "No asignado",
    };
  });
  return (
    <Layout title="Lista de prospectos">
      <Table
        searchInput
        isLoading={isLoading}
        path="/prospectos/"
        tableHead={tableHead}
        tableRows={tableRows}
        title="Lista de prospectos"
        description="Lista de todos los prospectos"
        role={user.role}
        handleDelete={handleDelete}
      >
        <select
          className=" rounded-md bg-gray-100 text-sm text-gray-700 ml-4 p-3 flex justify-end"
          value={filter}
          onChange={handleFilter}
        >
          <option className="p-2" value="">
            Todos los prospectos
          </option>
          {statusList.map((status, index) => {
            return (
              <option key={index} className="p-2" value={status}>
                {status}
              </option>
            );
          })}
        </select>
      </Table>
    </Layout>
  );
}
