import axios from "axios";
import { Endpoints } from "../constants";

export async  function findRoles() {
 try {
   const response = await axios.get(Endpoints.ROLES);
    return response.data;
 }catch (error) {
    console.error(error);
 }
}

export async function createRole(data: any) {
    try {
    const response = await axios.post(Endpoints.ROLES, data);
        return response.data;
    }catch (error) {
        console.error(error);
    }
}