import moment from 'moment';
import 'moment/locale/es-mx';

export function getTimeOfDay(): string {
    const date = new Date();
    const hour = date.getHours();
  
    if (hour >= 6 && hour < 12) {
      return 'Buenos dias 🌤'; // De 6:00 AM a 11:59 AM
    } else if (hour >= 12 && hour < 18) {
      return 'Buenas tardes ⛅'; // De 12:00 PM a 5:59 PM
    } else {
      return 'Buenas noches 🌙'; // De 6:00 PM a 5:59 AM del día siguiente
    }
  }

  export function getFormattedDate(date: string): string {
    return moment(date).format('YYYY-MM-DD');
  }

  export function getDays(date: Date): string {
    moment.locale('es');
    const formatDate = moment(date)
    return formatDate.fromNow();
  }