import axios from "axios";
import { Endpoints } from "../constants";

export async function getDashboardService({
  startDate,
  endDate,
}: {
  startDate?: string;
  endDate?: string;
}) {
  try {

    if(startDate && endDate){
      if(startDate > endDate) throw new Error('La fecha de inicio no puede ser mayor a la fecha de fin');
      const response = await axios.get(Endpoints.DASHBOARD, {
        params: {
          startDate,
          endDate,
        },
      });
      return response;
    }
    const response = await axios.get(Endpoints.DASHBOARD);

    console.log(response.data);
    return response;
  } catch (error) {
    return error;
  }
}

function getFormatExtension(format: string) {
  switch (format) {
    case 'pdf':
      return 'pdf';
    case 'csv':
      return 'csv';
    case 'excel':
      return "xlsx";
    default:
      return 'pdf';
  }
}
export async function exportDataService(format: string) {
  try {
    const response = await axios.post(Endpoints.EXPORT_DATA, {
      format,
    },{
      responseType: 'blob'
    });

    // download file
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    
    link.setAttribute('download', `reporte.${getFormatExtension(format)}`);
    document.body.appendChild(link);
    link.click();
    return response;
  } catch (error) {
    return error;
  }
}