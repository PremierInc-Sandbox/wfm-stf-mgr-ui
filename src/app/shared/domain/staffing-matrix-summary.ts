export class StaffingMatrixSummaryData {
  census: number;
  occ: number;
  productivity: number;
  varWHPU: number;
  nonVarWHPU: number;
  ogaWHPU: number;
  totalPlanWhpu: number;
  totalPlanDailyhrs: number;
  dailyHrsVarToTarget: number;
  totalPlanAnnualHrs: number;
  annualHrsVarToTarget: number;
}

export class ColumnDefenition {
  id: string;
  value: string;
  type: string;
}
