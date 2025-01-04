import { Roles } from "src/constants";

export interface LeadStatus {
  type: string;
  enum: string[];
  selected?: string;
  role?: Roles;
}

export enum LeadStatusEnum {
  FUTURE_SALES_OPPORTUNITY = 'Oportunidad de venta futura',
  TO_CALL = 'A Contactar',
  CONTACTED = 'Contactado',
  NOT_CONTACTED = 'No dio informacion',
  DO_NOT_ANSWER = 'No contesto',
  CALL_AGAIN = 'Volver a llamar',
  PENDING_CALL = 'Pendiente de llamar',
  TO_BANK_PREQUALIFIED = 'Precalificar Banco',
  BANK_PREQUALIFIED = 'Precalifica en Banco',
  NOT_BANK_PREQUALIFIED = 'No Precalifica en Banco',
  TO_BUREAU_PREQUALIFIED = 'Precalificar Buró',
  BUREAU_PREQUALIFIED = 'Precalifica en Buró',
  NOT_BUREAU_PREQUALIFIED = 'No Precalifica en Buró',
  PROSPECT = 'Prospecto',
  ASSIGN_PROJECT = 'Asignar Proyecto',
  TO_ASSIGN = 'Por Asignar',
  TO_ASSIGN_PROJECT = 'Por Asignar Proyecto',
  NOT_ASSIGN_PROJECT = 'No Asignar Proyecto',
  TO_ASSIGN_HOUSE = 'Por Asignar Modelo de Casa',
  ASSIGN_HOUSE = 'Asignar Modelo de Casa',
  NOT_ASSIGN_HOUSE = 'No Asignar Modelo de Casa',
  PROSPECT_DEFINED = 'Prospecto Definido',
  PAYMENT_CONFIRMED = 'Pago Confirmado',
  NOT_PAYMENT_CONFIRMED = 'Pago No Confirmado',
  DEFAULT= 'Selecciona un estado'
}

export const LeadStatustype = {

  FUTURE_SALES_OPPORTUNITY: {
    type: LeadStatusEnum.FUTURE_SALES_OPPORTUNITY,
    enum: [LeadStatusEnum.TO_CALL, LeadStatusEnum.DEFAULT],
    selected: LeadStatusEnum.DEFAULT,
    role: Roles.ADVISOR
  },
  PENDING_CALL: {
    type: LeadStatusEnum.PENDING_CALL,
    enum: [LeadStatusEnum.CONTACTED,LeadStatusEnum.NOT_CONTACTED, LeadStatusEnum.DEFAULT,  LeadStatusEnum.CALL_AGAIN],
    selected: LeadStatusEnum.DEFAULT,
    role: Roles.ADVISOR
  }
  ,
  PROSPECT:{
    type: LeadStatusEnum.PROSPECT,
    enum: [ LeadStatusEnum.TO_ASSIGN_PROJECT, LeadStatusEnum.DEFAULT],
    selected: LeadStatusEnum.DEFAULT,
  },
  TO_CALL: {
    type: LeadStatusEnum.TO_CALL,
    enum: [LeadStatusEnum.NOT_CONTACTED, LeadStatusEnum.CONTACTED,LeadStatusEnum.DO_NOT_ANSWER, LeadStatusEnum.DEFAULT],
    selected: LeadStatusEnum.DEFAULT,
    role: Roles.ADVISOR
  },
  TO_BUREAU_PREQUALIFIED: {
    type: LeadStatusEnum.TO_BUREAU_PREQUALIFIED,
    enum: [LeadStatusEnum.DEFAULT,LeadStatusEnum.BUREAU_PREQUALIFIED, LeadStatusEnum.NOT_BUREAU_PREQUALIFIED, LeadStatusEnum.FUTURE_SALES_OPPORTUNITY],
    selected: LeadStatusEnum.DEFAULT,
    role: Roles.MANAGER
  },
  TO_BANK_PREQUALIFIED: {
    type: LeadStatusEnum.TO_BANK_PREQUALIFIED,
    enum: [LeadStatusEnum.BANK_PREQUALIFIED, LeadStatusEnum.NOT_BANK_PREQUALIFIED, LeadStatusEnum.DEFAULT],
    selected: LeadStatusEnum.DEFAULT,
    role: Roles.BANK_MANAGER
  },
  TO_ASSIGN: {
    type: LeadStatusEnum.TO_ASSIGN,
    enum: [LeadStatusEnum.TO_CALL, LeadStatusEnum.DEFAULT],
    selected: LeadStatusEnum.DEFAULT,
    role: Roles.RECEPTIONIST
  },
  TO_ASSIGN_PROJECT: {
    type: LeadStatusEnum.TO_ASSIGN_PROJECT,
    enum: [ LeadStatusEnum.DEFAULT, LeadStatusEnum.ASSIGN_PROJECT, LeadStatusEnum.NOT_ASSIGN_PROJECT],
    selected: LeadStatusEnum.DEFAULT,
    role: Roles.ADVISOR
  },
  TO_ASSIGN_HOUSE: {
    type: LeadStatusEnum.TO_ASSIGN_HOUSE,
    enum:  [LeadStatusEnum.DEFAULT, LeadStatusEnum.ASSIGN_HOUSE, LeadStatusEnum.TO_ASSIGN_PROJECT],
    selected: LeadStatusEnum.DEFAULT,
    role: Roles.ADVISOR
  },
  PROSPECT_DEFINED: {
    type: LeadStatusEnum.PROSPECT_DEFINED,
    enum: [LeadStatusEnum.DEFAULT, LeadStatusEnum.PAYMENT_CONFIRMED, LeadStatusEnum.NOT_PAYMENT_CONFIRMED],
    selected: LeadStatusEnum.DEFAULT,
    role: Roles.ADVISOR
  },
  PAYMENT_CONFIRMED: {
    type: LeadStatusEnum.PAYMENT_CONFIRMED,
    enum: [LeadStatusEnum.DEFAULT, LeadStatusEnum.NOT_PAYMENT_CONFIRMED],
    selected: LeadStatusEnum.DEFAULT,
    role: Roles.ADVISOR
  },  

 
}




export class LeadTimeline {
  _id?: string;
  status: LeadStatus;
  date?: Date;
  message?: string;
  title: string;
  updatedBy?: string;
}
