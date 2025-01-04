export interface IRole {
    _id?: string;
    name: string;
    permissions: {
      module: string;
      access: string[];
    }[];
  
  }