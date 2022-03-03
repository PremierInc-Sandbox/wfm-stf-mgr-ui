export function shiftData() {
  return ([{
    key: '',
    name: '',
    hours: 0,
    timeFormatFlag: true,
    startTime: '12:00',
    staffToPatientList: null,
    staffGridCensuses: [{
      key: 'key',
      shiftKey: 'shiftKey',
      censusIndex: 0,
      censusValue: 0,
      productivityIndex: 0,
      totalPlanWHpU: 0,
      staffToPatientList: null,
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
    errormsg: ['error'],
    activeFlag: false
  },
    {
      key: 'shiftKey',
      name: 'shiftName',
      hours: 1,
      timeFormatFlag: true,
      startTime: '12:00',
      staffToPatientList: null,
      staffGridCensuses: null,
      staffGrid: null,
      last: false,
      shiftStartTime: '',
      HasError: false,
      activeFlag: false,
      errormsg: ['Shift time cannot overlap.'],
    }]);
}
