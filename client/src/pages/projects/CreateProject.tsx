import { useState } from "react";
import { Layout } from "../Layout";
import { IProject, IProjectModels } from "../../interfaces";
import { Chip,  } from "@material-tailwind/react";
import { ModalAddModel } from "./ModalAddModel";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { createProject } from "../../services/projects.services";
import { errorAlert, successAlertWithRedirect } from "../../component/alerts/Alerts";
import {useSelector} from "react-redux";
import {AppStore} from "../../redux/store.ts";
import {Input} from "../../component/inputs/input.tsx";
import {TextArea} from "../../component/inputs/textarea.tsx";

export const CreateProject = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    models: [],
    svg: "",
  } as IProject);
  const handleSubmit = (e: any) => {
    e.preventDefault();
    createProject(formData).then((res) => {
      if(typeof res === "string") return errorAlert('Oops...',res);

      successAlertWithRedirect('Éxito!','Se ha creado el proyecto correctamente', '/proyectos/lista');
    });
  };
  const handleInputChange = (e: any) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const [openModal, setOpenModal] = useState(false);
  const addModel = (model: IProjectModels) => {
    setFormData((prev) => ({
      ...prev,
      models: [...(prev.models || []), model],
    }));
  };
  const user = useSelector((state: AppStore) => state.auth.user);
  return (
    <Layout title="Crear Proyecto">
      <div className=" w-full lg:w-3/4 bg-white h-auto px-10 py-6 rounded-md">
        {openModal && <ModalAddModel addModel={addModel} setOpenModal={setOpenModal} />}
        <form
          onSubmit={handleSubmit}
          action=""
          className="text-sm flex flex-col gap-4"
        >
          <div className="flex flex-col xl:flex-row items-center justify-between mb-4 gap-4">
            <div>
              <h1 className="text-xl text-gray-700">Registrar un proyecto</h1>
              <small className="text-gray-500 mb-6">
                Llena de forma correcta los campos del banco
              </small>
            </div>
          </div>
          <Input
            name="name"
            value={formData.name}
            onChange={handleInputChange}

            type="text"
            label="Nombre del proyecto"
            required
          />
          <TextArea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            label="Descripción"
          />
          <TextArea
            label="Dirección"
            value={formData.address}
            onChange={handleInputChange}
            name="address"
          />
          {user.role === 'ADMIN' && (<TextArea
              label="SVG"
              value={formData.svg}
              onChange={handleInputChange}
              name="svg"
          />)}
          <span
            onClick={() => setOpenModal(true)}
            className="flex text-gray-600 hover:text-gray-800  underline cursor-pointer"
          >
            Agregar modelo de casa
          </span>
          <ul className="flex flex-wrap gap-2">
            {formData.models?.map((model, index) => (
              <li key={index}>
                <Chip
                  color="teal"
                  value={model.model}
                  icon={
                    <XMarkIcon
                      onClick={() =>
                        setFormData({
                          ...formData,
                          models: formData.models?.filter(
                            (m) => model.model !== m.model
                          ),
                        })
                      }
                      className="h-5 w-5 text-white hover:text-gray-200 cursor-pointer"
                    />
                  }
                />
              </li>
            ))}
          </ul>

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-md"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};
