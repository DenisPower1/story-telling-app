export interface user {
  name: string;
  email: string;
  password: string;
  birthDate: {
    day: number;
    month: number;
    year: number;
  };
}
