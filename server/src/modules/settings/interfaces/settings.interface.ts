export interface IGoal {
    _id: string;
    name: string;
    description: string;
    target: number;
    achieved: number;
    date: Date;
}