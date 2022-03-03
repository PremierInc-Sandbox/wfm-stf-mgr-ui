import { CorpDetails } from './CorpDetails';
import { DeptDetails } from './DeptDetails';
import { EntityDetails } from './EntityDetails';

export class UserAccess {
  public role: string;
  public department:DeptDetails[];
  public facility:EntityDetails[];
  public corporation:CorpDetails[];
  public featureToggle: boolean;
}
