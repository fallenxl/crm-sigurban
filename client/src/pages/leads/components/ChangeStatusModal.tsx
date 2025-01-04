import {
  Alert,
  Chip,
  DialogBody,
  DialogFooter,
  DialogHeader,
  Textarea,
} from "@material-tailwind/react";
import { getAllManager, getUsersByRole } from "../../../services/user.services";
import { useEffect, useState } from "react";
import {
  ExclamationTriangleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  deleteDocumentByLead,
  getLeadStatus,
  updateLeadStatus,
} from "../../../services/lead.services";
import { getAllBanks, getBankById } from "../../../services/bank.services";
import { Bank } from "../../../interfaces";
import { Loading } from "../../../component";
import { useDispatch, useSelector } from "react-redux";
import { setStatusChange } from "../../../redux/states/status.state";
import { Modal } from "../../../component/modal/Modal";
import { ToAssignProject } from "./status/ToAssignProject";
import { hasEmptyPropertiesExcept } from "../../../utils";
import { ToAssignModel } from "./status/ToAssignModel";
import { AppStore } from "../../../redux/store";
import { DocumentationState } from "./status/Documentation";
import { FirstStageOfTheFile } from "./status/FirstStageOfTheFile";
import { SecondStageOfTheFile } from "./status/SecondStageOfTheFile";
interface ChangeStatusModalProps {
  open: boolean;
  handleOpen: () => void;
  setLead?: () => void;
  lead?: any;
  updateLead?: any;
  setSocketTrigger?: any;
}

export const ChangeStatusModal = ({
  open,
  handleOpen,
  updateLead,
  lead,
}: ChangeStatusModalProps) => {
  const [status, setStatus] = useState({
    type: "",
    enum: [],
    selected: "",
    condition: null,
  });

  const user = useSelector((state: AppStore) => state.auth.user);

  const [users, setUsers] = useState([]);
  const [userSelected, setUserSelected] = useState("");
  const [date, setDate] = useState("");
  const handleDate = (e: any) => setDate(e.target.value);

  const [comment, setComment] = useState("");
  const handleChangeComment = (e: any) => setComment(e.target.value);
  const handleUserChange = (e: any) => {
    setUserSelected(e.target.value);
  };
  const [banks, setBanks] = useState([]);
  const [bankSelected, setBankSelected] = useState("");
  const handleBankChange = (e: any) => {
    setBankSelected(e.target.value);
  };

  const [projectSelected, setProjectSelected] = useState({
    projectID: "",
    lotID: "",
  });

  const [bank, setBank] = useState({} as Bank);
  const [banksAvailable, setBanksAvailable] = useState(true);
  const socket = useSelector((state: AppStore) => state.socket.socket);
  useEffect(() => {
    if (open) {
      getLeadStatus(lead._id).then((res) => {
        setStatus(res?.data);
        if (
          (res?.data.type === "Por Asignar" ||
            res?.data.type === "Prospecto" ||
            res?.data.type === "Oportunidad de venta futura") &&
          !lead.advisorID
        ) {
          getUsersByRole("ADVISOR").then((res) => {
            setUsers(res);
          });
        } else if (res?.data.type === "A Contactar") {
          getAllManager().then((res) => {
            setUsers(res);
            setUserSelected(res[0]._id);
          });
        } else if (res?.data.type === "Precalificar Buró") {
          getUsersByRole("BANK_MANAGER").then((res) => {
            setUsers(res);
          });
        }
      });

      getAllBanks().then((res) => {
        setBanks(res);
        setBanksAvailable(verifyBanksAvailable(res, lead.rejectedBanks));
      });
    }

    setError("");
  }, [open, status.type]);

  const verifyBanksAvailable = (banks: any, rejectedBanks: any) => {
    if (rejectedBanks.length === 0) return true;
    const availableBanks = banks.filter((bank: any) => {
      return !rejectedBanks.some(
        (rejectedBank: any) => rejectedBank._id === bank._id
      );
    });
    if (availableBanks.length > 0) return true;
    return false;
  };

  const [financingProgramSelected, setFinancingProgramSelected] = useState("");
  const handleFinancingProgramChange = (e: any) => {
    setFinancingProgramSelected(e.target.value);
  };
  useEffect(() => {
    getBankById(bankSelected).then((res) => {
      if (typeof res === "string") return;
      setBank(res?.data as Bank);
    });
  }, [bankSelected]);
  const handleSelect = (e: any) => {
    setStatus({
      ...status,
      selected: e.target.value,
    });

    if (status.selected === "A Contactar") {
      getUsersByRole("MANAGER").then((res) => {
        setUsers(res.data);
      });
    }
  };

  const [modelPayload, setModelPayload] = useState({} as any);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();

  const handleSubmit = async (e: any, cb?: Function) => {
    e.preventDefault();
    try {
      const payload =
        status.type === "A Contactar"
          ? {
              status: status.selected,
              managerID: userSelected,
              dateToCall: date,
              comment,
            }
          : status.type === "Prospecto" ||
            status.type === "Por Asignar" ||
            status.type === "Oportunidad de venta futura"
          ? {
              status: status.selected,
              advisorID: userSelected,
              dateToCall: date,
              comment,
            }
          : status.type === "Por Asignar Proyecto"
          ? {
              status: status.selected,
              projectID: projectSelected.projectID,
              lotID: projectSelected.lotID,
              comment,
            }
          : status.type === "Por Asignar Modelo de Casa"
          ? {
              status: status.selected,
              houseModel: modelPayload,
              comment,
            }
          : status.type === "Enviar a Banco"
          ? {
              status: status.selected,
              comment,
              ...sendToBankState,
            }
          : (status.type === "Cliente Potencial" || status.type === "Primera Etapa de Expediente" || status.type === 'Segunda Etapa de Expediente') ?{
              status: status.selected,
              documents: documentsState,
              comment,
          } :{
              status: status.selected,
              bankManagerID: lead.bankManagerID || userSelected,
              bankID: bankSelected,
              financingProgram: financingProgramSelected,
              dateToCall: date,
              comment,
            };
      if (status.selected === lead.status.selected) {
        return setError("Debe seleccionar un estado diferente");
      }
      const identityBlock = lead.dni.length > 0 ? ['passport', 'residenceNumber'] : lead.passport.length > 0 ? ['dni', 'residenceNumber'] : ['dni', 'passport'];
      if (
        hasEmptyPropertiesExcept(updateLead, [
          "comment",
          "workPosition",
          "paymentMethod",
          "workTime",
          "workAddress",
          "birthdate",
          "salary",
            'email',
            ...identityBlock
        ]) &&
        status.selected === "Contactado" &&
        status.type === "A Contactar"
      ) {
        return setError("Debe llenar toda la ficha en informacion general");
      }

      if (
        hasEmptyPropertiesExcept(updateLead, ["comment", "email","birthdate", ...identityBlock]) &&
        status.selected === "Precalifica en Buró" &&
        status.type === "Precalificar Buró"
      ) {
        return setError("Debe llenar toda la ficha en detalles laborales");
      }
      if (
          hasEmptyPropertiesExcept(updateLead, ["comment", "email", ...identityBlock]) &&
          status.selected === "Documentación 1era Etapa"
      ) {

        return setError("Debe llenar toda la ficha, por favor complete la información (Fecha de nacimiento)");
      }
      console.log(updateLead)
      setIsLoading(true);
      cb && cb();
      updateLeadStatus(lead._id, payload).then((res) => {
        setIsLoading(false);
        if (typeof res === "string") {
          setError(res);
          return;
        }
        dispatch(setStatusChange(true));
        setBankSelected("");
        setFinancingProgramSelected("");
        handleOpen();
        socket.emit("updateLeads");
        if (status.type === "Pendiente de llamar" && user.role !== "ADMIN") {
          window.location.href = `/prospectos/lista`;
        }
      });
    } catch (error) {
      console.log(error);
    }
  };

  const isBankAvailable = (id: string) => {
    return lead.rejectedBanks?.some(
      (rejectedBank: any) => rejectedBank._id === id
    );
  };

  const [documentsState, setDocumentsState] = useState([]);

  const handleDocumentChange = (e: any) => {
    if (e.target.checked && !documentsState.includes(e.target.name as never)) {
      setDocumentsState([...documentsState, e.target.name ] as any); 
    }else{
      setDocumentsState(documentsState.filter((item: any) => item !== e.target.name));
      deleteDocumentByLead(lead._id, e.target.name).then((res) => {
        if (typeof res === "string") {
          setError(res);
        }
      });
    }
  };

  const [sendToBankState, setSendToBankState] = useState({
    approved: "",
    sameFinancialInstitutionContinues: "",
    whoIsResponsible: "",
  });
  const handleSendToBankChange = (e: any) => {
    setSendToBankState({ ...sendToBankState, [e.target.name]: e.target.value });
  };
  return (
    <Modal>
      {isLoading && <Loading className="z-10 opacity-70 rounded-md" />}
      <div className="flex items-center justify-between">
        <DialogHeader className="text-gray-700">
          Cambiar estado del prospecto
        </DialogHeader>
        <XMarkIcon
          onClick={handleOpen}
          className="w-5 h-5 cursor-pointer mr-5"
        />
      </div>
      <form onSubmit={handleSubmit}>
        <DialogBody divider className="flex flex-col gap-3">
          {error && (
            <Alert
              className="flex items-center"
              icon={<ExclamationTriangleIcon className="w-5 h-5" />}
              color="red"
            >
              {error}
            </Alert>
          )}

          {status.type === "Precalificar Buró" && !banksAvailable && (
            // warning
            <Alert
              className="flex items-center bg-yellow-700"
              icon={<ExclamationTriangleIcon className="w-5 h-5" />}
            >
              {`El prospecto ya ha sido rechazado por todos los bancos disponibles, por favor envíelo a oportunidad de venta futura`}
            </Alert>
          )}
          <div className="flex gap-2 items-center">
            <span className="text-gray-600 font-bold">Estado actual:</span>
            <Chip
              color="light-blue"
              className="font-medium text-white"
              value={status.type}
            />
          </div>
          {lead.bankID && (
            <div className="flex flex-col gap-3">
              <div className="flex gap-2 items-center">
                <span className="text-gray-600 font-bold">Banco:</span>
                <span className="font-medium text-gray-600">
                  {lead.bankID.name}
                </span>
              </div>
              <div className="flex gap-2 items-center">
                <span className="text-gray-600 font-bold">
                  Programa de financiamiento:
                </span>
                <span className="font-medium text-gray-600">
                  {lead.financingProgram}
                </span>
              </div>
            </div>
          )}
          {status.type === "Por Asignar Modelo de Casa" && (
            <div className="flex items-center gap-2">
              <span className="text-gray-600 font-bold">Proyecto:</span>
              <span className="font-medium text-gray-600">
                {lead.projectDetails?.projectID?.name}
              </span>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label htmlFor="selectStatus" className="font-bold text-gray-600">
              Seleccionar estado:
            </label>
            <select
              name="selectStatus"
              onChange={handleSelect}
              value={status.selected}
              className="border border-gray-300 rounded-md p-2"
            >
              {status.enum.map((item: any) => (
                <>
                  {item === "Selecciona un estado" ? (
                    <option key={item} value={item} defaultChecked disabled>
                      {item}
                    </option>
                  ) : (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  )}
                </>
              ))}
            </select>
            {/* A contactar */}
            {status.selected === "A Contactar" && !lead.advisorID && (
              <>
                <label
                  htmlFor="selectAdvisor"
                  className="text-gray-600 font-bold"
                >
                  Seleccionar un asesor:
                </label>
                <select
                  name="selectAdvisor"
                  className="border border-gray-300 rounded-md p-2"
                  onChange={handleUserChange}
                  value={userSelected}
                  required
                >
                  <option value="" defaultChecked disabled>
                    Seleccionar encargado
                  </option>
                  {users.length > 0 &&
                    users.map((item: any) => {
                      return (
                        <option key={item._id} value={item._id}>
                          {item.name}
                        </option>
                      );
                    })}
                </select>
              </>
            )}

            {status.selected === "Contactado" &&
              status.type === "A Contactar" && (
                <>
                  <label
                    htmlFor="selectAdvisor"
                    className="text-gray-600 font-bold"
                  >
                    Seleccionar al encargado de precalificar buró:
                  </label>
                  <select
                    name="selectAdvisor"
                    className="border border-gray-300 rounded-md p-2"
                    onChange={handleUserChange}
                    value={userSelected}
                    required
                  >
                    <option value="" defaultChecked disabled>
                      Seleccionar encargado
                    </option>

                    {users.length > 0 &&
                      users.map((item: any) => {
                        return (
                          <option
                            key={item._id}
                            value={item._id}
                            defaultChecked={users.length === 1}
                          >
                            {item.name}
                          </option>
                        );
                      })}
                  </select>
                </>
              )}

            {status.selected === "Precalifica en Buró" && banksAvailable && (
              <>
                <label
                  htmlFor="selectAdvisor"
                  className="text-gray-600 font-bold"
                >
                  Seleccionar al encargado de precalificar banco:
                </label>
                <select
                  name="selectAdvisor"
                  className="border border-gray-300 rounded-md p-2"
                  onChange={handleUserChange}
                  value={userSelected}
                  required
                >
                  <option value="" defaultChecked disabled>
                    Seleccionar encargado
                  </option>

                  {users &&
                    users.map((item: any) => {
                      return (
                        <option
                          key={item._id}
                          value={item._id}
                          defaultChecked={users.length === 1}
                        >
                          {item.name}
                        </option>
                      );
                    })}
                </select>
              </>
            )}
            {/* Precalificar Buró */}
            {((status.selected === "Precalifica en Buró" && banksAvailable) || (status.selected === 'Cambiar Banco' && banksAvailable)) && (
              <>
                <label htmlFor="selectBank" className="text-gray-600 font-bold">
                  Seleccionar banco:
                </label>
                <select
                  name="selectBank"
                  className="border border-gray-300 rounded-md p-2"
                  onChange={handleBankChange}
                  value={bankSelected}
                  required
                >
                  <option value="" defaultChecked disabled>
                    Seleccionar banco
                  </option>

                  {banks &&
                    banks.map((item: any) => {
                      return (
                        <>
                          {isBankAvailable(item._id) ? (
                            <option key={item._id} value={item._id} disabled>
                              {item.name} (Rechazado)
                            </option>
                          ) : (
                            <option key={item._id} value={item._id}>
                              {item.name}
                            </option>
                          )}
                        </>
                      );
                    })}
                </select>

                {bankSelected && (
                  <>
                    <label
                      htmlFor="selectFinancingProgram"
                      className="text-gray-600 font-bold"
                    >
                      Seleccionar programa de financiamiento:
                    </label>
                    <select
                      name="selectFinancingProgram"
                      className="border border-gray-300 rounded-md p-2"
                      onChange={handleFinancingProgramChange}
                      value={financingProgramSelected}
                      required
                    >
                      <option value="" defaultChecked disabled>
                        Seleccionar programa de financiamiento
                      </option>

                      {bank.financingPrograms?.map((item, index) => {
                        return (
                          <option
                            key={index}
                            value={`${item.name} - ${item.interestRate}%`}
                          >
                            {item.name} - {item.interestRate}%{" "}
                          </option>
                        );
                      })}
                    </select>
                    {financingProgramSelected && (
                      <span className="text-gray-600">
                        Descripción:{" "}
                        {
                          bank.financingPrograms?.find(
                            (program) =>
                              program.name ===
                              financingProgramSelected.split(" - ")[0]
                          )?.description
                        }
                      </span>
                    )}
                  </>
                )}
              </>
            )}

            {/* Por asignar proyecto */}
            {status.selected === "Asignar Proyecto" && (
              <ToAssignProject setProjectSelected={setProjectSelected} />
            )}

            {/* Por asignar modelo */}
            {status.selected === "Asignar Modelo de Casa" && (
              <>
                <ToAssignModel lead={lead} setModelPayload={setModelPayload} />
              </>
            )}

            {/* Prospecto definido */}
            {(status.type === "Prospecto Definido" && status.condition === 'REJECTED') && (
              <p className="text-gray-700 text-sm font-bold">
                Nota: Enviar a firmar contrato
              </p>
            )}


            {/* Documentación */}
            {status.selected === "Documentación 1era Etapa" && (
              <DocumentationState
                handleDocumentsChange={handleDocumentChange}
                lead = {lead}
              />
            )}

            {/* Primera etapa del expediente */}
            {status.selected === "Enviar Avalúo" &&
              status.type === "Primera Etapa de Expediente" && (
                <FirstStageOfTheFile
                lead={lead}
                  handleDocumentsChange={handleDocumentChange}
                />
              )}

            {/* Segunda etapa del expediente */}
            {status.selected === "Enviar a Avalúo" &&
              status.type === "Segunda Etapa de Expediente" && (
                <SecondStageOfTheFile  lead={lead} handleDocumentsChange={handleDocumentChange} bankID={lead.bankID._id} />
              )}

            {/* Revision de expediente */}
            {status.selected === "No hay Subsanaciones" &&
              status.type === "Revision de Expediente" && (
                <p className="text-gray-700 text-sm font-bold">
                  Nota: Enviar expediente a firmar a Gerencia
                </p>
              )}



            {/* En caso de que no haya subsanaciones */}
            {status.type === "Enviar a Banco" &&
              status.selected === "No hay Subsanaciones" && (
                <>
                  <label className="text-gray-600 font-bold">
                    Cliente fue aprobado en el Banco?
                  </label>
                  <select
                    name="approved"
                    className="border border-gray-300 rounded-md p-2"
                    value={sendToBankState.approved}
                    onChange={handleSendToBankChange}
                    required
                  >
                    <option value="" defaultChecked disabled>
                      Seleccionar
                    </option>
                    <option value="Si">Si</option>
                    <option value="No">No</option>
                  </select>
                </>
              )}
            {((status.type === "Enviar a Banco" &&
              status.selected === "Hay Subsanaciones") ||
              sendToBankState.approved === "No") && (
              <>
                <label className="text-gray-600 font-bold">
                  Continua gestión en misma institución financiera?
                </label>
                <select
                  name="sameFinancialInstitutionContinues"
                  className="border border-gray-300 rounded-md p-2"
                  value={sendToBankState.sameFinancialInstitutionContinues}
                  onChange={handleSendToBankChange}
                  required
                >
                  <option value="" defaultChecked disabled>
                    Seleccionar
                  </option>
                  <option value="Si">Si</option>
                  <option value="No">No</option>
                </select>
                {sendToBankState.sameFinancialInstitutionContinues === "Si" && (
                  <>
                    <label className="text-gray-600 font-bold">
                      Quien es responsable de la gestión?
                    </label>
                    <select
                      name="whoIsResponsible"
                      className="border border-gray-300 rounded-md p-2"
                      value={sendToBankState.whoIsResponsible}
                      onChange={handleSendToBankChange}
                      required
                    >
                      <option value="" defaultChecked disabled>
                        Seleccionar
                      </option>
                      <option value="Gestor">Gestor Bancario</option>
                      <option value="Asesor">Asesor</option>
                    </select>

                    <p className="text-gray-700 text-sm font-bold">
                      Nota: Se rechazara la gestión y se enviara a subsanar
                    </p>
                  </>
                )}
                {sendToBankState.sameFinancialInstitutionContinues === "No" && (
                  <p className="text-gray-700 text-sm font-bold">
                    Nota: Se anulara la gestión y se enviara a seleccionar un
                    nuevo banco.
                  </p>
                )}
              </>
            )}

            {/* Contactarlo */}
            {(status.selected === "No dio Información" ||
              status.selected === "No Precalifica en Buró" ||
              status.selected === "Oportunidad de venta futura" ||
              status.selected === "No contesto") && (
              <>
                <label className="text-gray-600 font-bold">
                  Contactarlo el:
                </label>
                <input
                  onChange={handleDate}
                  value={date}
                  type="date"
                  name="date"
                  className="border border-gray-300 rounded-md p-2 text-gray-600"
                  required
                />
              </>
            )}
            <Textarea
              name="comment"
              onChange={handleChangeComment}
              label="Comentario"
              value={comment}
            />
          </div>
        </DialogBody>
        <DialogFooter className="space-x-2">
          <button
            type="button"
            onClick={handleOpen}
            className="btn btn-outline bg-gray-400 p-2 rounded-md hover:bg-red-400 text-white"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn btn-primary bg-blue-400 p-2 rounded-md text-white hover:bg-blue-500 "
          >
            Guardar
          </button>
        </DialogFooter>
      </form>
    </Modal>
  );
};
