const _ = require("lodash");

export function calculateIncomeTax(salary) {
  let incomeTax;
  // Income within personal allowance
  if (salary <= 12500) incomeTax = 0;
  // Income in basic rate range
  else if (salary <= 50000) incomeTax = (salary - 12500) * 0.2;
  // Income in higher rate range, but before personal allowance starts reducing
  else if (salary <= 100000) incomeTax = 37500 * 0.2 + (salary - 50000) * 0.4;
  // Income in higher rate range, covers personal allowance reducing to zero
  else if (salary <= 125000) {
    reduction = Math.floor((salary - 100000) / 2);
    incomeTax = (37500 + reduction) * 0.2 + (salary - 50000) * 0.4;
  }
  // Higher rate range, personal allowance is zero
  else if (salary <= 150000) incomeTax = 50000 * 0.2 + (salary - 50000) * 0.4;
  // Additional rate
  else incomeTax = 50000 * 0.2 + 100000 * 0.4 + (salary - 150000) * 0.45;

  incomeTax = _.round(incomeTax, 2);
  return incomeTax;
}

export function calculateNI(salary, year) {
  let lowerLimit;
  const upperLimit = 50004;
  const lowerRate = 0.12;
  const upperRate = 0.02;
  let nI;

  if (year === 2019) lowerLimit = 8628;
  if (year === 2020) lowerLimit = 9504;

  if (salary <= lowerLimit) {
    nI = 0;
  } else if (salary <= upperLimit) {
    nI = (salary - lowerLimit) * lowerRate;
  } else {
    nI =
      (salary - upperLimit) * upperRate + (upperLimit - lowerLimit) * lowerRate;
  }

  nI = _.round(nI, 2);
  return nI;
}

// To calculate the gross salary from take home pay, I worked out what the take home pay would be at
// each of the boundaries where the NI and income tax calculations
// I took the specific formula for NI and income between each of these boundaries and used
// An algebra calculator to reverse engineer the formula: income = salary - NI - incomeTax
// Which gave the salary
export function calculateGrossFromTakeHome(income, year) {
  let salary;

  let lowerLimit;
  if (year === 2019) lowerLimit = 8628;
  if (year === 2020) lowerLimit = 9504;

  // Income less than NI lower limit (LL)
  if (income <= lowerLimit) {
    salary = income;
  }
  // Income in NI LL, still in personal allowance
  else if (income <= calculateTakeHome(12500)) {
    salary = (25 * income - 3 * lowerLimit) / 22;
  }
  // Income in NI LL, within income basic range
  else if (income <= calculateTakeHome(50000)) {
    salary = (25 * income - 3 * lowerLimit - 62500) / 17;
  }
  // Income in NI LL, within income higher rate
  else if (income <= calculateTakeHome(50004)) {
    salary = (income - 0.12 * lowerLimit - 12500) / 0.48;
  }

  // Income in NI UEL
  // Higher income rate
  else if (income <= calculateTakeHome(100000)) {
    salary = (income - 0.12 * lowerLimit - 7499.6) / 0.58;
  }
  // Personal allowance reducing
  // Unfortunatley could not incorporate floor into formula, so answers will be slightly out in this range
  else if (income <= calculateTakeHome(125000)) {
    salary = (income - 0.12 * lowerLimit - 17499.6) / 0.48;
  }

  //Personal allowance is zero
  else if (income <= calculateTakeHome(150000)) {
    salary = (income - 0.12 * lowerLimit - 4999.6) / 0.58;
  }
  // Highest rate
  else {
    salary = (income - 0.12 * lowerLimit - 12499.6) / 0.53;
  }

  return _.round(salary, 2);
}

export function calculateTakeHome(income, year) {
  return income - calculateIncomeTax(income) - calculateNI(income, year);
}
