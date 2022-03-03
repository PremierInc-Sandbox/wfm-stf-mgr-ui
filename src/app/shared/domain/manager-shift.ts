export class Shift {
  public key: number;
  public departmentEntryKey: number;
  public census: number;
  public shiftTime: number;
  public shiftFormat: string;
  public ogaHours: number;
  public comments: string;
  public additionalStaffHours: number;
  public plannedValue: number;
  public roles: VariablePositions[] = [];

}
export class VariablePositions {
  public key: number;
  public shiftKey: number;
  public varposKey: number;
  public actualVarposValue: number;
}
