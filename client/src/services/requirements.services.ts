import axios from "axios";
import { Endpoints } from "../constants";

export function getRequirementByName(name: string) {
  return axios.get(`${Endpoints.REQUIREMENT}/search/?name=${name}`);
}

export function updateRequirementByName(name: string, requirements: string[]) {
    return axios.patch(`${Endpoints.REQUIREMENT}/${name}`, {
        name,
        requirements,
    });
}