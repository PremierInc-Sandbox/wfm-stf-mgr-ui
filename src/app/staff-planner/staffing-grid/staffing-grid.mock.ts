export const staffingMatrixData = {
  userKey: 79,
  planName: '6120-STEPDOWN 2019-01 DRAFT',
  entityName: 'Premier Acute',
  entityKey: null,
  entityCode: 'PR9910',
  departCode: '6120',
  departName: 'STEPDOWN',
  corpId: null,
  planKey: 356,
  planAction: 'Inactive',
  planStatus: 'In Process',
  defaultPlanFlag: false,
  planParameter: {
    deptKey: null,
    entityKey: null,
    effDateStart: null,
    effDateEnd: null,
    planUtilizedAvgVol: 2338,
    targetBudget: 22.8,
    userNotes: null,
    lowerEndTarget: 100,
    upperEndTarget: 120,
    updatedDate: null,
    volume: 1,
    hours: 5,
    fTE: 3,
    educationOrientationTargetPaid: 1,
    primaryWHpU: 1,
    workHoursBalance: 3
  },
  varDeptPostns: null,
  nonVarDeptPostns: null,
  messages: null,
  departmentName: null,
  createdBy: null,
  createdTimestamp: null,
  updatedBy: null,
  updatedTimeStamp: null,
  facilityName: null,
  offGridActivityDetails: null,
  deleteFlag: false,
  effDateStart: null,
  effDateEnd: null,
  planStaffPosition: null,
  displayPlanStatus: 'In Process',
  censusRange: [1, 12],
  staffSchedule: [
    {
      HasError: false,
      IsMaximized: true,
      errormsg: '',
      planShift: [
        {
          HasError: false,
          Isnew: true,
          errormsg: '',
          shiftHours: 8,
          shiftKey: '',
          shiftName: 'DAY SHIFT',
          shiftStartHr: 7,
          shiftStartMins: 0,
          shiftStartPeriod: 'am',
          staffToPatientList: [
            { varposabrv: 'ABR-0', varpostval: 3 },
            { varposabrv: 'ABR-1', varpostval: 1 },
            { varposabrv: 'ABR-2', varpostval: 2 },
            { varposabrv: 'ABR-3', varpostval: 2 },
            { varposabrv: 'ABR-4', varpostval: 1 }
          ],
          timeFormatFlag: ''
        },
        {
          HasError: false,
          Isnew: true,
          errormsg: '',
          shiftHours: 8,
          shiftKey: '',
          shiftName: 'EVENING SHIFT',
          shiftStartHr: 3,
          shiftStartMins: 0,
          shiftStartPeriod: 'pm',
          staffToPatientList: [
            { varposabrv: 'TL-RN', varpostval: 1 },
            { varposabrv: 'RN-1', varpostval: 3 },
            { varposabrv: 'CNA', varpostval: 2 },
          ],
          timeFormatFlag: ''
        },
        {
          HasError: false,
          Isnew: true,
          errormsg: '',
          shiftHours: 8,
          shiftKey: '',
          shiftName: 'NIGHT SHIFT',
          shiftStartHr: 3,
          shiftStartMins: 0,
          shiftStartPeriod: 'pm',
          staffToPatientList: [
            { varposabrv: 'TL-RN', varpostval: 1 },
            { varposabrv: 'RN-1', varpostval: 3 },
            { varposabrv: 'CNA', varpostval: 2 },
          ],
          timeFormatFlag: ''
        }
      ],
      scheduleDays: [
        true,
        true,
        true,
      ],
      scheduleName: 'Weekdays',
      schedulekey: ''
    },
    {
      scheduleName: 'Weekends',
    }
  ]
};

