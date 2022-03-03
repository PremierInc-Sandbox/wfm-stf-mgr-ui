export function planSetupData() {
  return [{
    planName: 'planName',
    censusRangeMin: 1,
    censusRangeMax: 2,
    planUtilizedAvgVolume: 1,
    targetLowerEnd: 1,
    targetUpperEnd: 2,
    currentAvgVol: 1,
    budgetAvgVol: 1,
    annualizedCurrentAvg: 1,
    annualizedBudgetedAvg: 1,
    effectiveStartDate: 1,
    effectiveEndDate: 2,
    primaryWHpU: null,
    secondaryWHpU: null,
    education: null,
    orientation: null,
    makePlanActive: null,
    selectedCorp: null,
    selectedEntity: null,
    offGridActivities: [{
      planId: '1',
      activityCode: '2',
      activityName: 'activityName',
      shiftHours: 1,
      ogaTypeKey: 1,
      totalHours: 1,
    }]
  }];

}
