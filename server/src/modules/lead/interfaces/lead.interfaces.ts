import { Roles } from 'src/constants';

export interface LeadStatus {
  type: string;
  enum: string[];
  selected?: string;
  condition?: string;
  role?: Roles[];
}

export enum LeadStatusEnum {
  FUTURE_SALES_OPPORTUNITY = 'Oportunidad de venta futura',
  TO_CALL = 'A Contactar',
  CONTACTED = 'Contactado',
  NOT_CONTACTED = 'No dio Información',
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
  POTENTIAL_CUSTOMER = 'Cliente Potencial',
  DOCUMENTATION = 'Documentación 1era Etapa',
  SENDED_TO_REVIEW_FIRST_STAGE = 'Enviado a revisión 1era Etapa',
  THERE_ARE_SUBSIDIARIES = 'Hay Subsanaciones',
  THERE_ARE_NOT_SUBSIDIARIES = 'No hay Subsanaciones',
  REQUEST_APPRAISAL = 'Solicitar Avalúo',
  SEND_TO_APPRAISAL = 'Enviar a Avalúo',
  FIRST_STAGE_OF_FILE = 'Primera Etapa de Expediente',
  SEND_APPRAISAL = 'Enviar Avalúo',
  SECOND_STAGE_OF_FILE = 'Segunda Etapa de Expediente',
  SENDED_REVIEW_IN_BANK = 'Enviado a Revisión en Banco',
  REVISION_OF_FILE = "Revision de Expediente",
  SEND_TO_BANK = 'Enviar a Banco',
  APPROVED = 'Aprobado',
  DEFAULT = 'Selecciona un estado',
  CHANGE_BANK = 'Cambiar Banco',
  CANCEL_PROSPECT =
  "Anular Prospecto",
  CANCEL_PROSPECT_CONFIRMED = "Anulado",
  ACTIVE_PROSPECT = "Activar Prospecto",
}

export const LeadStatustype = {
  FUTURE_SALES_OPPORTUNITY: {
    type: LeadStatusEnum.FUTURE_SALES_OPPORTUNITY,
    enum: [LeadStatusEnum.TO_CALL, LeadStatusEnum.DEFAULT],
    selected: LeadStatusEnum.DEFAULT,
    role: [Roles.ADVISOR],
  },
  PENDING_CALL: {
    type: LeadStatusEnum.PENDING_CALL,
    enum: [LeadStatusEnum.CONTACTED, LeadStatusEnum.DEFAULT],
    selected: LeadStatusEnum.DEFAULT,
    role: [Roles.ADVISOR],
  },
  PROSPECT: {
    type: LeadStatusEnum.PROSPECT,
    enum: [LeadStatusEnum.TO_ASSIGN_PROJECT, LeadStatusEnum.DEFAULT],
    selected: LeadStatusEnum.DEFAULT,

  },
  TO_CALL: {
    type: LeadStatusEnum.TO_CALL,
    enum: [
      LeadStatusEnum.NOT_CONTACTED,
      LeadStatusEnum.CONTACTED,
      LeadStatusEnum.DO_NOT_ANSWER,
      LeadStatusEnum.DEFAULT,
    ],
    selected: LeadStatusEnum.DEFAULT,
    role: [Roles.ADVISOR],
  },
  TO_BUREAU_PREQUALIFIED: {
    type: LeadStatusEnum.TO_BUREAU_PREQUALIFIED,
    enum: [
      LeadStatusEnum.DEFAULT,
      LeadStatusEnum.BUREAU_PREQUALIFIED,
      LeadStatusEnum.NOT_BUREAU_PREQUALIFIED,
      LeadStatusEnum.FUTURE_SALES_OPPORTUNITY,
    ],
    selected: LeadStatusEnum.DEFAULT,
    role: [Roles.MANAGER],
  },
  TO_BANK_PREQUALIFIED: {
    type: LeadStatusEnum.TO_BANK_PREQUALIFIED,
    enum: [
      LeadStatusEnum.BANK_PREQUALIFIED,
      LeadStatusEnum.NOT_BANK_PREQUALIFIED,
      LeadStatusEnum.DEFAULT,
    ],
    selected: LeadStatusEnum.DEFAULT,
    role: [Roles.BANK_MANAGER],
  },
  TO_ASSIGN: {
    type: LeadStatusEnum.TO_ASSIGN,
    enum: [LeadStatusEnum.TO_CALL, LeadStatusEnum.DEFAULT],
    selected: LeadStatusEnum.DEFAULT,
    role: [Roles.RECEPTIONIST],
  },
  TO_ASSIGN_PROJECT: {
    type: LeadStatusEnum.TO_ASSIGN_PROJECT,
    enum: [
      LeadStatusEnum.DEFAULT,
      LeadStatusEnum.ASSIGN_PROJECT,
      LeadStatusEnum.NOT_ASSIGN_PROJECT,
    ],
    selected: LeadStatusEnum.DEFAULT,
    role: [Roles.ADVISOR],
  },
  TO_ASSIGN_HOUSE: {
    type: LeadStatusEnum.TO_ASSIGN_HOUSE,
    enum: [
      LeadStatusEnum.DEFAULT,
      LeadStatusEnum.ASSIGN_HOUSE,
      LeadStatusEnum.TO_ASSIGN_PROJECT,
    ],
    selected: LeadStatusEnum.DEFAULT,
    role: [Roles.ADVISOR],
  },
  PROSPECT_DEFINED: {
    type: LeadStatusEnum.PROSPECT_DEFINED,
    enum: [
      LeadStatusEnum.DEFAULT,
      LeadStatusEnum.PAYMENT_CONFIRMED,
      LeadStatusEnum.NOT_PAYMENT_CONFIRMED,
    ],
    selected: LeadStatusEnum.DEFAULT,
    condition: null,
    role: [Roles.ADVISOR],
  },
  POTENTIAL_CUSTOMER: {
    type: LeadStatusEnum.POTENTIAL_CUSTOMER,
    enum: [LeadStatusEnum.DEFAULT, LeadStatusEnum.DOCUMENTATION],
    selected: LeadStatusEnum.DEFAULT,
    role: [Roles.ADVISOR],
  },
  SENDED_TO_REVIEW_IN_BANK: {
    type: LeadStatusEnum.SENDED_TO_REVIEW_FIRST_STAGE,
    enum: [
      LeadStatusEnum.DEFAULT,
      LeadStatusEnum.THERE_ARE_SUBSIDIARIES,
      LeadStatusEnum.THERE_ARE_NOT_SUBSIDIARIES,
    ],
    selected: LeadStatusEnum.DEFAULT,
    role: [Roles.BANK_MANAGER],
  },
  FIRST_STAGE_OF_FILE: {
    type: LeadStatusEnum.FIRST_STAGE_OF_FILE,
    enum: [
      LeadStatusEnum.DEFAULT,
      LeadStatusEnum.SEND_APPRAISAL,
      LeadStatusEnum.THERE_ARE_SUBSIDIARIES,
    ],
    selected: LeadStatusEnum.DEFAULT,
    role: [Roles.BANK_MANAGER],
  },
  SECOND_STAGE_OF_FILE: {
    type: LeadStatusEnum.SECOND_STAGE_OF_FILE,
    enum: [LeadStatusEnum.DEFAULT, LeadStatusEnum.SEND_TO_APPRAISAL, LeadStatusEnum.THERE_ARE_SUBSIDIARIES],
    selected: LeadStatusEnum.DEFAULT,
    role: [Roles.ADVISOR],
  },
  SECOND_REVIEW_IN_BANK: {
    type: LeadStatusEnum.SENDED_REVIEW_IN_BANK,
    enum: [LeadStatusEnum.DEFAULT, LeadStatusEnum.THERE_ARE_SUBSIDIARIES, LeadStatusEnum.THERE_ARE_NOT_SUBSIDIARIES],
    selected: LeadStatusEnum.DEFAULT,
    role: [Roles.BANK_MANAGER],
  },
  REVISION_OF_FILE: {
    type: LeadStatusEnum.REVISION_OF_FILE,
    enum: [LeadStatusEnum.DEFAULT, LeadStatusEnum.THERE_ARE_SUBSIDIARIES, LeadStatusEnum.THERE_ARE_NOT_SUBSIDIARIES],
    selected: LeadStatusEnum.DEFAULT,
    role: [Roles.BANK_MANAGER],
  },
  SEND_TO_BANK: {
    type: LeadStatusEnum.SEND_TO_BANK,
    enum: [LeadStatusEnum.DEFAULT, LeadStatusEnum.THERE_ARE_SUBSIDIARIES, LeadStatusEnum.THERE_ARE_NOT_SUBSIDIARIES],
    selected: LeadStatusEnum.DEFAULT,
    role: [Roles.MANAGER],
  
  },
  APPROVED: {
    type: LeadStatusEnum.APPROVED,
    enum: [LeadStatusEnum.DEFAULT, LeadStatusEnum.THERE_ARE_SUBSIDIARIES, LeadStatusEnum.THERE_ARE_NOT_SUBSIDIARIES],
    selected: LeadStatusEnum.DEFAULT,
    role: [Roles.BANK_MANAGER],

  },
  CANCEL_PROSPECT: {
    type: LeadStatusEnum.CANCEL_PROSPECT_CONFIRMED,
    enum: [LeadStatusEnum.DEFAULT, LeadStatusEnum.ACTIVE_PROSPECT],
    selected: LeadStatusEnum.DEFAULT,
    role: [Roles.ADVISOR],
  }
  
};

export class LeadTimeline {
  _id?: string;
  status: LeadStatus;
  date?: Date;
  message?: string;
  title: string;
  updatedBy?: string;
}

export const LEAD_COLUMNS = {
  name: 'Nombre Completo',
  dni: 'DNI',
  passport: 'Pasaporte',
  residenceNumber: 'Carnet de Residencia',
  phone: 'Teléfono',
  email: 'Email',
  address: 'Dirección',
  department: 'Departamento',
  country: 'País',
  avatar: 'Avatar',
  source: 'Canal',
  interestedIn: 'Interesado en',
  paymentMethod: 'Método de pago',
  workPosition: 'Cargo',
  workAddress: 'Lugar de trabajo',
  workTime: 'Tiempo laboral',
  salary: 'Salario',
  bankID: 'Banco',
  financingProgram: 'Programa de Financiamiento',
  municipality: 'Municipio',
  birthdate: 'Fecha de Nacimiento',
};
