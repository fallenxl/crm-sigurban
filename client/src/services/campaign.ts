import axios from "axios";
import { Endpoints } from "../constants";
import { ICampaignDTO } from "../interfaces/campaing.interfaces";


export const createCampaign = async (data: ICampaignDTO) => {
  try {
    const response = await axios.post(Endpoints.CAMPAIGN, data);
    return response;
  } catch (error) {
    console.log(error);
  }
}

export const getAllCampaigns = async () => {
  try {
    const { data } = await axios.get(Endpoints.CAMPAIGN);
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const getAllCampaignsByStatus = async () => {
  try {
    const response = await axios.get(Endpoints.CAMPAIGN + "status/active");
    return response;
  } catch (error) {
    console.log(error);
  }
};

export const getCampaignByID = async (id: string) => {
  try {
    const response = await axios.get(`${Endpoints.CAMPAIGN}${id}`);
    return response;
  } catch (error) {
    console.log(error);
  }
};

export const updateCampaignByID = async (id: string, data: ICampaignDTO) => {
  try {
    const response = await axios.put(`${Endpoints.CAMPAIGN}${id}`, data);
    return response;
  } catch (error) {
    console.log(error);
  }
};

export const deleteCampaign = async (id: string) => {
  try {
    const response = await axios.delete(Endpoints.CAMPAIGN + id);
    return response;
  } catch (error) {
    console.log(error);
  }
};