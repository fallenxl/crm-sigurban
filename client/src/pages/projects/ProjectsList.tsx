import { useEffect, useState } from "react";
import { Table } from "../../component/table/Table";
import { Layout } from "../Layout";

import { deleteProjectById, getAllProjects } from "../../services/projects.services";
import Swal from "sweetalert2";
import { errorAlert, successAlert } from "../../component/alerts/Alerts";

export function ProjectsList() {
  const [isLoading, setIsLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  useEffect(() => {
    setIsLoading(true);
    getAllProjects().then((res) => {
      setProjects(res?.data);
      setIsLoading(false);
    });
  }, []);
  const tableHead = [{
    key: "name",
    value: "Nombre del proyecto",
  },
  {
    key: "description",
    value: "Descripción",
  }];
  
  const tableRows = projects.map((project: any) => {
    return {
      id: project._id,
      name: project.name,
      description: project.description,
    };
  });

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
        deleteProjectById(id).then((res : any) => {
          if(typeof res === "string"){
           return errorAlert('Oops!',res);
          }

          setProjects(projects.filter((project: any) => project._id !== id));
          successAlert("Exito", "Proyecto eliminado correctamente.");
        }
        );
      }
    });
  }
  return (
    <Layout title="Lista de Proyectos">
      <Table
        isLoading={isLoading}
        path="/proyectos/"
        tableHead={tableHead}
        tableRows={tableRows}
        title="Lista de proyectos"
        description="Lista de todos los proyectos registrados en el sistema."
        handleDelete={handleDelete}
      />
    </Layout>
  );
}
