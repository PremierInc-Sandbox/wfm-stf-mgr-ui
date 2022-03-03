export interface User {
  userKey?: string;
  activeFlag?: boolean;
  ldapUsername?: string;
  userName?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  formattedName?: string;
  title?: string;
  role?: string;
  privileges?: Privilege[];
}
export interface Privilege {
  code: string;
  description: string;
  privilegeKey: number;
  parentPrivilege: ParentPrivilege;

}
export interface ParentPrivilege {
  code: string;
  description: string;
  privilegeKey: number;
  parentPrivilege: string;

}
