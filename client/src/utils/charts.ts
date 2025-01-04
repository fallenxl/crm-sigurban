export function getStatusColor(status: string) {
    switch (status.toLowerCase()) {
        case 'por asignar':
            // gray
            return '#BDBDBD';
        case 'oportunidad de venta futura':
            // purple
            return '#7E57C2';
        case 'pendiente de llamar':
            return '#98ff96'
        case 'a contactar':
            return '#5ccb5f'
        case 'precalificar buró':
            return '#009929'
        case 'precalificar banco':
            return '#006414'
        case 'por asignar proyecto':
            return '#efb810'
        case 'por asignar modelo de casa':
            return '#efb810'
        case 'anulado':
            return '#BDBDBD'
        case 'liquidado':
            // red
            return '#FF5252';
        case 'disponible':
            // green
            return '#4CAF50';
        case 'reservado':
            // orange
            return '#FF9800';
        case 'activo':
            // green
            return '#4CAF50';
        case 'inactivo':
            // red
            return '#FF5252';
        default:
            return '#54b2ff'
    }
}