export class OffGridActivities {
     planId = '';
     code = '';
     name = '';
     shiftHours = 0;
     typeKey: number;
     variableDepartmentList: VariableDepartmet[] = [];
     totalHours: number;
     key: number;
}
export class VariableDepartmet {
    key: number;
    categoryAbbreviation: string;
    categoryDescription: string;
    staffCount = 0;
}
export class Activity {
    name = '';
    code = '';
    typeKey: number;
    key: number;
    totalHours: number;
}
export enum ogaTypeKey {
    InHouse= 1,
    Certification= 2,
    Orientation= 3,
    Other= 4
}
export class OGAsummary {
    variable_department_position_name = '';
    variable_department_position_key: number;
    variable_department_abrv = '';
    variablePositionDescription = '';
    InHouseEduHrs = 0;
    EduAndCertHrs = 0;
    OrientationHrs = 0;
    OtherHrs = 0;
    TotalnHrs = 0;
}
