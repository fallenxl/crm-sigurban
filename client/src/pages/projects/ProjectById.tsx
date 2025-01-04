import {useNavigate, useParams} from "react-router-dom";
import { Layout } from "../Layout";
import {Card} from "@material-tailwind/react";
import {
  ClipboardDocumentCheckIcon, EyeIcon,
  PencilSquareIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import {
  getAllLotsByProjectID,
  updateProjectById,
} from "../../services/projects.services";
import { Input } from "../../component/inputs/input";
import { ModalAddModel } from "./ModalAddModel";
import { IProjectModels } from "../../interfaces";
import { errorAlert, successAlert } from "../../component/alerts/Alerts";
import { ModalAddLot } from "./ModalAddLot";
import { createLot, deleteLot, updateLotService } from "../../services/lots.services";
import {useSelector} from "react-redux";
import {AppStore} from "../../redux/store.ts";
import {TextArea} from "../../component/inputs/textarea.tsx";
import {TrashIcon} from "@heroicons/react/24/solid";
import Swal from "sweetalert2";

export function ProjectById() {
  const { id } = useParams<{ id: string }>();
  const [edit, setEdit] = useState(true);
  const handleEdit = () => {
    setEdit(!edit);
    if (!edit) setEditProject(project);
  };
const navigate = useNavigate()
  const [project, setProject] = useState<any>({
    _id: "",
    name: "",
    description: "",
    lots: [],
    models: [],
    address: "",
  });

  const [editProject, setEditProject] = useState<any>({
    _id: "",
    name: "",
    description: "",
    lots: [],
    models: [],
    address: "",
  });
  useEffect(() => {
    if (id) {
      getAllLotsByProjectID(id).then((res) => {
        setProject(res);
        setEditProject(res);
      });
    }
  }, []);

  const [openModal, setOpenModal] = useState(false);
  const [openModalLot, setOpenModalLot] = useState(false);
  const addModel = (model: IProjectModels) => {
    setEditProject((prev: any) => ({
      ...prev,
      models: [...(prev.models || []), model],
    }));
  };

  const [lotSelected, setLotSelected] = useState<any>(null);
  const [modelSelected, setModelSelected] = useState<number | null>(null);


  const handleChangeProject = (e: any) => {
    setEditProject((prev: any) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleDeleteModel = (index: number) => {
    setEditProject((prev: any) => ({
      ...prev,
      models: prev.models.filter((_: any, i: number) => i !== index),
    }));
  };

  const handleUpdateProject = (e: any) => {
    e.preventDefault();
    if (!id) return;
    updateProjectById(id, editProject).then((res) => {
      setProject(res);
      setEditProject(res);
      successAlert("Exito!", "Proyecto actualizado");
      setEdit(true);
    });
  };

  const handleAddLot = (lot: any, opt: string = "create") => {
    if (opt === "update") {
      updateLotService(lot).then((res) => {
        if (typeof res === "string") return errorAlert("Error", res);
        const newLot = res.data;
        setEditProject((prev: any) => ({
          ...prev,
          lots: prev.lots.map((l: any) => {
            if (l._id === newLot._id) return newLot;
            return l;
          }),
        }));
      });
      return;
    }

    createLot(lot).then((res) => {
      if (typeof res === "string") return errorAlert("Error", res);
      const newLot = res.data;
      setEditProject((prev: any) => ({
        ...prev,
        lots: [...(prev.lots || []), newLot],
      }));
    });
  };

  const handleDeleteLot = (_id: string) => {
    Swal.fire({
        title: 'Estas seguro?',
        text: "No podras revertir esto!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Si, eliminar!'
        }).then((result) => {
        if (result.isConfirmed) {
            deleteLot(_id).then((res) => {
            if (typeof res === "string") return errorAlert("Error", res);
            setEditProject((prev: any) => ({
                ...prev,
                lots: prev.lots.filter((lot: any) => lot._id !== _id),
            }));
            successAlert("Exito!", "Lote eliminado");
            });
        }
    });
  };

  const user = useSelector((state: AppStore) => state.auth.user);
  return (
    <Layout title="Proyecto">
      <Card className="h-full w-full lg:w-9/12  p-0 lg:p-10 ">
        <div className="mb-8 lg:grid grid-cols-12 ">
          {/* Project info */}
          <div className="w-full col-start-1 col-end-13 flex flex-col items-center p-4">
            <div className="w-full flex justify-between py-2">
              <span>Información {project.name}</span>
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
            <div className="w-full mt-5" >
              <Input
                className="w-full"
                name="name"
                label="Nombre del proyecto"
                value={editProject.name}
                onChange={handleChangeProject}
                disabled={edit}
              />
              <Input
                className="w-full"
                name="description"
                label="Descripción"
                onChange={handleChangeProject}
                value={editProject.description}
                disabled={edit}
              />
              <Input
                className="w-full mb-4"
                name="address"
                label="Dirección"
                value={editProject.address}
                onChange={handleChangeProject}
                disabled={edit}
              />
              {user.role === 'ADMIN' && (<TextArea
                  name="svg"
                  label="SVG"
                  value={editProject.svg}
                  onChange={handleChangeProject}
                  disabled={edit}
              />)}
              <div className="flex items-center gap-4 mt-3">
                <label className="text-gray-700 text-xs  ">
                  Modelos de casas
                </label>
                {!edit && (
                  <span
                    onClick={() => {
                      setModelSelected(null);
                      setOpenModal(true);
                    }}
                    className="text-xs text-blue-500 hover:text-blue-700 cursor-pointer"
                  >
                    Agregar modelo
                  </span>
                )}
              </div>
              {editProject.models?.length === 0 && (
                <span className="text-xs text-gray-500 block mt-4">
                  No hay modelos registrados
                </span>
              )}
              <ul className="flex flex-wrap gap-2 mt-2 mb-5">
                {editProject.models?.map((program: any, index: number) => (
                  <li className="flex items-center gap-x-2 bg-teal-600 rounded-md text-white p-2 text-xs">
                    <div className="flex items-center gap-x-2">
                      {edit ? (
                        <ClipboardDocumentCheckIcon className="w-4 h-4" />
                      ) : (
                        <XMarkIcon
                          onClick={() => handleDeleteModel(index)}
                          className="w-4 h-4 cursor-pointer"
                        />
                      )}

                      <span
                        onClick={() => {
                          if (edit) return;
                          setModelSelected(index);
                          setOpenModal(true);
                        }}
                        className={`${
                          !edit
                            ? "hover:text-gray-200 hover:underline cursor-pointer "
                            : ""
                        }`}
                      >{`${program.model}`}</span>
                    </div>
                  </li>
                ))}
              </ul>


              {editProject.lots?.length === 0 && (
                <span className="text-xs text-gray-500 block mt-4">
                  No hay lotes registrados
                </span>
              )}
              {/*<ul className="flex flex-wrap gap-2 mt-2">*/}
              {/*  {editProject.lots?.map((lot: any) => (*/}
              {/*    <li className="flex items-center gap-x-2 bg-teal-600 rounded-md text-white p-2 text-xs">*/}
              {/*      {edit ? (*/}
              {/*        <ClipboardDocumentCheckIcon className="w-4 h-4" />*/}
              {/*      ) : (*/}
              {/*        <XMarkIcon*/}
              {/*          onClick={() => handleDeleteLot(lot._id)}*/}
              {/*          className="w-4 h-4 cursor-pointer"*/}
              {/*        />*/}
              {/*      )}*/}
              {/*      <span*/}
              {/*        onClick={() => {*/}
              {/*          if (edit) return;*/}
              {/*          setLotSelected(lot);*/}
              {/*          setOpenModalLot(true);*/}
              {/*        }}*/}
              {/*        className={`${*/}
              {/*          !edit*/}
              {/*            ? "hover:text-gray-200 hover:underline cursor-pointer "*/}
              {/*            : ""*/}
              {/*        }`}*/}
              {/*      >{`${lot.block && lot.block + " - "}${lot.lot}`}</span>*/}
              {/*    </li>*/}
              {/*  ))}*/}
              {/*</ul>*/}

              <div className={'flex gap-4'}>
                <label className="text-gray-700 text-xs  ">Lotes ({editProject.lots?.length})</label>
                    <span
                        onClick={() => {
                          setLotSelected(null);
                          setOpenModalLot(true);
                        }}
                        className="text-xs text-blue-500 hover:text-blue-700 cursor-pointer"
                    >
                    Agregar lote
                  </span>

              </div>

              <table className="w-full mt-2 max-h-[30rem]">
                <thead>
                <tr className="bg-gray-100">
                  <th className="p-2">Lote</th>
                  <th className="p-2">Bloque</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Acciones</th>
                </tr>
                </thead>
                <tbody>
                {editProject.lots?.map((lot: any, index: number) => {
                  return (
                      <tr key={index} className={'border-b text-center'}>
                        <td className={'p-2'}>{lot.lot}</td>
                        <td className={'p-2'}>{lot.block}</td>
                        <td className={`p-2 ${lot.status === 'Liquidado' ? 'text-red-500' : lot.status === 'Reservado' ? 'text-blue-500' : 'text-green-500'}`}>{lot.status}</td>
                        <td className={'p-2'}>
                          <button title="Ver Lote" onClick={() => {
                            navigate(`/lotes/${lot._id}`)
                          }} className={'rounded-md px-2 py-1'}>
                            <EyeIcon className={'w-5 h-5 '}/>{' '}
                          </button>
                          <button title="Eliminar Lote" onClick={() => handleDeleteLot(lot._id)} className={' rounded-md px-2 py-1'}>
                            <TrashIcon className={'w-5 h-5  '}/>{' '}
                          </button>
                        </td>
                      </tr>
                  )
                })}
                </tbody>
              </table>
              {!edit && (
                <>
                  <div className="flex items-center gap-2 flex-row-reverse">
                    <div className="flex flex-row-reverse">
                      <button onClick={handleUpdateProject} className="bg-blue-500 px-4 py-2 rounded-md  text-white">
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
            </div>
          </div>
        </div>
      </Card>
      {openModalLot && (
        <ModalAddLot
          addLot={handleAddLot}
          setOpenModal={setOpenModalLot}
          projectID={project._id}
          setEditProject={setProject}
          lot={lotSelected}
        />
      )}
      {openModal && (
        <ModalAddModel
          addModel={addModel}
          setOpenModal={setOpenModal}
          model={modelSelected !== null && editProject.models[modelSelected]}
          index={modelSelected && modelSelected}
          setEditProject={setEditProject}
        />
      )}
    </Layout>
  );
}
