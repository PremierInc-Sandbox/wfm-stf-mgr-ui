export function nonVariablePositionData() {
  return [{
    weekDays: [{day: 'Monday', selected: false},
      {day: 'Tuesday', selected: false},
      {day: 'Wednesday', selected: false},
      {day: 'Thursday', selected: false},
      {day: 'Friday', selected: false},
      {day: 'Saturday', selected: false},
      {day: 'Sunday', selected: false}
    ],
    shiftHours: 0,
    title: 'title',
    allDaySelected: false,
  },
    {
      weekDays: [{day: 'Monday', selected: true},
        {day: 'Tuesday', selected: true},
        {day: 'Wednesday', selected: true},
        {day: 'Thursday', selected: true},
        {day: 'Friday', selected: true},
        {day: 'Saturday', selected: true},
        {day: 'Sunday', selected: true}
      ],
      shiftHours: 0,
      title: 'title',
      allDaySelected: true,
    }];
}
