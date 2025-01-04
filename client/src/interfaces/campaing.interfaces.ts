export interface ICampaign {
    _id: string;
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    status: boolean;
}

export interface ICampaignDTO {
    name: string;
    status?: boolean;
    description?: string;
    startDate?: string;
    endDate?: string;
}