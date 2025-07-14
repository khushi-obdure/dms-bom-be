export interface DataStoredInToken {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: number;
  phone_extension: string;
  user_type: number;
  status: number;
}

export interface TokenData {
  token: string;
  expiresIn: number;
}
