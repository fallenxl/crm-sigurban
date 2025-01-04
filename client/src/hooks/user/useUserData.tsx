import { useEffect, useState } from "react";
import { getUserByID } from "../../services/user.services";
import { useSelector } from "react-redux";
import { AppStore } from "../../redux/store";

export const useUserData = (id: string | undefined) => {
  const [user, setUser] = useState({
    _id: "",
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
    lastLead: new Date(),
  });
  const [isLoading, setIsLoading] = useState(false);


  const statusChange = useSelector(
    (state: AppStore) => state.status.statusChange
  );

  useEffect(() => {
    if (id) {
      setIsLoading(true);
      getUserByID(id).then((res) => {
        setIsLoading(false);
        setUser(res);
      });
    }
  }, [statusChange, id]);

  return {
    user,
    isLoading,
    setUser
  };
};
