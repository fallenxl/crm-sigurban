import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getLotByID, updateLotService} from "../../services/lots.services.ts";
import { Layout } from "../Layout.tsx";
import { capitalizeFirstLetterByWord } from "../../utils/utilities.ts";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import { Card } from "@material-tailwind/react";
import { Input } from "../../component/inputs/input.tsx";
import { formatCurrency } from "../../utils/currencyFormat.ts";
import { TextArea } from "../../component/inputs/textarea.tsx";
import { useSelector } from "react-redux";
import { AppStore } from "../../redux/store.ts";
import { getLeadsWithoutLot, updateLeadProjectDetailsService} from "../../services/lead.services.ts";
import { errorAlert, successAlert } from "../../component/alerts/Alerts.tsx";

export function LotById() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [edit, setEdit] = useState(false);
  const [lot, setLot] = useState<{
    area: number;
    block: string;
    lot: number;
    price: number;
    status: "Disponible" | "Reservado" | "Liquidado";
    projectID: {
      name: string;
      _id: string;
    };
    reservationDate: Date;
    reservedBy: {
      name: string;
      phone: string;
      _id: string;
    };
    svgPath?: string;
    _id: string;
  } | null>(null);
  const [leads, setLeads] = useState<
    {
      name: string;
      _id: string;
    }[]
  >([]);
  const [updateLot, setUpdateLot] = useState<{
    area: number;
    block: string;
    lot: number;
    price: number;
    status: "Disponible" | "Reservado" | "Liquidado";
    projectID: {
      name: string;
      _id: string;
    };
    reservationDate: Date;
    reservedBy:
      | {
          name: string;
          phone: string;
          _id: string;
        }
      ;
    svgPath?: string;
    _id: string;
  }>({
    area: 0,
    block: "",
    lot: 0,
    price: 0,
    status: "Disponible",
    projectID: {
      name: "",
      _id: "",
    },
    reservationDate: new Date(),
    reservedBy: {
      name: "",
      phone: "",
      _id: "",
    },
    svgPath: "",
    _id: "",
  });
  const user = useSelector((state: AppStore) => state.auth.user);
  useEffect(() => {
    if (id === undefined) return navigate("/lotes");
    getLotByID(id).then((res) => {
      if (typeof res === "string") return navigate("/404");
      setLot(res.data);
      setUpdateLot(res.data);
    });
  }, [id]);

  function handleEdit() {
    setEdit(!edit);
  }
  function handleChange(e: any) {
    setUpdateLot({
      ...updateLot,
      [e.target.name]: e.target.value,
    });
  }

  useEffect(() => {
    getLeadsWithoutLot().then((res) => {
      if (typeof res === "string") return;
      setLeads(res?.data);
      // setUpdateLot({
      //   ...updateLot,
      //   reservedBy: res?.data[0]._id,
      // });
    });
  }, [updateLot.reservedBy]);

  function handleSubmit() {
    const reservationDate = lot?.reservedBy?._id !== updateLot.reservedBy?._id ? new Date() : lot?.reservationDate;
    const payload = {
      ...updateLot,
      reservedBy:
        updateLot.status === "Disponible"
          ? null
          : (typeof updateLot.reservedBy === "string")
          ? updateLot.reservedBy
          : updateLot.reservedBy === null ? null : updateLot.reservedBy._id,
      projectID: updateLot.projectID._id,
      reservationDate: reservationDate}
      console.log(payload);
    if(updateLot.status === 'Reservado' && updateLot.reservedBy === null) return errorAlert('Error', 'Selecciona un prospecto para reservar el lote')
      console.log(payload);
    updateLotService(payload).then((res) => {
        if (typeof res === "string") return errorAlert("Error", res);
        if(lot?.reservedBy?._id !== updateLot.reservedBy?._id ){
            updateLeadProjectDetailsService(payload.reservedBy!, {
                lotID: updateLot._id,
                projectID: updateLot.projectID._id,
            }).then((_res) => {});
            if(lot?.reservedBy?._id){
                updateLeadProjectDetailsService(lot.reservedBy._id, {projectDetails: null}).then((res) => {
                    if (typeof res === "string") return errorAlert("Error", res);
                });
            }
        }else if(updateLot.reservedBy === null && lot?.reservedBy?._id){
            updateLeadProjectDetailsService(lot.reservedBy._id, {projectDetails: null}).then((res) => {
                if (typeof res === "string") return errorAlert("Error", res);
            });
        }else {
            updateLotService(payload).then((_res) => {});
        }
        successAlert("Éxito", "Lote actualizado correctamente");
        setEdit(false);
    });
  }

  return (
    <Layout
      title={`Lote  ${updateLot?.block}${
        updateLot?.lot
      } - ${capitalizeFirstLetterByWord(updateLot?.projectID.name ?? "")}`}
    >
      <Card className="h-full w-full lg:w-9/12 p-2 md:p-10 ">
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
            {/* Lead details form */}
            <div className="w-full flex flex-col gap-y-2 p-4">
              <div className="flex flex-col gap-y-2 md:flex-row items-center gap-x-6  w-full justify-end ">
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <label className="text-sm w-1/4 md:w-auto">Estado:</label>
                  <select
                    name="status"
                    value={updateLot.status}
                    onChange={handleChange}
                    disabled={!edit}
                    className="border w-full md:w-auto border-gray-300 px-4 py-2 rounded-md self-end justify-self-end"
                  >
                    <option value="Disponible">Disponible</option>
                    {/* <option value="Reservado">Reservado</option> */}
                    <option value="Liquidado">Liquidado</option>
                  </select>
                </div>
                {updateLot.status !== "Disponible" && (
                  <div className="flex items-center gap-2 w-full md:w-auto">
                    <label className="text-sm w-1/4 md:w-auto">
                      Reservado por:
                    </label>
                    <select
                      name="reservedBy"
                      onChange={handleChange}
                      required={updateLot.status === "Reservado"}
                      value={
                         updateLot.reservedBy as unknown as string 
                      }
                      disabled={!edit}
                      className="border overflow-auto w-full md:w-auto border-gray-300 px-4 py-2 rounded-md self-end justify-self-end"
                    >
                      {lot?.reservedBy ? (
                        <option value={lot?.reservedBy._id} key={lot?.reservedBy._id} defaultChecked>
                          {lot?.reservedBy.name}
                        </option>
                      ) : (
                        <option value="" >
                          Selecciona un prospecto
                        </option>
                      )}
                      {leads.map((lead) => {
                        return (
                          <option value={lead._id} key={lead._id} defaultChecked={lot?.reservedBy?._id? false : true}>
                            {lead.name}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-x-2  w-full">
                <Input
                  name="lot"
                  onChange={handleChange}
                  label="Lote"
                  value={updateLot.lot}
                  disabled={!edit}
                  type="number"
                  min={0}
                />
              </div>
              <div className="flex items-center gap-x-2  w-full">
                <Input
                  onChange={handleChange}
                  name="block"
                  disabled={!edit}
                  label="Bloque"
                  value={updateLot.block}
                />
              </div>
              <div className="flex items-center gap-x-2  w-full">
                <Input
                  onChange={handleChange}
                  name="area"
                  disabled={!edit}
                  label="Área"
                  value={updateLot.area}
                  type="number"
                  min={0}
                />
              </div>
              <div className="flex items-center gap-x-2  w-full">
                <Input
                  onChange={handleChange}
                  name="price"
                  disabled={!edit}
                  label="Precio"
                  value={
                    edit ? updateLot.price : formatCurrency(updateLot.price)
                  }
                  type={edit ? "number" : "text"}
                  min={0}
                />
              </div>
              {/* svg path*/}
              {user.role === "ADMIN" && (
                <div className="flex items-center gap-x-2  w-full">
                  <TextArea
                    onChange={handleChange}
                    name="svgPath"
                    disabled={!edit}
                    label="Ruta del SVG"
                    value={updateLot.svgPath}
                  />
                </div>
              )}

              {edit && (
                <>
                  <div className="flex items-center gap-2 flex-row-reverse mt-10">
                    <div className="flex flex-row-reverse">
                      <button
                        onClick={handleSubmit}
                        type="submit"
                        className="bg-blue-500 px-4 py-2 rounded-md  text-white"
                      >
                        Guardar
                      </button>
                    </div>
                    <div className="flex flex-row-reverse">
                      <span
                        // onClick={handleEdit}
                        className="bg-gray-500 hover:bg-red-500 cursor-pointer px-4 py-2 rounded-md  text-white"
                      >
                        Cancelar
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </Card>
    </Layout>
  );
}
