
export interface AttendanceRecord {
  id: string;
  name: string;
  institution: string;
  position: string;
  whatsapp: string;
  signature: string; // Base64 image
  timestamp: string;
}

export interface AppConfig {
  googleSheetUrl: string;
  isSyncEnabled: boolean;
}

export enum AppView {
  FORM = 'form',
  DASHBOARD = 'dashboard'
}
