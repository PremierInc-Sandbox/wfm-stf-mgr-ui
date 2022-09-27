export class Util {
  static isNullOrUndefined(value: any) {
    return value === null || value === undefined;
  }
  static isEmpty(value: any){
    return value.trim() === "";
  }
}
