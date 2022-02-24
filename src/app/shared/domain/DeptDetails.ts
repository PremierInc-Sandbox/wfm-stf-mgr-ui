import {PlanDetails} from './plan-details';
import {CorpDetails} from './CorpDetails';

export class DeptDetails {
  public key: string;
  public code: string;
  public name: string;
  public active_plan: PlanDetails;
  public facilityId:string;
  public permissions: number[];
}
export enum Permissions {
  STAFFPLANNER= 8,
  STAFFMANAGER= 9,
  SMUSERAUTHENTICATION = 'SM_USER_AUTHENTICATION'}
