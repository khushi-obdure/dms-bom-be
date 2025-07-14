export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  employeeCode: string
  department: string
  designation: string
  plantId: string;
  roleId: string;
  isLoggedIn: boolean
}
