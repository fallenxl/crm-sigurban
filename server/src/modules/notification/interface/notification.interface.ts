export interface INotification {
    _id?: string;
    title: string;
    message?: string;
    read?: boolean;
    userID?: string;
    leadID?: string;
}