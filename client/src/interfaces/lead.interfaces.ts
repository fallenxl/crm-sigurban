export interface LeadDTO {
    name: string
    phone: string
    email: string
    address: string
    source: string
    interestedIn: string
    comment: string
    campaignID?: string
    advisorID?: string
}

export interface CreateLeadDTO {
    name: string,
    dni: string,
    email: string,
    birthdate: string,
    genre: string,
    phone: string,
    address: string,
    country: string,
    department: string,
    municipality: string,
    source: string,
    interestedIn: string,
    workAddress: string,
    workPosition: string,
    salary: string,
    workTime: string,
    paymentMethod: string,
    comment: string,
    passport?: string,
    residenceNumber?: string,

}