import { useState } from "react";
import { Layout } from "../Layout";
import { Roles, RolesArray } from "../../constants";
import {
  errorAlertWithTimer,
  successAlertWithRedirect,
} from "../../component/alerts/Alerts";
import { capitalizeFirstLetter } from "../../utils";
import { createUser } from "../../services/user.services";
import { UserDTO } from "../../interfaces";
import { GENRE, POSITIONS } from "../../constants/user-form";
import {Input} from "../../component/inputs/input.tsx";
import {TextArea} from "../../component/inputs/textarea.tsx";

export const CreateUser = () => {
  const [formData, setFormData] = useState<UserDTO>({
    name: "",
    email: "",
    address: "",
    department: "",
    position: "",
    city: "",
    phone: "",
    genre: "",
    role: "" as Roles,
    password: "",
  });

  const [confirmPassword, setConfirmPassword] = useState("");
  const handleConfirmPassword = (e: any) => {
    setConfirmPassword(e.target.value);
  };

  const handleInputChange = (e: any) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (formData.password !== confirmPassword)
      return errorAlertWithTimer(
        "...Oops",
        "Las contraseñas no coinciden, por favor verifica que sean iguales"
      );
    createUser(formData).then((res) => {
      if (typeof res === "string") {
        return errorAlertWithTimer("...Oops", res);
      }
      if (res?.status === 201) {
        successAlertWithRedirect(
          "Usuario creado correctamente",
          "El usuario se ha creado correctamente",
          "/usuarios/lista"
        );
      }
    });
  };

  return (
    <Layout title="Crear Usuario">
      <div className=" w-full lg:w-3/4 bg-white h-auto px-10 py-6 rounded-md">
        <form
          onSubmit={handleSubmit}
          action=""
          className="text-sm flex flex-col gap-4 text-gray-700"
        >
          <div className="flex flex-col xl:flex-row items-center justify-between mb-4 gap-4">
            <div>
              <h1 className="text-xl text-gray-700">
                Registrar un nuevo usuario 🚀
              </h1>
              <small className="text-gray-500 mb-6">
                Llena de forma correcta los campos del prospecto
              </small>
            </div>
          </div>
          <Input
            name="name"
            value={formData.name}
            onChange={handleInputChange}

            type="text"
            label="Nombre completo"
            required
          />
          <Input
            name="email"
            value={formData.email}
            onChange={handleInputChange}

            type="text"
            label="Email"
            required
          />
          <Input
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}

            type="text"
            label="Teléfono"
            required
          />
          <TextArea
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            label="Dirección"
            required
          />
          <Input
            name="city"
            value={formData.city}
            onChange={handleInputChange}

            type="text"
            label="Ciudad"
            required
          />
          <Input
            name="department"
            value={formData.department}
            onChange={handleInputChange}

            type="text"
            label="Departamento"
            required
          />
          <select
            name="position"
            value={formData.position}
            onChange={handleInputChange}
            className="border border-blue-gray-300 rounded-md p-3"
          >
            <option value="" selected disabled>
              Posición
            </option>
            {POSITIONS.map((position) => (
              <option value={position}>
                {capitalizeFirstLetter(position)}
              </option>
            ))}
          </select>
          <select
            name="genre"
            value={formData.genre}
            onChange={handleInputChange}
            className="border border-blue-gray-300 rounded-md p-3"
          >
            <option value="" selected disabled>
              Genero
            </option>
            {GENRE.map((genre) => (
              <option value={genre}>{capitalizeFirstLetter(genre)}</option>
            ))}
          </select>
          <select
            name="role"
            value={formData.role}
            onChange={handleInputChange}
            className="border border-blue-gray-300 rounded-md p-3"
          >
            <option value="" selected disabled>
              Rol
            </option>
            {Object.keys(RolesArray).map((role) => (
              <option value={role}>
                {capitalizeFirstLetter(RolesArray[role as Roles])}
              </option>
            ))}
          </select>

          {/* password */}
          <div className="relative">
            <Input
            className="w-full"
              name="password"
              value={formData.password}
              onChange={handleInputChange}

                type="password"
              label="Contraseña"
              required
            />

          </div>
          {/* Confirm password */}
          <Input
            name="confirmPassword"
            value={confirmPassword}
            onChange={handleConfirmPassword}
            type="password"
            label="Confirmar contraseña"
            required
          />

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
