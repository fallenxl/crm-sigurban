import { Link, useParams } from "react-router-dom";
import { Layout } from "../Layout";
import { useEffect, useState } from "react";
import { Avatar, Card, Chip } from "@material-tailwind/react";
import {
  AtSymbolIcon,
  BriefcaseIcon,
  CheckIcon,
  IdentificationIcon,
  KeyIcon,
  MapIcon,
  PencilSquareIcon,
  PhoneIcon,
  UserCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

import { validateID } from "../../utils/redirects.tsx";
import { Loading } from "../../component/index.ts";
import { useUserData } from "../../hooks/user/useUserData.tsx";
import { useEditUser } from "../../hooks/user/useEditUser.tsx";
import { Roles, RolesArray } from "../../constants/roles.ts";
import { getDays } from "../../utils/time.utils.ts";
import { getLeadsByRole } from "../../services/lead.services.ts";
import { Input } from "../../component/inputs/input.tsx";
import {
  updateUserByID,
  updateUserPassword,
} from "../../services/user.services.ts";
import { errorAlert, successAlert } from "../../component/alerts/Alerts.tsx";
import { User } from "../../interfaces/user.interface.ts";
import { GENRE, POSITIONS } from "../../constants/user-form.ts";
import { capitalizeFirstLetter } from "../../utils/utilities.ts";

export const UserByID = () => {
  const { id } = useParams<{ id: string }>();
  validateID(id ?? "");
  const { user, isLoading, setUser } = useUserData(id);
  const {
    edit,
    setEdit,
    handleCancelEdit,
    handleEdit,
    handleUpdateUserChange,
    updateUser,
    setUpdateUser,
  } = useEditUser(id, user);

  const [leadsByUser, setLeadsByUser] = useState([]);
  useEffect(() => {
    if (user) {
      getLeadsByRole(user.role as Roles, user._id).then((res) => {
        setLeadsByUser(res);
      });
    }
  }, [user]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    updateUserByID(id ?? "", updateUser as Partial<User>).then((res) => {
      if (typeof res === "string") {
        return errorAlert("Oops!", res);
      }
      successAlert("¡Listo!", "Usuario actualizado correctamente");
      setUser(res?.data);
      setEdit(true);
    });
  };

  const [changePassword, setChangePassword] = useState(false);
  const [password, setPassword] = useState({
    password: "",
    passwordConfirm: "",
  });
  const [error, setError] = useState("");

  const handlePasswordChange = (e: any) => {
    setPassword({ ...password, [e.target.name]: e.target.value });
  };

  const handlePasswordSubmit = (e: any) => {
    e.preventDefault();
    if (password.password !== password.passwordConfirm) {
      return setError("Las contraseñas no coinciden");
    } else if (password.password.length < 8) {
      return setError("La contraseña debe tener al menos 8 caracteres");
    }

    updateUserPassword(id ?? "", password.password).then((res) => {
      if (typeof res === "string") {
        return setError(res);
      }
      setChangePassword(false);
      setPassword({
        password: "",
        passwordConfirm: "",
      });
      successAlert("Éxito", "Contraseña actualizada");
    });
  };

  const handlePasswordEdit = () => {
    setChangePassword(!changePassword);
    if (changePassword) {
      setPassword({
        password: "",
        passwordConfirm: "",
      });
    }
  };

  const [editRole, setEditRole] = useState(false);
  const [editStatus, setEditStatus] = useState(false);

  const handleEditRole = () => {
    setEditRole(!editRole);
    setUpdateUser(user);
  };

  const handleEditStatus = () => {
    setEditStatus(!editStatus);
    setUpdateUser(user);
  };

  const handleUpdateUserStatus = () => {
    updateUserByID(id ?? "", { status: updateUser.status }).then((res) => {
      if (typeof res === "string") {
        return setError(res);
      }
      successAlert("Éxito", "Estado actualizado");
      setUser({ ...user, status: updateUser.status });
      setEditStatus(false);
    });
  };

  const handleUpdateUserRole = () => {
    updateUserByID(id ?? "", { role: updateUser.role as Roles }).then((res) => {
      if (typeof res === "string") {
        return setError(res);
      }
      successAlert("Éxito", "Rol actualizado");
      setUser({ ...user, role: updateUser.role });
      setEditRole(false);
    });
  };

  return (
    <Layout title={"Usuario: " + user.name}>
      {isLoading && <Loading className="z-10" />}
      <div className="relative">
        <div className="flex flex-col lg:flex-row gap-4">
          <Card className="h-full w-full lg:w-7/12 mx-auto p-10 ">
            <div className="mb-8 lg:grid grid-cols-12 ">
              {/* user info */}
              <div className="w-full col-start-1 col-end-13 flex flex-col items-center p-4">
                <div className="flex flex-col items-center gap-y-2 mb-5">
                  <Avatar
                    src={user.avatar}
                    size="xxl"
                  />
                  <div className="flex flex-col items-center">
                    <span className="text-2xl">{user.name}</span>

                    <div className="bg-blue-300 px-3 py-1 rounded-md flex items-center mt-2">
                      <Chip
                        value={RolesArray[user.role as Roles]}
                        className="bg-transparent font-medium text-white"
                      />
                    </div>
                  </div>
                </div>
                <div className="w-full flex justify-between py-2">
                  <span className="font-bold text-gray-600">Información</span>
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
                {/* user details form */}
                <form
                  onSubmit={handleSubmit}
                  action=""
                  className="w-full flex flex-col gap-y-2 p-4"
                >

                  <div className="flex items-center gap-x-2  w-full">
                    <IdentificationIcon className="w-5 h-5" />
                    <Input
                      name="name"
                      onChange={handleUpdateUserChange}
                      label="Nombre completo"
                      value={updateUser.name}
                      disabled={edit}
                    />
                  </div>
                  <label className="text-gray-600 text-xs ml-6">Cargo</label>
                  <div className="flex items-center gap-x-2  w-full">
                    <IdentificationIcon className="w-5 h-5" />
                    <select
                      name="position"
                      value={updateUser.position}
                      onChange={handleUpdateUserChange}
                      className={`w-full border border-gray-300 rounded-md p-2 text-sm ${
                        edit && "bg-blue-gray-50"
                      } text-black`}
                      disabled={edit}
                    >
                      {POSITIONS.map((position) => {
                        return <option value={position}>{position}</option>;
                      })}
                    </select>
                  </div>

                  <div className="flex items-center gap-x-2  w-full">
                    <PhoneIcon className="w-5 h-5" />
                    <Input
                      name="phone"
                      onChange={handleUpdateUserChange}
                      label="Numero de teléfono"
                      value={updateUser.phone}
                      disabled={edit}
                    />
                  </div>

                  <div className="flex items-center gap-x-2  w-full">
                    <AtSymbolIcon className="w-5 h-5" />
                    <Input
                      name="email"
                      onChange={handleUpdateUserChange}
                      label="Correo electrónico"
                      value={updateUser.email}
                      disabled={edit}
                    />
                  </div>

                  <div className="flex items-center gap-x-2  w-full">
                    <MapIcon className="w-5 h-5" />
                    <Input
                      name="address"
                      onChange={handleUpdateUserChange}
                      label="Dirección"
                      value={updateUser.address}
                      disabled={edit}
                    />
                  </div>
                  <div className="flex items-center gap-x-2  w-full">
                    <MapIcon className="w-5 h-5" />
                    <Input
                      name="city"
                      onChange={handleUpdateUserChange}
                      label="País"
                      value={updateUser.city}
                      disabled={edit}
                    />
                  </div>
                  <div className="flex items-center gap-x-2  w-full">
                    <MapIcon className="w-5 h-5" />
                    <Input
                      name="department"
                      onChange={handleUpdateUserChange}
                      label="Departamento"
                      value={updateUser.department}
                      disabled={edit}
                    />
                  </div>
                  <label className="text-gray-600 text-xs ml-6">Genero</label>
                  <div className="flex items-center gap-x-2  w-full">
                    <BriefcaseIcon className="w-5 h-5" />
                    <select
                      name="genre"
                      value={updateUser.genre}
                      onChange={handleUpdateUserChange}
                      className={`w-full border border-gray-300 rounded-md p-2 text-sm ${
                        edit && "bg-blue-gray-50"
                      } text-black`}
                    >
                      {GENRE.map((genre) => (
                        <option value={genre}>
                          {capitalizeFirstLetter(genre)}
                        </option>
                      ))}
                    </select>
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
                            onClick={handleCancelEdit}
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
          {/* Details  */}
          <div className="w-full lg:w-5/12">
            {/* Other data */}
            <Card className=" w-full mx-auto p-8 mb-4">
              <div className="flex items-center p-2 border-b mb-2 gap-2 ">
                <h4 className="font-bold  text-gray-700 ">Detalles</h4>
              </div>
              <div className="flex items-center gap-2 py-2">
                <UserCircleIcon className="w-5 h-5" />
                <div className={"w-full flex items-center gap-2"}>
                  <span className=" text-gray-600 w-[5rem]">Estado:</span>
                  <select
                    onChange={handleUpdateUserChange}
                    className={`w-full border border-gray-300 rounded-md p-2 `}
                    name="status"
                    value={updateUser.status ? "Activo" : "Inactivo"}
                    disabled={!editStatus}
                  >
                    <option value={"Activo"}>Activo</option>
                    <option value={"Inactivo"}>Inactivo</option>
                  </select>
                  {!editStatus ? (
                    <PencilSquareIcon
                      onClick={handleEditStatus}
                      className="w-5 h-5 cursor-pointer"
                    />
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <CheckIcon
                          onClick={handleUpdateUserStatus}
                          className="w-5 h-5 cursor-pointer"
                        />
                        <XMarkIcon
                          onClick={handleEditStatus}
                          className="w-5 h-5 cursor-pointer"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 py-2">
                <UserCircleIcon className="w-5 h-5" />
                <div className={"w-full flex items-center gap-2"}>
                  <span className=" text-gray-600 w-[5rem]">Rol:</span>
                  <select
                    onChange={handleUpdateUserChange}
                    className={`w-full border border-gray-300 rounded-md p-2  `}
                    name="role"
                    value={updateUser.role}
                    disabled={!editRole}
                  >
                    {Object.keys(RolesArray).map((role) => {
                      return (
                        <option value={role}>
                          {RolesArray[role as Roles]}
                        </option>
                      );
                    })}
                  </select>
                  {!editRole ? (
                    <PencilSquareIcon
                      onClick={handleEditRole}
                      className="w-5 h-5 cursor-pointer"
                    />
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <CheckIcon
                          onClick={handleUpdateUserRole}
                          className="w-5 h-5 cursor-pointer"
                        />
                        <XMarkIcon
                          onClick={handleEditRole}
                          className="w-5 h-5 cursor-pointer"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 py-2">
                <div
                  className={`w-full flex ${
                    changePassword && "flex-col items-end"
                  }   gap-2 justify-end`}
                >
                  <small
                    onClick={handlePasswordEdit}
                    className="underline text-gray-600 cursor-pointer hover:text-gray-700"
                  >
                    Cambiar contraseña
                  </small>
                  {changePassword && (
                    <form onSubmit={handlePasswordSubmit} className="w-full">
                      <div className="w-full flex flex-col gap-1">
                        <div className="w-full flex justify-between items-center gap-4 py-2">
                          <KeyIcon className="w-5 h-5" />
                          <div className={"w-full flex items-center gap-4"}>
                            <Input
                              className="w-full placeholder:text-gray-600"
                              name="password"
                              value={password.password}
                              onChange={handlePasswordChange}
                              placeholder="Nueva contraseña"
                              required
                            />
                          </div>
                        </div>
                        {error ? (
                          <small className="text-red-500 pl-10">
                            * {error}
                          </small>
                        ) : (
                          <small className="text-gray-500 pl-10">
                            La contraseña debe tener al menos 8 caracteres
                          </small>
                        )}
                        <div className="w-full flex items-center gap-4 py-2">
                          <KeyIcon className="w-5 h-5" />
                          <div className={"w-full flex items-center gap-4"}>
                            <Input
                              className="w-full placeholder:text-gray-600"
                              name="passwordConfirm"
                              value={password.passwordConfirm}
                              onChange={handlePasswordChange}
                              placeholder="Confirmar nueva contraseña"
                              required
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-row-reverse">
                          <div className="flex flex-row-reverse">
                            <button
                              onClick={handlePasswordSubmit}
                              className="bg-blue-500 px-4 py-2 rounded-md  text-white"
                            >
                              Guardar
                            </button>
                          </div>
                          <div className="flex flex-row-reverse">
                            <span
                              onClick={handlePasswordEdit}
                              className="bg-gray-500 hover:bg-red-500 cursor-pointer px-4 py-2 rounded-md  text-white"
                            >
                              Cancelar
                            </span>
                          </div>
                        </div>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </Card>
            {/* Prospectos asignados */}
            <Card className=" w-full mx-auto p-8 mb-4 max-h-[70rem]">
              <div className="flex items-center justify-between p-2 border-b mb-2 gap-2 ">
                <h4 className="font-bold  text-gray-700  flex items-center justify-between lg:justify-start gap-2">
                  Prospectos asignados <span>({leadsByUser.length})</span>
                </h4>
                {user.role === "ADVISOR" && (
                  <small className="text-gray-600 hidden md:block">
                    Ultimo prospecto asignado{" "}
                    <span>{getDays(user.lastLead)}</span>
                  </small>
                )}
              </div>
              <div className={'overflow-auto'}>
                {leadsByUser.length > 0 && leadsByUser.map((lead: any) => {
                  return (
                    <div className="flex items-center gap-2 py-2">
                      <div
                        className={
                          "w-full flex items-center justify-between gap-2"
                        }
                      >
                        <div className=" flex items-center gap-2">
                          <Avatar
                            src={`https://api.dicebear.com/5.x/initials/svg?seed=${lead.name}`}
                            size="sm"
                          />
                          <Link to={`/prospectos/${lead._id}`}>
                            <span className="text-gray-600">{lead.name}</span>
                          </Link>
                          <small className="hidden lg:block text-gray-600">
                            {getDays(lead.createdAt)}
                          </small>
                        </div>
                        <small className="text-gray-600 hidden lg:block">
                          {lead.status.type}
                        </small>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};
