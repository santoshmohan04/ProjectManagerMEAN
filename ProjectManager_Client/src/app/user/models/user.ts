export interface User {
  User_ID?: number;
  First_Name: string;
  Last_Name: string;
  Employee_ID: number;
  Project_ID?: number;
  Task_ID?: number;
  Full_Name?: string;
  _id?: string;
}

export interface UserPayload {
  First_Name: string;
  Last_Name: string;
  Employee_ID: string;
}
