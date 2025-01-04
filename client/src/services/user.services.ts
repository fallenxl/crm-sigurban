import axios from "axios";
import { Endpoints } from "../constants";
import { UserDTO } from "../interfaces";

export const createUser = async (user: UserDTO) => {
  try {
    const response = await axios.post(Endpoints.USER + "/register", user);
    return response;
  } catch (error) {
    console.log(error);
  }
};

export const updateUserByID = async (id: string, user: Partial<UserDTO>) => {
  try {
    const response = await axios.put(Endpoints.USER + "/edit/" + id, user);
    return response;
  } catch (error) {
    console.log(error);
  }
};

export const getUserByID = async (id: string) => {
  try {
    const { data } = await axios.get(Endpoints.USER + "/" + id);
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const getUsersByRole = async (role: string) => {
  try {
    const { data } = await axios.get(Endpoints.USER + "?role=" + role);
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const getAdvisorsIncludingManagers = async () => {
  try {
    const { data } = await axios.get(Endpoints.USER + "/advisors/all");
    return data;
  } catch (error) {
    console.log(error);
  }
}

export const getAllAdvisor = async () => {
  try {
    const { data } = await axios.get(Endpoints.USER + "/advisors");
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const getAllManager = async () => {
  try {
    const { data } = await axios.get(Endpoints.USER + "/managers");
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const getAllBankManager = async () => {
  try {
    const { data } = await axios.get(Endpoints.USER + "?role=BANK_MANAGER");
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const getAllUsers = async () => {
  try {
    const { data } = await axios.get(Endpoints.USER);
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const getLastAdvisor = async () => {
  try {
    const response = await axios.get(Endpoints.USER + "/advisors/last");
    return response;
  } catch (error) {
    console.log(error);
  }
};
export const updateUserSettings = async (id: string, settings: any) => {
    try {
        const response = await axios.put(Endpoints.USER + "/edit/settings/" + id, settings);
        return response;
    } catch (error) {
        console.log(error);
    }

}
export const getUserSettings = async (id: string) => {
    try {
        const { data } = await axios.get(Endpoints.USER + "/settings/" + id);
        return data;
    } catch (error) {
        console.log(error);
    }

}

export const getSettingsAutoAssign = async (id: string) => {
  try {
    const { data } = await axios.get(
      Endpoints.USER + "/settings/autoassign/" + id
    );
    return data;
  } catch (error) {
    console.log(error);
  }
};
export const updateUserPassword = async (id: string, password: string) => {
  try {
    const response = await axios.put(Endpoints.USER + "/edit/password/" + id, {
      password,
    });
    return response;
  } catch (error) {
    console.log(error);
  }
};
export const updateSettingsAutoAssign = async (id: string) => {
  try {
    const response = await axios.put(
      Endpoints.USER + "/settings/autoassign/" + id
    );
    return response;
  } catch (error) {
    console.log(error);
  }
};

export const deleteUser = async (id: string) => {
  try {
    const response = await axios.delete(Endpoints.USER + "/delete/" + id);
    return response;
  } catch (error) {
    console.log(error);
  }


};
