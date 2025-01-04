import { XMarkIcon } from "@heroicons/react/24/outline";
import { Modal } from "../../../component/modal/Modal";
import {  useState } from "react";
import { MODULES } from "../../../constants/modules";
import { capitalizeFirstLetter } from "../../../utils";
import { createRole } from "../../../services/roles.service";
import { successAlert } from "../../../component/alerts/Alerts";
import { IRole } from "../../../interfaces/role.interface";


interface Props {
  handleCloseModal: React.Dispatch<React.SetStateAction<boolean>>,
  setRoles: React.Dispatch<React.SetStateAction<IRole[]>>
}

export const CreateRole = ({handleCloseModal, setRoles}: Props) => {
  const [formData, setFormData] = useState<IRole>({
    name: "",
    permissions: [],

  } );

  function handleInputChange(e: any) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  function handleAddPermission(e: React.ChangeEvent<HTMLInputElement>) {
    const moduleName = e.target.name;
    const permissionType = e.target.value;
  
    // Buscar si ya existe un permiso para el módulo actual en el estado formData
    const existingPermissionIndex = formData.permissions.findIndex(
      (permission) => permission.module === moduleName
    );
  
    if (existingPermissionIndex !== -1) {
      // Si ya existe un permiso para el módulo, actualizar los accesos
      const updatedPermissions = [...formData.permissions];
      updatedPermissions[existingPermissionIndex].access.push(permissionType);
  
      setFormData({
        ...formData,
        permissions: updatedPermissions,
      });
    } else {
      // Si no existe un permiso para el módulo, agregar uno nuevo
      setFormData({
        ...formData,
        permissions: [
          ...formData.permissions,
          {
            module: moduleName,
            access: [permissionType],
          },
        ],
      });
    }
  }
  function handleSubmit(e:any){
    e.preventDefault()
    createRole(formData).then((data) => {
      successAlert('Éxito', 'Rol creado correctamente')
      setRoles((prevRoles) => [...prevRoles, data]);
      handleCloseModal(false)
    });
  }



  return (
    <Modal>
      <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
        <div className="sm:flex sm:items-start items-center ">
          <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
            <div className="flex justify-between items-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Crear un nuevo rol
              </h3>
              <button>
                <XMarkIcon  onClick={()=> handleCloseModal(false)} className="h-8 w-8 text-gray-500 hover:text-gray-700" />
              </button>
            </div>
            <div className="mt-2">
              <p className="text-sm text-gray-500">
                Llena los campos para crear un nuevo rol
              </p>
            </div>
          </div>
        </div>
        <form
            onSubmit={handleSubmit}
          className="mt-4 text-gray-800 placeholder:text-gray-700 justify-center"
        >
          <div className="flex flex-col gap-4">
            <label htmlFor="name">Nombre del rol</label>
            <input
              type="text"
              name="name"
                onChange={handleInputChange}
              value={formData.name}
              placeholder="Nombre del rol"
              className="border border-gray-300 px-4 py-2 rounded-md"
              required
            />

            <label htmlFor="minAmount">Permisos</label>
            <ul className="flex flex-col gap-2 w-full">
              {MODULES.map((module) => (
                <li className="flex items-center">
                  <label  className="text-sm w-1/3">
                    {capitalizeFirstLetter(module.name)}
                  </label>
                  <div className="flex items-center gap-10">
                    
                    <div className="flex items-center gap-2">
                      <label htmlFor="" className="text-sm">
                        Lectura
                      </label>
                      <input
                      className="cursor-pointer"
                        type="checkbox"
                        name={module.name}
                        value={'read'}
                        onChange={handleAddPermission}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <label htmlFor="" className="text-sm">
                        Escritura
                      </label>
                      <input
                      className="cursor-pointer"
                        type="checkbox"
                        name={module.name}
                        value={'write'}
                        onChange={handleAddPermission}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <label htmlFor="" className="text-sm">
                        Eliminar
                      </label>
                      <input
                      className="cursor-pointer"
                        type="checkbox"
                        name={module.name}
                        id={module.name}
                        value={'delete'}
                        onChange={handleAddPermission}
                      />
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <button className="bg-blue-500 text-white px-4 py-2 rounded-md mt-10">
              Agregar
            </button>
          </div>
        </form>
        <button
          className="w-full bg-gray-500 text-white px-4 py-2 rounded-md mt-4"
            onClick={()=> handleCloseModal(false)}
        >
          Cancelar
        </button>
      </div>
    </Modal>
  );
};
