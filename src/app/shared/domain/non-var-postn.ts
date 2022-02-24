export class WeekDays {
  day: string;
  selected: boolean;
}
export class NonVariableDepartmentPosition {
  weekDays: WeekDays[] = [{ day: 'Monday', selected: false },
    { day: 'Tuesday', selected: false },
    { day: 'Wednesday', selected: false },
    { day: 'Thursday', selected: false },
    { day: 'Friday', selected: false },
    { day: 'Saturday', selected: false },
    { day: 'Sunday', selected: false }
  ];
  shiftHours = 0;
  title: string;
  allDaySelected: boolean;
}
