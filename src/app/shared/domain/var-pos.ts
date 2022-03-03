export class VariableDepartmentPosition {
  public key: number;
  public categoryKey: number;
  public categoryAbbreviation: string;
  public categoryDescription: string;
  public includedInNursingHoursFlag: boolean;
}

export class CustomError {
  isError = false;
  errorMessage: string;
  constructor() {

  }
}
