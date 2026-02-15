export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  USER = 'USER',
}

export interface User {
  uuid?: string;
  _id?: string;
  User_ID?: number;
  // Backend fields (camelCase)
  firstName: string;
  lastName: string;
  employeeId?: string;
  email?: string;
  role?: UserRole;
  isActive?: boolean;
  lastLogin?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  // Computed/Legacy fields
  fullName?: string;
  First_Name?: string;
  Last_Name?: string;
  Full_Name?: string;
  Employee_ID?: number | string;
  Project_ID?: number;
  Task_ID?: number;
  Project?: any;
}

export interface UserPayload {
  First_Name: string;
  Last_Name: string;
  Employee_ID: string;
  email?: string;
  password?: string;
  role?: UserRole;
}

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  employeeId?: string;
  role?: UserRole;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  employeeId?: string;
  role?: UserRole;
  isActive?: boolean;
}
