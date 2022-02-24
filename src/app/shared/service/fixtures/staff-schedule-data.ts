import {ScheudleErrors} from '../../domain/staff-schedule';

const objScheduleErrors = new ScheudleErrors();

export function staffScheduleData() {
  return [{
    key: '1',
    name: 'testScheduleName1',
    scheduleDays: [true],
    planShiftList: [{
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
      key: '',
      name: 'shiftName',
      hours: 1,
      timeFormatFlag: true,
      startTime: '12:00',
      staffToPatientList: [
        { variablePositionKey: 1,
          variablePositionCategoryAbbreviation: 'varposabrv',
          variablePositionCategoryDescription: 'categoryDesc',
          staffCount: 2,
          activeFlag: false
        }],
      staffGridCensuses: [{
        key: '',
        shiftKey: '',
        censusIndex: 1,
        censusValue: 1,
        productivityIndex: 0,
        totalPlanWHpU: 0,
        staffToPatientList: [{
          variablePositionKey: 1,
          variablePositionCategoryAbbreviation: '',
          variablePositionCategoryDescription: 'varpos Description',
          staffCount: 0,
          activeFlag: false
        }],
      },
        {

          key: '',
          shiftKey: '',
          censusIndex: 2,
          censusValue: 1,
          productivityIndex: 0,
          totalPlanWHpU: 0,
          staffToPatientList: [{
            variablePositionKey: 1,
            variablePositionCategoryAbbreviation: '',
            variablePositionCategoryDescription: 'varpos Description',
            staffCount: 0,
            activeFlag: false
          }],
        },
 ],
      last: false,
      HasError: false,
      errormsg: [
        objScheduleErrors.errmsg_exceeds_shiftcount,
        objScheduleErrors.errmsg_exceeds_shifthour,
      ],
      activeFlag: false
    }],
    IsMaximized: true,
    HasError: false,
    errormsg: ['testError'],
    planKey: 1,
  },
    {
      key: '2',
      name: 'testScheduleName2',
      scheduleDays: [false, false, false, false, false, false, false],
      planShiftList: [{
        key: '',
        name: 'shiftName',
        hours: 1,
        timeFormatFlag: true,
        startTime: '12:00',
        staffToPatientList: [{
          variablePositionKey: 1,
          variablePositionCategoryAbbreviation: 'varposabrv',
          variablePositionCategoryDescription: 'categoryDesc',
          staffCount: 2,
          activeFlag: false
        }],
        staffGridCensuses: [],
        staffGrid: [],
        shiftStartTime: '',
        last: false,
        HasError: false,
        errormsg: null,
        activeFlag: false
      }],
      IsMaximized: true,
      HasError: false,
      errormsg: null,
      planKey: 2,
    },
    {
      key: '3',
      name: 'testScheduleName',
      scheduleDays: [true, true, true],
      planShiftList: [{
        key: '',
        name: '',
        hours: 1,
        timeFormatFlag: true,
        startTime: '12:00',
        staffToPatientList: [{
          variablePositionKey: 1,
          variablePositionCategoryAbbreviation: 'varposabrv',
          variablePositionCategoryDescription: 'categoryDesc',
          staffCount: 2,
          activeFlag: false
        }],
        staffGridCensuses: [],
        staffGrid: [],
        shiftStartTime: '',
        last: false,
        HasError: false,
        errormsg: null,
        activeFlag: false
      }],
      IsMaximized: true,
      HasError: false,
      errormsg: ['error'],
      planKey: 3,
    },
    {
      key: '2',
      name: 'testScheduleName2',
      scheduleDays: [true],
      planShiftList: [{
        staffGrid: [
          {
            key: 0,
            staffCount: 0,
            variablePositionKey: 6,
            variablePositionCategoryDescription: 'varpos Description 234',
            censusLookupKey: 5,
            shiftLookupKey: 3
          }
        ],
        shiftStartTime: '',
        key: '',
        name: 'shiftName1',
        hours: 2,
        timeFormatFlag: true,
        startTime: '12:00',
        staffToPatientList: [
          { variablePositionKey: 1,
            variablePositionCategoryAbbreviation: 'varposabrvvtn',
            variablePositionCategoryDescription: 'categoryDescrptn',
            staffCount: 2,
            activeFlag: false
          }],
        staffGridCensuses: [{
          key: '',
          shiftKey: '',
          censusIndex: 1,
          censusValue: 1,
          productivityIndex: 0,
          totalPlanWHpU: 0,
          staffToPatientList: [{
            variablePositionKey: 1,
            variablePositionCategoryAbbreviation: '',
            variablePositionCategoryDescription: 'varpos Description',
            staffCount: 5,
            activeFlag: false
          }],
        },
          {

            key: '',
            shiftKey: '',
            censusIndex: 2,
            censusValue: 1,
            productivityIndex: 5,
            totalPlanWHpU: 0,
            staffToPatientList: [{
              variablePositionKey: 1,
              variablePositionCategoryAbbreviation: '',
              variablePositionCategoryDescription: 'varpos Description',
              staffCount: 0,
              activeFlag: false
            }],
          },
        ],
        last: false,
        HasError: false,
        errormsg: [
          objScheduleErrors.errmsg_empty_shiftname,
        ],
        activeFlag: false
      }],
      IsMaximized: true,
      HasError: false,
      errormsg: ['testError'],
      planKey: 1,
    }
    ,

  ];
}
