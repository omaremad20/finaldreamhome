export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  job: string | null;
  contactNumber: string;
  images: string | null;
  rate: number | null;
}
