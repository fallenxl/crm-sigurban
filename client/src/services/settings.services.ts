import axios from "axios";
import {Endpoints} from "../constants";

export async function  getSettings() {
    try {
        const response = await axios.get(Endpoints.SETTINGS);
        return response;
    } catch (error) {
        console.log(error);
    }
}

export async function  updateSettings(data:{
    bureauPrequalificationDays: number,
    bankPrequalificationDays: number,
}) {
    try {
        const response = await axios.patch(Endpoints.SETTINGS, data);
        return response;
    } catch (error) {
        console.log(error);
    }
}

export async function createGoal(data:{
    name: string,
    description: string,
    target: string,
    startDate: string,
    endDate: string,
}, type: 'general' | 'advisor') {
    try {
        if(type === 'general') {
            const response = await axios.post(Endpoints.SETTINGS_GOAL_GENERAL, data);
            return response;
        } else if(type === 'advisor') {
            const response = await axios.post(Endpoints.SETTINGS_GOAL_ADVISOR, data);
            return response;
        }
    } catch (error) {
        console.log(error);
    }
}


export async function deleteGoal(id: string, type: 'general' | 'advisor') {
    try {
        if(type === 'general') {
            const response = axios.delete(`${Endpoints.SETTINGS_GOAL_GENERAL}/${id}`);
            return response;
        } else if(type === 'advisor') {
            const response = axios.delete(`${Endpoints.SETTINGS_GOAL_ADVISOR}/${id}`);
            return response;
        }
    } catch (error) {
        console.log(error);
    }
}