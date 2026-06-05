export interface TransformerRecord {
  Timestamp: string;
  Ambient_Temperature_C: number;
  Age_yr: number;
  Maintenance_Count: number;
  No_of_Short_Circuits: number;
  Outages_hours_per_year: number;
  Current_A: number;
  Voltage_kV: number;

  Temp_score: number;
  Age_score: number;
  Maintenance_score: number;
  ShortCircuit_score: number;
  Outage_score: number;
  Current_score: number;
  Voltage_score: number;

  HI: number;
  Predicted_HI: number;
}

export interface TransformerStatus {
  id: string; // e.g., TRF-01
  healthIndex: number;
  predictedHI: number;
  status: 'Healthy' | 'Moderate' | 'At Risk' | 'Critical';
  rulDays: number;
  ageYears: number;
  overallWeightage: number;
  ambientTemp: number;
  current: number;
  voltage: number;
  outages: number;
  shortCircuits: number;
  maintenanceCount: number;
  history: {
    timestamp: string;
    healthIndex: number;
    predictedHI: number;
    voltage: number;
    current: number;
    temp: number;
  }[];
}

export type SidebarPage =
  | 'overview'
  | 'real-time-monitor'
  | 'health-index'
  | 'key-parameters'
  | 'historical-trends'
  | 'alerts'
  | 'model-performance'
  | 'feature-importance'
  | 'data-insights'
  | 'rul-dashboard'
  | 'prediction-trend'
  | 'transformer-rank'
  | 'maintenance-history'
  | 'maintenance-plan'
  | 'upcoming-tasks'
  | 'all-transformers'
  | 'transformer-details'
  | 'asset-hierarchy'
  | 'outage-events'
  | 'short-circuits'
  | 'event-log';

export interface AlertNotification {
  id: string;
  transformerId: string;
  message: string;
  timestamp: string;
  severity: 'Critical' | 'Warning' | 'Low';
  type: 'HI' | 'RUL' | 'ShortCircuit' | 'Temp';
}

export interface MaintenanceItem {
  id: string;
  transformerId: string;
  recommendation: string;
  priority: 'High' | 'Medium' | 'Low';
  suggestedAction: string;
  status: 'Pending' | 'Completed' | 'In Progress';
  dateAdded: string;
}
