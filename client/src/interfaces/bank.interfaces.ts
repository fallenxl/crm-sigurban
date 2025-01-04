export interface Bank {
    _id : string;
    name : string;
    description : string;
    financingPrograms : FinancialProgram[]; 
    requirements? : string[];
    createdAt : string;
}
export interface FinancialProgram {
    name: string;
    description: string;
    interestRate: number;
  }