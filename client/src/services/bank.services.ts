import axios from "axios";
import { Endpoints } from "../constants";

export const getAllBanks = async () => {
    try {
        const { data } = await axios.get(Endpoints.BANK);
        return data;
    } catch (error) {

    }
};

export const getBankById = async (id: string) => {
    try {
        return await axios.get(`${Endpoints.BANK}/${id}`);

    } catch (error) {

    }
};

export const updateBankById = async (id: string, bank: any) => {
    try {
        return await axios.put(`${Endpoints.BANK}/${id}`, bank);
    
    } catch (error) {

    }
};

export const deleteBankById = async (id: string) => {
    try {
        const { data } = await axios.delete(`${Endpoints.BANK}/${id}`);
        return data;
    } catch (error) {

    }
};

