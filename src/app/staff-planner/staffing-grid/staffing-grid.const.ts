export class ShiftData {
  census: number;
  productivityIndex: number;
  shiftName: string;
  staffToPatientList: {
    staffType: string;
    staffNo: number;
  }[];
  total: number;
  stp: string;
}
