import { useEffect, useState } from "react";
import { Table } from "../../component/table/Table";
import { Layout } from "../Layout";
import { useSelector } from "react-redux";
import { AppStore } from "../../redux/store";
import { deleteUser, getAllUsers } from "../../services/user.services";
import { Roles, RolesArray } from "../../constants";

export function UsersList() {
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const { user } = useSelector((state: AppStore) => state.auth);
  useEffect(() => {
    if (user.role) {
      setIsLoading(true);
      getAllUsers().then((res) => {
        setIsLoading(false);
        setUsers(res);
      });
    }
  }, []);
  const handleDelete = (id: string) => {
    deleteUser(id).then((_res) => {
      window.location.reload();
    });
  };
  const tableHead = [{
    key: "name",
    value: "Nombre",
  },
  {
    key: "email",
    value: "Correo",
  },
  {
    key: "phone",
    value: "Teléfono",
  },
  {
    key: "role",
    value: "Rol",
  },
  {
    key: "position",
    value: "Puesto",
  },
  {
    key: "status",
    value: "Estado",
  }];
  
  const tableRows = users.map((user: any) => {
    return {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: RolesArray[user.role as Roles],
      position: user.position,
      status: user.status ? "Activo" : "Inactivo",
    };
  });
  return (
    <Layout title="Lista de Usuarios">
      <Table
        isLoading={isLoading}
        path="/usuarios/"
        tableHead={tableHead}
        tableRows={tableRows}
        title="Lista de usuarios"
        description="Lista de todos los usuarios"
        handleDelete={handleDelete}
      />
    </Layout>
  );
}
