import type { IBatch, IDeviationStat, ISignature, ISystemAlert, ISystemStatus, ISummaryCard } from "../types";

export const summaryData: ISummaryCard[] = [
  { title: "ACTIVE BATCHES (MONTHLY)", value: 12, trend: "+2", icon: "box" },
  { title: "OVERALL YIELD (ANNUAL)", value: "94.2%", trend: "+0.5%", icon: "flask" },
  { title: "SCHEDULED TASKS", value: "50%", trend: "-5%", icon: "calendar-check" },
  { title: "PENDING DEVIATIONS", value: 18, trend: "+3", icon: "triangle-exclamation" },
];

export const batchData: IBatch[] = [
  {
    id: "BAT-2024-101",
    productName: "Monoclonal Antibody A (mAb-A)",
    step: "Cell Culture (Bioreactor)",
    eta: "4h 15m",
    progress: 65,
  },
  {
    id: "BAT-2024-104",
    productName: "Recombinant Protein B",
    step: "Purification (Chromatography)",
    eta: "12h 00m",
    progress: 30,
  },
  {
    id: "BAT-2024-108",
    productName: "Vaccine Adjuvant C",
    step: "Fill & Finish",
    eta: "1h 10m",
    progress: 88,
  },
];

export const deviationData: IDeviationStat[] = [
  { name: "Critical", value: 3, color: "#dc3545" }, // Red
  { name: "Major", value: 5, color: "#fd7e14" }, // Orange
  { name: "Minor", value: 12, color: "#ffc107" }, // Yellow
];

export const signatureData: ISignature[] = [
  {
    id: "BAT-2024-089",
    docName: "mAb-A Production",
    type: "MFR Review",
    typeColor: "#6f42c1", // Purple
    waitTime: "4h 30m",
  },
  {
    id: "BAT-2024-092",
    docName: "Buffer Prep",
    type: "QA Release",
    typeColor: "#0d6efd", // Blue
    waitTime: "1h 15m",
  },
  {
    id: "EQP-BIO-004",
    docName: "Bioreactor Log",
    type: "Equip Log",
    typeColor: "#6c757d", // Gray
    waitTime: "20m",
  },
];

export const alertData: ISystemAlert = {
  message: "You have 2 critical maintenance alerts pending for Bioreactor B-02.",
  linkText: "View Maintenance Schedule",
  linkUrl: "/maintenance",
  type: "critical",
};

export const statusData: ISystemStatus[] = [
  { name: "Material Status", status: "Normal", bgClass: "bg-primary" }, // Blue
  { name: "System Uptime", status: "99.9%", bgClass: "bg-success" }, // Green
  { name: "Network", status: "Secure", bgClass: "bg-info" }, // Teal
  { name: "Audit Trail", status: "Active", bgClass: "bg-warning" }, // Yellow
];
