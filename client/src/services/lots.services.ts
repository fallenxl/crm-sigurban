import axios from "axios";
import { Endpoints } from "../constants";


export const createLot = async (lot: any) => {
  try {
    const response = await axios.post(Endpoints.LOTS, lot);
    console.log(response);
    return response;
  } catch (error) {
    throw error;
  }

}

export const getAllLots = async () => {
  try {
    const response = await axios.get(Endpoints.LOTS+"all");
    console.log(response);
    return response;
  } catch (error) {
    throw error;
  }
};

export const getLotsByProject = async (projectId: string) => {
  try {
    const response = await axios.get(Endpoints.LOTS_BY_PROJECT + projectId);
    return response;
  } catch (error) {
    throw error;
  }
};

export const getLotsAvailable = async () => {
  try {
    const response = await axios.get(Endpoints.LOTS);
    return response;
  } catch (error) {
    throw error;
  }
};

export const getLotByID = async (lotId: string) => {
  try {
    const response = await axios.get(Endpoints.LOTS + lotId);
    return response;
  } catch (error) {
    throw error;
  }
};

export const getLotsByProjectAndStatus = async (
  projectId: string,
  status: string
) => {
  try {
    const response = await axios.get(
      Endpoints.LOTS_BY_PROJECT + projectId + "/" + status
    );
    console.log(response.data);
    return response;
  } catch (error) {
    throw error;
  }

};
export const updateLotService = async (lot: any) => {
  try {
    const response = await axios.put(Endpoints.LOTS + lot._id, lot);
    return response;
  } catch (error) {
    throw error;
  }

}
export const deleteLot = async (lotId: string) => {
  try {
    const response = await axios.delete(Endpoints.LOTS + lotId);
    return response;
  } catch (error) {
    throw error;
  }
};
