import {StaffVarianceDetails, StaffVarianceSummary} from '../../domain/staff-summary';
import {shift} from '../../domain/staff-schedule';

export function staffVarianceData() {
  return [{
    departmentEntryKey: 1,
    departmentKey: 1,
    planKey: 1,
    recordStatusKey: 1,
    actualHours: 0,
    targetHours: 0,
    dailyVarianceHours: 0,
    priorCumulativeHours: 0,
    fullTimeEquivalent: 0,
    createdBy: 'sfarmer',
    createdTime: new Date('12/12/2019'),
    updatedBy: 'sfarmer',
    updatedTime: new Date('12/12/2019'),
    recordDate: new Date('12/12/2019'),
    departmentName: 'first department',
    comments: '',
    commentsUpdatedBy: '',
    shiftComments: ['1', '', '', '', '', '', ''],
    lowerThreshold: 0,
    upperThreshold: 0,
    disableFlag: false,
    staffVarianceSummaries: [{
      predictedCount: 3,
      shiftDetailKey: 1,
      censusValue: 1,
      comments: '',
      commentsUpdatedBy: '',
      additionalStaffHours: 1,
      offGridActivitiesHour: 1,
      defaultShiftKey: 1,
      shiftTime: 3,
      shiftFormat: 'AM',
      shiftTimeRange: '03:00 - 07:00',
      plannedShift: {
        key: '',
        name: '',
        hours: 0,
        timeFormatFlag: true,
        startTime: '05:00',
        staffToPatientList: null,
        staffGridCensuses: [{
          key: 'key',
          shiftKey: 'shiftKey',
          censusIndex: 0,
          censusValue: 0,
          productivityIndex: 0,
          totalPlanWHpU: 0,
          staffToPatientList: [{
            variablePositionKey: 1,
            variablePositionCategoryAbbreviation: 'varposabrv',
            variablePositionCategoryDescription: 'varpos Description',
            staffCount: 0,
            activeFlag: false
          }],
        },
          {
            key: 'key',
            shiftKey: 'shiftKey',
            censusIndex: 2,
            censusValue: 1,
            productivityIndex: 0,
            totalPlanWHpU: 0,
            staffToPatientList: null,
          }],
        staffGrid: [
          {
            key: 0,
            staffCount: 0,
            variablePositionKey: 6,
            variablePositionCategoryDescription: 'varpos Description',
            censusLookupKey: 5,
            shiftLookupKey: 3
          }
        ],
        shiftStartTime: '',
        last: false,
        HasError: false,
        activeFlag: false,
        errormsg: ['error'],
      },
      plannedShifts: [{
        objshift: {
          staffGridCensuses: [{
            key: 'key',
            shiftKey: 'shiftKey',
            censusIndex: 0,
            censusValue: 0,
            productivityIndex: 0,
            totalPlanWHpU: 0,
            staffToPatientList: [{
              variablePositionKey: 1,
              variablePositionCategoryAbbreviation: 'varposabrv2',
              variablePositionCategoryDescription: 'varpos Description',
              staffCount: 0,
              activeFlag: false
            }],
          }],
          shiftStartTime: '',
          HasError: false,
          last: false,
          activeFlag: false,
          errormsg: ['error'],
          key: '',
          name: 'shift1',
          hours: 0,
          timeFormatFlag: true,
          startTime: '06:00',
          staffToPatientList: null,
          staffGrid: [
            {
              key: 0,
              staffCount: 0,
              variablePositionKey: 6,
              variablePositionCategoryDescription: 'varpos Description',
              censusLookupKey: 5,
              shiftLookupKey: 3
            }
          ],
        },
        timestart: false,
        timeEnds: false,

      }],
      isCensusvalid: true,
      staffVarianceDetails: [{
        variableCategoryKey: 1,
        actualCount: 1,
        variableAbbrevation: '',
        scheduleCount: 0,
        plannedCount: 0,
      }],
    }],

    selectedDate: '',
    recordDateForFuture: '',
    planAlreadyInUse: false,
  }];
}
