import { Chip } from "@material-tailwind/react";
import { currencyFormatToLempiras } from "../../../../utils";
import { useEffect, useState } from "react";
import { getAllProjects } from "../../../../services/projects.services";
import {
  getLotByID,
  getLotsByProjectAndStatus,
} from "../../../../services/lots.services";

interface Props {
  setProjectSelected: React.Dispatch<
    React.SetStateAction<{
      projectID: string;
      lotID: string;
    }>
  >;
}
interface Lot {
  _id: string;
  lot: string;
  block?: string;
  area: number;
  price: number;
  status: string;
  reservedBy: string | null;
  reservationDate: string | null;
}

interface Project {
  _id: string;
  name: string;
  houses: [];
}
export const ToAssignProject = ({ setProjectSelected }: Props) => {
  const [projects, setProjects] = useState<Project[]>([]);
  useEffect(() => {
    getAllProjects().then((res) => {
      setProjects(res?.data);
    });
  }, []);

  const [projectID, setProjectID] = useState<string>("");

  const [lotID, setLotID] = useState<string>("");
  const [lots, setLots] = useState<Lot[]>([]);
  const [lotInfo, setLotInfo] = useState<Lot | null>(null);

  useEffect(() => {
    if (projectID) {
      getLotsByProjectAndStatus(projectID, "Disponible").then((res) => {
        setLots(res?.data);
      });
    }
  }, [projectID]);

  const handleSelectProject = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setProjectID(e.target.value);
    setLotID("");
    setProjectSelected({ projectID: e.target.value, lotID: "" });
  };

  const handleSelectLot = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLotID(e.target.value);
    setProjectSelected({ projectID, lotID: e.target.value });
  };

  useEffect(() => {
    getLotByID(lotID).then((res) => {
      setLotInfo(res?.data);
    });
  }, [projectID, lotID]);

  return (
    <>
      <label htmlFor="selectAdvisor">Seleccionar un proyecto:</label>
      <select
        name="projectName"
        className="border border-gray-300 rounded-md p-2"
        onChange={handleSelectProject}
        value={projectID}
      >
        <option value="" defaultChecked disabled>
          Seleccionar proyecto
        </option>
        {projects?.map((project) => {
          return (
            <option key={project._id} value={project._id}>
              {project.name}
            </option>
          );
        })}
      </select>
      {projectID && (
        <>
          <div className="flex gap-x-4 items-center">
            <label htmlFor="selectAdvisor" className="w-full">
              Seleccionar lote disponible:
            </label>
            <select
              name="lot"
              className="border border-gray-300 rounded-md p-2 text-gray-900 w-full"
              onChange={handleSelectLot}
              value={lotID}
            >
              <option value="" defaultChecked disabled>
                Seleccionar lote
              </option>
              {lots.length > 0 &&
                lots.sort((a, b) => parseInt(a.lot) - parseInt(b.lot)).map((lot) => {
                  return (
                    <option key={lot.lot} value={lot._id}>
                      {lot.block ? lot.block + " - " + lot.lot : lot.lot}
                    </option>
                  );
                })}
            </select>
          </div>
        </>
      )}
      {lotID && lotInfo && (
        <>
          <div className="flex flex-col gap-y-2">
            <div className="flex justify-between">
              <h3 className="text-lg font-bold text-gray-700">
                Información del Lote
              </h3>
              <Chip
                color={
                  lotInfo.status === "Disponible"
                    ? "green"
                    : "Liquidado"
                    ? "red"
                    : "blue"
                }
                value={lotInfo.status}
              />
            </div>

            <div className="flex flex-col">
              <div className="flex flex-row justify-between">
                <p className="font-bold text-gray-600">Bloque:</p>
                <p className="text-gray-600 font-medium">
                  {lotInfo?.block ?? "N/A"}
                </p>
              </div>
              <div className="flex flex-row justify-between">
                <p className="font-bold text-gray-600">Lote:</p>
                <p className="text-gray-600 font-medium">{lotInfo?.lot}</p>
              </div>
              <div className="flex flex-row justify-between">
                <p className="font-bold text-gray-600">Area:</p>
                <p className="text-gray-600 font-medium">
                  {lotInfo?.area + "V²"}
                </p>
              </div>
              <div className="flex flex-row justify-between">
                <p className="font-bold text-gray-600">Precio:</p>
                <p className="text-gray-600 font-medium">
                  {currencyFormatToLempiras(lotInfo.price?.toString())}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};
