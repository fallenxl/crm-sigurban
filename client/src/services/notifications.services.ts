import axios from "axios"
import { Endpoints } from "../constants"

export const getNotifications = async (count:number, page:number) => {
    try {
        const { data } = await axios.get(Endpoints.NOTIFICATIONS+'?count='+count+'&page='+page)
        return data
    } catch (error) {
        console.log(error)
    }
}

export const readAllNotifications = async () => {
    try {
        const { data } = await axios.put(Endpoints.NOTIFICATIONS)
        return data
    } catch (error) {
        console.log(error)
    }
}

export const readNotificationById = async (id:string) => {
    try {
        const { data } = await axios.put(Endpoints.NOTIFICATIONS+id)
        return data
    } catch (error) {
        console.log(error)
    }
}