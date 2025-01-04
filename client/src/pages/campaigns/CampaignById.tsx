import { useParams } from "react-router-dom";
import { Layout } from "../Layout";
import { useEffect, useState } from "react";
import { Card, Chip, Switch} from "@material-tailwind/react";
import {
  CalendarDaysIcon,
  IdentificationIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";
import { isError, validateID } from "../../utils/redirects";
import { getCampaignByID, updateCampaignByID } from "../../services/campaign";
import { getFormattedDate } from "../../utils";
import { Input } from "../../component/inputs/input";
import {TextArea} from "../../component/inputs/textarea.tsx";

export const CampaignById = () => {
  const { id } = useParams<{ id: string }>();
  validateID(id ?? "");
  const [campaign, setCampaign] = useState({
    _id: "",
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    status: true,
  });
  const [updateCampaign, setUpdateCampaign] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    status: true,
  });
  useEffect(() => {
    if (!id) return;
    getCampaignByID(id).then((res) => {
      if (!res || typeof res === "string") {
        return isError(true);
      }

      setCampaign(res.data);
      setUpdateCampaign({
        name: res.data.name,
        description: res.data.description,
        startDate: res.data.startDate,
        endDate: res.data.endDate,
        status: res.data.status,
      });
    });
  }, [id]);

  const [edit, setEdit] = useState(true);
  const handleEdit = () => {
    if (!edit) {
      setUpdateCampaign({
        name: campaign.name,
        description: campaign.description,
        startDate: campaign.startDate,
        endDate: campaign.endDate,
        status: campaign.status,
      });
    }
    setEdit(!edit);
  };

  const handleUpdateCampaignChange = (e: any) => {
    setUpdateCampaign({
      ...updateCampaign,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdateCampaignStatusChange = (e: any) => {
    updateCampaignByID(id ?? "", {
      ...updateCampaign,
      status: e.target.checked,
    }).then((res) => {
      if (!res || typeof res === "string") {
        return isError(true);
      }
      setCampaign(res.data);
      setUpdateCampaign(res.data);
      setEdit(true);
    });
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    alert(JSON.stringify(updateCampaign));
    updateCampaignByID(id ?? "", updateCampaign).then((res) => {
      if (!res || typeof res === "string") {
        return isError(true);
      }
      setCampaign(res.data);
      setUpdateCampaign(res.data);
      setEdit(true);
    });
  };
  return (
    <Layout title={campaign.name ?? "Campaña"}>
      <Card className="h-full w-full lg:w-9/12  p-0 lg:p-10 ">
        <div className="mb-8 lg:grid grid-cols-12 ">
          {/* Lead info */}
          <div className="w-full col-start-1 col-end-13 flex flex-col items-center p-4">
            <div className="w-full flex justify-between py-2">
              <span>Información</span>
              <button
                onClick={handleEdit}
                className="flex gap-x-2 items-center"
              >
                <span className="text-xs hover:text-blue-500 cursor-pointer">
                  Editar
                </span>
                <PencilSquareIcon className="w-4 h-4 " />
              </button>
            </div>
            <hr className="w-full mb-2" />
            <div className="w-full flex flex-col justify-center items-end mr-5">
              <Switch
                onChange={handleUpdateCampaignStatusChange}
                name="status"
                label={
                  <Chip
                    color={updateCampaign.status ? "green" : "red"}
                    value={updateCampaign.status ? "Activo" : "Inactivo"}
                  />
                }
                crossOrigin={undefined}
                color="blue"
                checked={updateCampaign.status}
              />
            </div>
            {/* Lead details form */}
            <form
                onSubmit={handleSubmit}
                action=""
                className="w-full flex flex-col gap-y-2 p-4"
            >

              <div className="flex items-center gap-x-2  w-full">
                <IdentificationIcon className="w-5 h-5"/>
                <Input
                    name="name"
                    onChange={handleUpdateCampaignChange}
                    label="Nombre de la Campaña"
                    value={updateCampaign.name}
                    disabled={edit}
                />
              </div>
              <label className="ml-8 text-gray-700 text-xs ">Descripción</label>
              <div className="flex items-center gap-x-2  w-full">
                <IdentificationIcon className="w-5 h-5"/>
                <TextArea
                    onChange={handleUpdateCampaignChange}
                    name="description"
                    disabled={edit}
                    label="Descripción"
                    value={updateCampaign.description}
                />
              </div>
              <div className="flex items-center gap-x-2  w-full">
                <CalendarDaysIcon className="w-5 h-5"/>
                <Input
                    name="startDate"
                    onChange={handleUpdateCampaignChange}
                    label="Fecha de inicio"
                    type="date"
                    value={getFormattedDate(updateCampaign.startDate ?? "")}
                    disabled={edit}
                />
              </div>

              <div className="flex items-center gap-x-2  w-full">
                <CalendarDaysIcon className="w-5 h-5"/>
                <Input
                    name="endDate"
                    onChange={handleUpdateCampaignChange}
                    label="Fecha de finalización"
                    type="date"
                    value={getFormattedDate(updateCampaign.endDate ?? "")}
                    disabled={edit}
                />
              </div>

              {!edit && (
                  <>
                    <div className="flex items-center gap-2 flex-row-reverse">
                      <div className="flex flex-row-reverse">
                        <button className="bg-blue-500 px-4 py-2 rounded-md  text-white">
                          Guardar
                        </button>
                      </div>
                      <div className="flex flex-row-reverse">
                      <span
                          onClick={handleEdit}
                          className="bg-gray-500 hover:bg-red-500 cursor-pointer px-4 py-2 rounded-md  text-white"
                      >
                        Cancelar
                      </span>
                      </div>
                    </div>
                  </>
              )}
            </form>
          </div>
        </div>
      </Card>
    </Layout>
  );
};
