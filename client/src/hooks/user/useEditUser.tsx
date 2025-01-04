import { useEffect, useState } from "react";
export const useEditUser = (id: string | undefined, user: any) => {

  const [updateUser, setUpdateUser] = useState({
    name: "",
    avatar: "",
    email: "",
    phone: "",
    address: "",
    department: "",
    city: "",
    genre: "",
    position: "",
    role: "",
    status: false,
    createdAt: "",
  });
  const [edit, setEdit] = useState(true);
  // const socket = useSelector((state:any) => state.socket.socket);
  useEffect(() => {
    setUpdateUser({
      name: user.name,
      phone: user.phone,
      address: user.address,
      department: user.department,
      position: user.position,
      email: user.email,
      role: user.role,
      status: user.status,
      genre: user.genre,
      city: user.city,
      avatar: user.avatar,
      createdAt: user.createdAt,
    });
  }, [user, id]);

  const handleUpdateUserChange = (e: any) => {
    if (e.target.name === "status") {
      setUpdateUser({
        ...updateUser,
        [e.target.name]: e.target.value === "Activo" ? true : false,
      });
    } else {
      setUpdateUser({
        ...updateUser,
        [e.target.name]: e.target.value,
      });
    }
  };

  const handleEdit = () => {
    setEdit(!edit);
  };

  const handleCancelEdit = () => {
    setUpdateUser(user);
    setEdit(true);
  };

  return {
    updateUser,
    setUpdateUser,
    edit,
    setEdit,
    handleUpdateUserChange,
    handleEdit,
    handleCancelEdit,
  };
};
