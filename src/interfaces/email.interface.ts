export interface Email {
  emailTo: string;
  subject: string;
  cc?: string;
  html: string;
}
