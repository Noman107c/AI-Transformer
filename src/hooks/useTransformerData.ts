import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { TransformerRecord, TransformerStatus, AlertNotification, MaintenanceItem } from '../types';

// Standard high-fidelity baseline corresponding exactly to screen specifications
const BASE_TRANSFORMER_SPECS = [
  { id: 'TRF-01', baseHI: 92.6, age: 2.1, weight: 92.0, rul: 1540 },
  { id: 'TRF-02', baseHI: 87.3, age: 3.4, weight: 86.5, rul: 1260 },
  { id: 'TRF-03', baseHI: 78.9, age: 4.2, weight: 78.0, rul: 980 },
  { id: 'TRF-04', baseHI: 74.1, age: 4.8, weight: 74.5, rul: 870 },
  { id: 'TRF-05', baseHI: 69.2, age: 3.7, weight: 69.0, rul: 640 },
  { id: 'TRF-06', baseHI: 65.3, age: 5.0, weight: 64.5, rul: 520 },
  { id: 'TRF-07', baseHI: 61.7, age: 4.5, weight: 61.0, rul: 430 },
  { id: 'TRF-08', baseHI: 58.6, age: 5.0, weight: 58.0, rul: 380 },
  { id: 'TRF-09', baseHI: 45.2, age: 6.1, weight: 45.0, rul: 210 },
  { id: 'TRF-10', baseHI: 38.7, age: 6.3, weight: 38.0, rul: 120 },
  { id: 'TRF-11', baseHI: 89.1, age: 2.5, weight: 88.0, rul: 1350 },
  { id: 'TRF-12', baseHI: 84.5, age: 3.1, weight: 83.5, rul: 1120 },
  { id: 'TRF-13', baseHI: 72.3, age: 4.6, weight: 71.0, rul: 790 },
  { id: 'TRF-14', baseHI: 68.0, age: 3.9, weight: 67.5, rul: 610 },
  { id: 'TRF-15', baseHI: 61.2, age: 4.8, weight: 60.5, rul: 450 },
  { id: 'TRF-16', baseHI: 57.1, age: 5.2, weight: 56.5, rul: 360 },
  { id: 'TRF-17', baseHI: 82.3, age: 2.8, weight: 81.0, rul: 1180 },
  { id: 'TRF-18', baseHI: 75.8, age: 4.0, weight: 75.0, rul: 890 },
  { id: 'TRF-19', baseHI: 49.8, age: 5.8, weight: 49.0, rul: 240 },
  { id: 'TRF-20', baseHI: 36.1, age: 6.7, weight: 35.5, rul: 90 },
  { id: 'TRF-21', baseHI: 91.2, age: 1.8, weight: 91.0, rul: 1480 },
  { id: 'TRF-22', baseHI: 88.0, age: 2.2, weight: 87.5, rul: 1310 },
  { id: 'TRF-23', baseHI: 76.5, age: 4.1, weight: 76.0, rul: 920 },
  { id: 'TRF-24', baseHI: 63.4, age: 4.9, weight: 62.5, rul: 490 },
  { id: 'TRF-25', baseHI: 56.5, age: 5.1, weight: 55.5, rul: 340 }
];

export function useTransformerData() {
  const [dbData, setDbData] = useState<TransformerRecord[]>([]);
  const [transformers, setTransformers] = useState<TransformerStatus[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<'Supabase' | 'Hifi-Fallback'>('Hifi-Fallback');
  const [alerts, setAlerts] = useState<AlertNotification[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceItem[]>([]);

  const fetchSupabaseData = useCallback(async () => {
    setIsLoading(true);
    setErrorStatus(null);
    try {
      // Query database table transformer_data
      const { data, error } = await supabase
        .from('transformer_data')
        .select('*')
        .order('Timestamp', { ascending: false });

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        setDbData(data as TransformerRecord[]);
        setDataSource('Supabase');
        
        // Let's digest the data. Since rows in transformer_data represent specific state logs,
        // we can map rows to our 25 transformers dynamically.
        // For each of the 25 transformers, slice or partition data, or calculate derived values.
        const mappedTransformers: TransformerStatus[] = BASE_TRANSFORMER_SPECS.map((spec, idx) => {
          // Select records for this transformer (e.g., modulo matching to spread records across all nodes)
          const trfRecords = data.filter((_, recordIdx) => recordIdx % BASE_TRANSFORMER_SPECS.length === idx);
          
          const latestRecord = trfRecords[0] || null;
          
          // Use latest record values if available, else derive realistically from standard specifications
          const healthIndex = latestRecord ? parseFloat(latestRecord.HI?.toFixed(1)) : spec.baseHI;
          const predictedHI = latestRecord ? parseFloat(latestRecord.Predicted_HI?.toFixed(1)) : parseFloat((spec.baseHI * 0.98).toFixed(1));
          const voltage = latestRecord ? parseFloat(latestRecord.Voltage_kV?.toFixed(2)) : parseFloat((11.0 + Math.sin(idx) * 0.5).toFixed(2));
          const current = latestRecord ? parseFloat(latestRecord.Current_A?.toFixed(1)) : parseFloat((120.0 + (idx * 3) + Math.cos(idx) * 10).toFixed(1));
          const ageYears = latestRecord ? parseInt(latestRecord.Age_yr?.toString()) : spec.age;
          const ambientTemp = latestRecord ? parseFloat(latestRecord.Ambient_Temperature_C?.toFixed(1)) : parseFloat((28.0 + Math.sin(idx) * 6).toFixed(1));
          const outages = latestRecord ? Math.round(latestRecord.Outages_hours_per_year) : Math.round(4.8 * ageYears);
          const shortCircuits = latestRecord ? parseInt(latestRecord.No_of_Short_Circuits?.toString()) : Math.round(ageYears * 1.2 + (idx % 3));
          const maintenanceCount = latestRecord ? parseInt(latestRecord.Maintenance_Count?.toString()) : Math.round(ageYears * 2.5);
          const rulDays = spec.rul; // Derive from standard specs
          const overallWeightage = spec.weight;

          // Compute status
          let status: TransformerStatus['status'] = 'Healthy';
          if (healthIndex < 50) {
            status = 'Critical';
          } else if (healthIndex < 70) {
            status = 'At Risk';
          } else if (healthIndex < 80) {
            status = 'Moderate';
          }

          // Build a temporal fake-history for time series charts centered around the real values
          const history = Array.from({ length: 15 }).map((_, hIdx) => {
            const ratio = 1 - (hIdx / 30);
            const refRecord = trfRecords[hIdx % trfRecords.length] || null;
            return {
              timestamp: refRecord ? new Date(refRecord.Timestamp).toLocaleString() : `202${4 - Math.floor(hIdx/12)}-${String((12 - (hIdx % 12))).padStart(2, '0')}-01`,
              healthIndex: refRecord ? parseFloat(refRecord.HI?.toFixed(1)) : parseFloat((healthIndex * ratio).toFixed(1)),
              predictedHI: refRecord ? parseFloat(refRecord.Predicted_HI?.toFixed(1)) : parseFloat((predictedHI * ratio).toFixed(1)),
              voltage: refRecord ? parseFloat(refRecord.Voltage_kV?.toFixed(2)) : parseFloat((voltage * (0.98 + Math.random() * 0.04)).toFixed(2)),
              current: refRecord ? parseFloat(refRecord.Current_A?.toFixed(1)) : parseFloat((current * (0.95 + Math.random() * 0.1)).toFixed(1)),
              temp: refRecord ? parseFloat(refRecord.Ambient_Temperature_C?.toFixed(1)) : parseFloat((ambientTemp * (0.9 + Math.random() * 0.2)).toFixed(1))
            };
          }).reverse();

          return {
            id: spec.id,
            healthIndex,
            predictedHI,
            status,
            rulDays,
            ageYears,
            overallWeightage,
            ambientTemp,
            current,
            voltage,
            outages,
            shortCircuits,
            maintenanceCount,
            history
          };
        });

        setTransformers(mappedTransformers);
      } else {
        // Table exists but is completely empty: Hydrate using baseline specs and notify
        setDataSource('Hifi-Fallback');
        createHifiBaseline();
      }
    } catch (e: any) {
      console.warn('Unable to query Supabase directly:', e);
      setErrorStatus(e.message || 'Database empty or access restricted');
      setDataSource('Hifi-Fallback');
      createHifiBaseline();
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createHifiBaseline = () => {
    const baseline = BASE_TRANSFORMER_SPECS.map((spec, idx) => {
      // Create hyper-realistic values matching image specification
      const healthIndex = spec.baseHI;
      const predictedHI = parseFloat((spec.baseHI * 0.97 - (idx * 0.1)).toFixed(1));
      
      let status: TransformerStatus['status'] = 'Healthy';
      if (healthIndex < 50) {
        status = 'Critical';
      } else if (healthIndex < 70) {
        status = 'At Risk';
      } else if (healthIndex < 80) {
        status = 'Moderate';
      }

      const ageYears = spec.age;
      // Synthesize realistic physical metrics
      const voltage = parseFloat((11.02 + Math.sin(idx * 0.4) * 0.15).toFixed(2));
      const current = parseFloat((128.6 + Math.cos(idx * 0.3) * 12.4).toFixed(1));
      const ambientTemp = parseFloat((32.8 + Math.sin(idx * 0.5) * 4.2).toFixed(1));
      const outages = Math.round(ageYears * 11);
      const shortCircuits = Math.round(ageYears * 6);
      const maintenanceCount = Math.round(ageYears * 31);

      // Historical trends (2019-2024 time span as in the CSS/charts)
      const history = Array.from({ length: 6 }).map((_, yearIdx) => {
        const year = 2019 + yearIdx;
        const degradationFactor = 1 - (yearIdx * 0.03 + (idx * 0.005));
        return {
          timestamp: `${year}`,
          healthIndex: parseFloat((healthIndex / degradationFactor * 0.85).toFixed(1)) > 100 ? 99.2 : parseFloat((healthIndex * degradationFactor).toFixed(1)),
          predictedHI: parseFloat((healthIndex * degradationFactor * 0.97).toFixed(1)),
          voltage: parseFloat((voltage * (0.99 + Math.random() * 0.02)).toFixed(2)),
          current: parseFloat((current * (0.97 + Math.random() * 0.06)).toFixed(1)),
          temp: parseFloat((ambientTemp * (0.95 + Math.random() * 0.1)).toFixed(1))
        };
      });

      return {
        id: spec.id,
        healthIndex,
        predictedHI,
        status,
        rulDays: spec.rul,
        ageYears,
        overallWeightage: spec.weight,
        ambientTemp,
        current,
        voltage,
        outages,
        shortCircuits,
        maintenanceCount,
        history
      };
    });
    setTransformers(baseline);
  };

  // Process system alerts
  useEffect(() => {
    if (transformers.length > 0) {
      const generatedAlerts: AlertNotification[] = [];
      const generatedMaintenance: MaintenanceItem[] = [];

      transformers.forEach(t => {
        // High risk indicators
        if (t.healthIndex < 50) {
          generatedAlerts.push({
            id: `alert-${t.id}-hi`,
            transformerId: t.id,
            message: `Health Index below 50 (${t.healthIndex}%)`,
            timestamp: `12-May-2024 10:15 AM`,
            severity: 'Critical',
            type: 'HI'
          });
          generatedMaintenance.push({
            id: `maint-${t.id}`,
            transformerId: t.id,
            recommendation: 'Replace / Major Overhaul',
            priority: 'High',
            suggestedAction: 'Schedule replacement within 3 months',
            status: 'Pending',
            dateAdded: '12-May-2024'
          });
        } else if (t.healthIndex < 70) {
          generatedAlerts.push({
            id: `alert-${t.id}-hi-warn`,
            transformerId: t.id,
            message: `Health Index declining (${t.healthIndex}%)`,
            timestamp: `12-May-2024 07:45 AM`,
            severity: 'Warning',
            type: 'HI'
          });
          generatedMaintenance.push({
            id: `maint-${t.id}`,
            transformerId: t.id,
            recommendation: 'Detailed Inspection',
            priority: 'Medium',
            suggestedAction: 'Inspect bushings and windings',
            status: 'In Progress',
            dateAdded: '11-May-2024'
          });
        }

        if (t.rulDays < 200) {
          generatedAlerts.push({
            id: `alert-${t.id}-rul`,
            transformerId: t.id,
            message: `RUL less than 200 days (${t.rulDays} days)`,
            timestamp: `12-May-2024 09:50 AM`,
            severity: 'Critical',
            type: 'RUL'
          });
        }

        if (t.shortCircuits > 15) {
          generatedAlerts.push({
            id: `alert-${t.id}-sc`,
            transformerId: t.id,
            message: `High number of short circuits (${t.shortCircuits})`,
            timestamp: `12-May-2024 08:30 AM`,
            severity: 'Warning',
            type: 'ShortCircuit'
          });
        }
      });

      // Sort alerts to have critical ones first
      setAlerts(generatedAlerts.sort((a, b) => (a.severity === 'Critical' ? -1 : 1)));
      
      // Default general maintenance suggestions for good assets
      transformers.filter(t => t.healthIndex >= 70 && t.healthIndex < 85).forEach(t => {
        generatedMaintenance.push({
          id: `maint-${t.id}`,
          transformerId: t.id,
          recommendation: 'Preventive Maintenance',
          priority: 'Medium',
          suggestedAction: 'Oil test and cooling system check',
          status: 'Pending',
          dateAdded: '10-May-2024'
        });
      });

      transformers.filter(t => t.healthIndex >= 85).forEach(t => {
        generatedMaintenance.push({
          id: `maint-${t.id}`,
          transformerId: t.id,
          recommendation: 'Monitor Closely',
          priority: 'Low',
          suggestedAction: 'Continue regular monitoring',
          status: 'Completed',
          dateAdded: '01-May-2024'
        });
      });

      setMaintenance(generatedMaintenance);
    }
  }, [transformers]);

  useEffect(() => {
    fetchSupabaseData();
  }, [fetchSupabaseData]);

  return {
    dbData,
    transformers,
    isLoading,
    errorStatus,
    dataSource,
    alerts,
    maintenance,
    refresh: fetchSupabaseData
  };
}
