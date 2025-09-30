import { Project } from "src/app/project/models/project";

export interface User {
  _id: string;
  First_Name: string;
  Last_Name: string;
  Employee_ID: string;
  Project_ID: string | null;
  Task_ID: string | null;
  Project: Project | null;
}
