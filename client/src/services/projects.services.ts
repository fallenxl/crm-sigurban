import axios from "axios";
import { Endpoints } from "../constants";
import { getLotsByProject } from "./lots.services";


export const createProject = async (data: any) => {
    try {
        const response = await axios.post(Endpoints.PROJECTS, data);
        return response
    } catch (error) {

    }

}

export const getProjectById = async (id: string) => {
    try {
        const response = await axios.get(`${Endpoints.PROJECTS}${id}`);
        return response
    } catch (error) {

    }

}


export const getAllProjects = async () => {
    try {
        const response = await  axios.get(Endpoints.PROJECTS);
        return response
    } catch (error) {

    }
};

export const getAllAvailableProjects = async () => {
    try {
        const response = await axios.get(Endpoints.PROJECTS_AVAILABLE);
        return response
    } catch (error) {

    }
}

export const getModelsByProjectID = async (id: string) => {
    try {
        const response = await axios.get(`${Endpoints.PROJECTS}models/${id}`);
        return response
    } catch (error) {

    }
}
export const getAllLotsByProjectID = async (id: string) => {
    try {
        const projects = await getProjectById(id);
        const lotsByProjectId = await getLotsByProject(id);

        const response = {
            ...projects?.data,
            lots: lotsByProjectId?.data
        }
        return response
    } catch (error) {

    }

}

export const updateProjectById = async (id: string, data: any) => {
    try {
        const response = await axios.put(`${Endpoints.PROJECTS}${id}`, data);
        const lotsByProjectId = await getLotsByProject(id);
        const responseWithLots = {
            ...response?.data,
            lots: lotsByProjectId?.data
        }
        console.log(responseWithLots)
        return responseWithLots
    } catch (error) {

    }
}

export const deleteProjectById = async (id: string) => {
    try {
        const response = await axios.delete(`${Endpoints.PROJECTS}${id}`);
        return response
    } catch (error) {

    }
}