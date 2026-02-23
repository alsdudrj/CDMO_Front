export interface ISummaryCard {
  title: string;
  value: string | number;
  icon?: string; // Icon name e.g. "box"
  trend?: string; // e.g. "+5%"
}

export interface IBatch {
  id: string; // e.g., "BAT-2024-101"
  productName: string; // e.g., "Monoclonal Antibody A (mAb-A)"
  step: string; // e.g., "Cell Culture (Bioreactor)"
  eta: string; // e.g., "4h 15m"
  progress: number; // e.g., 65
}

export interface IDeviationStat {
  name: string; // e.g., "Critical"
  value: number; // e.g., 3
  color: string; // e.g., "#dc3545"
}

export interface ISignature {
  id: string; // e.g., "BAT-2024-089"
  docName: string; // e.g., "mAb-A Production"
  type: string; // e.g., "MFR Review"
  typeColor: string; // e.g., "#6f42c1" (purple)
  waitTime: string; // e.g., "4h 30m"
}

export interface ISystemAlert {
  message: string;
  linkText?: string;
  linkUrl?: string;
  type: 'maintenance' | 'critical' | 'info';
}

export interface ISystemStatus {
  name: string; // e.g., "Material Status"
  status: string; // e.g., "Normal"
  bgClass: string; // e.g., "bg-primary" or custom class
}
