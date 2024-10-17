import { Models } from "node-appwrite";

export interface User extends Models.Document {
  userId: string;
  name: string;
  email: string;
  phone: string;
  gender: Gender;
  address: string;
  identificationType: string | undefined;
  identificationNumber: string | undefined;
  identificationDocument: FormData | undefined;
  privacyConsent: boolean;
}

export interface Appointment extends Models.Document {
  user: User;
  schedule: Date;
  status: Status;
  primaryPhysician: string;
  reason: string;
  note: string;
  userId: string;
  cancellationReason: string | null;
}