export interface IProject {
  _id: string;
  name: string;
  description: string;
  address: string;
  models?: IProjectModels[] | [];
    svg?: string;
}

export interface IProjectModels {
  model: string;
  price: string;
  priceWithDiscount: string;
  area: number;
}
