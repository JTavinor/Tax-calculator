const _ = require("lodash");

const taxYearInfo = {
  _2019to2020: {
    pA: 12500,
    higherRateStart: 50000,
    pAReductionStart: 100000,
    additionalRateStart: 150000,
    pAReductionRate: 0.5,
    basicRate: 0.2,
    higherRate: 0.4,
    additionalRate: 0.45,
    nILowerLimit: 719,
    nIUpperLimit: 4167,
    nILowerRate: 0.12,
    nIUpperRate: 0.02,
  },

  _2020to2021: {
    pA: 12500,
    higherRateStart: 50000,
    pAReductionStart: 100000,
    additionalRateStart: 150000,
    pAReductionRate: 0.5,
    basicRate: 0.2,
    higherRate: 0.4,
    additionalRate: 0.45,
    nILowerLimit: 792,
    nIUpperLimit: 4167,
    nILowerRate: 0.12,
    nIUpperRate: 0.02,
  },
};

// A reusable tax calculator.
// Simply create a new class passing in a specific years tax info to the constuctor
// Will only work if tax brackets are in the same 'format' as the years provided
class Calculator {
  constructor(taxYearInfo) {
    this.pA = taxYearInfo.pA;
    this.higherRateStart = taxYearInfo.higherRateStart;
    this.pAReductionStart = taxYearInfo.pAReductionStart;
    this.additionalRateStart = taxYearInfo.additionalRateStart;
    this.pAReductionRate = taxYearInfo.pAReductionRate;
    this.basicRate = taxYearInfo.basicRate;
    this.higherRate = taxYearInfo.higherRate;
    this.additionalRate = taxYearInfo.additionalRate;
    this.nILowerLimit = taxYearInfo.nILowerLimit;
    this.nIUpperLimit = taxYearInfo.nIUpperLimit;
    this.nILowerRate = taxYearInfo.nILowerRate;
    this.nIUpperRate = taxYearInfo.nIUpperRate;
  }

  salaryAtBasicRate(salary) {
    let salaryAtBasicRate;
    // Salary within personal allowance
    if (salary <= this.pA) salaryAtBasicRate = 0;
    // Salary within basic rate range
    else if (salary <= this.higherRateStart)
      salaryAtBasicRate = salary - this.pA;
    // Salary at basic rate stops increasing once we go into the higher rate range
    else if (salary <= this.pAReductionStart)
      salaryAtBasicRate = this.higherRateStart - this.pA;
    // Personal allowance starts reducing, the reduction gets added onto the basic rate salary
    else if (salary <= this.pAReductionStart + this.pA / this.pAReductionRate) {
      const pA_reduction = Math.floor(
        (salary - this.pAReductionStart) * this.pAReductionRate
      );
      salaryAtBasicRate = this.higherRateStart - this.pA + pA_reduction;
      // Personal allowance is zero, basic rate salary stops increasing
    } else salaryAtBasicRate = this.higherRateStart;

    return salaryAtBasicRate;
  }

  salaryAtHigherRate(salary) {
    let salaryAtHigherRate;
    if (salary <= this.higherRateStart) salaryAtHigherRate = 0;
    else if (salary <= this.additionalRateStart)
      salaryAtHigherRate = salary - this.higherRateStart;
    else salaryAtHigherRate = this.additionalRateStart - this.higherRateStart;

    return salaryAtHigherRate;
  }

  salaryAtAdditionalRate(salary) {
    let salaryAtAdditionalRate;
    if (salary <= this.additionalRateStart) salaryAtAdditionalRate = 0;
    else salaryAtAdditionalRate = salary - this.additionalRateStart;

    return salaryAtAdditionalRate;
  }

  incomeTax(salary) {
    let incomeTax =
      this.salaryAtBasicRate(salary) * this.basicRate +
      this.salaryAtHigherRate(salary) * this.higherRate +
      this.salaryAtAdditionalRate(salary) * this.additionalRate;

    incomeTax = _.round(incomeTax);
    return incomeTax;
  }

  nationalInsurance(salary) {
    const lowerLimit = this.nILowerLimit * 12;
    const upperLimit = this.nIUpperLimit * 12;
    const lowerRate = this.nILowerRate;
    const upperRate = this.nIUpperRate;
    let nI;

    if (salary <= lowerLimit) {
      nI = 0;
    } else if (salary <= upperLimit) {
      nI = (salary - lowerLimit) * lowerRate;
    } else {
      nI =
        (salary - upperLimit) * upperRate +
        (upperLimit - lowerLimit) * lowerRate;
    }

    nI = _.round(nI);
    return nI;
  }

  takeHomePay(salary) {
    return _.round(
      salary - this.incomeTax(salary) - this.nationalInsurance(salary),
      2
    );
  }

  // To calculate the gross salary from take home pay, I worked out what the take home pay would be at
  // each of the boundaries where the NI and income tax calculations change
  // I took the specific formula for NI and income between each of these boundaries and used
  // An algebra calculator to reverse engineer the formula: income = salary - NI - incomeTax
  // Which gave the salary

  // Note: If 12 * the NI UEL becomes less than the start of the basic rate range 2b/2c will need recalibrating
  salaryFromTakeHome(income) {
    let salary;

    const nILowerLimit = this.nILowerLimit * 12;
    const nIUpperLimit = this.nIUpperLimit * 12;

    // 1) Income less than NI lower limit
    if (income <= nILowerLimit) {
      salary = income;
    }

    // 2) Income within NI Lower limit
    // 2a) Income still in personal allowance
    else if (income <= this.takeHomePay(this.pA)) {
      salary =
        (income - this.nILowerRate * nILowerLimit) / (1 - this.nILowerRate);
    }
    // 2b) Income within basic range
    else if (income <= this.takeHomePay(this.higherRateStart)) {
      salary =
        (income - this.nILowerRate * nILowerLimit - this.basicRate * this.pA) /
        (1 - this.nILowerRate - this.basicRate);
    }
    // 2c) Income within higher rate
    else if (income <= this.takeHomePay(nIUpperLimit)) {
      salary =
        (income -
          this.nILowerRate * nILowerLimit +
          this.basicRate * this.higherRateStart -
          this.basicRate * this.pA -
          this.higherRate * this.higherRateStart) /
        (1 - this.nILowerRate - this.higherRate);
    }

    // 3) Income above NI UEL
    // 3a) Higher income rate
    else if (income <= this.takeHomePay(this.pAReductionStart)) {
      salary =
        (income +
          this.nILowerRate * (nIUpperLimit - nILowerLimit) +
          this.basicRate * this.higherRateStart -
          this.basicRate * this.pA -
          this.nIUpperRate * this.nIUpperLimit * 12 -
          this.higherRate * this.higherRateStart) /
        (1 - this.nIUpperRate - this.higherRate);
    }

    // 3b) Personal allowance reducing
    else if (
      income <=
      this.takeHomePay(this.pAReductionStart + this.pA / this.pAReductionRate)
    ) {
      salary =
        (-(1 / this.pAReductionRate) *
          (income +
            this.nILowerRate * (nIUpperLimit - nILowerLimit) -
            this.nIUpperRate * nIUpperLimit +
            this.basicRate * (this.higherRateStart - this.pA) -
            this.higherRateStart * this.higherRate -
            (this.basicRate * this.pAReductionStart) /
              (1 / this.pAReductionRate))) /
        (-(1 / this.pAReductionRate) +
          this.basicRate +
          (1 / this.pAReductionRate) * (this.nIUpperRate + this.higherRate));
    }

    // 3c) Personal allowance is zero
    else if (income <= this.takeHomePay(this.additionalRateStart)) {
      salary =
        (income +
          this.nILowerRate * (nIUpperLimit - nILowerLimit) +
          this.basicRate * this.higherRateStart -
          this.nIUpperRate * nIUpperLimit -
          this.higherRateStart * this.higherRate) /
        (1 - this.nIUpperRate - this.higherRate);
    }

    // 3d) Highest rate
    else {
      salary =
        (income +
          this.nILowerRate * (nIUpperLimit - nILowerLimit) +
          this.basicRate * this.higherRateStart +
          (this.additionalRateStart - this.higherRateStart) * this.higherRate -
          this.nIUpperRate * nIUpperLimit -
          this.additionalRateStart * this.additionalRate) /
        (1 - this.nIUpperRate - this.additionalRate);
    }

    return _.round(salary);
  }
}

export const taxYear_19to20 = new Calculator(taxYearInfo._2019to2020);
export const taxYear_20to21 = new Calculator(taxYearInfo._2020to2021);

// Original salaryFromTakeHome() method. Ungeneralised - specific to question.

// 1) Income less than NI lower limit
// if (income <= nILowerLimit) {
//   salary = income;
// }

// 2) Income within NI Lower limit
// 2a) Income still in personal allowance
// else if (income <= this.takeHomePay(12500)) {
//   salary = (25 * income - 3 * nILowerLimit) / 22;
// }

// 2b) Income within basic range
// else if (income <= this.takeHomePay(50000)) {
//   salary = (25 * income - 3 * nILowerLimit - 62500) / 17;
// }

// 2c) Income within higher rate
// else if (income <= this.takeHomePay(50004)) {
//   salary = (income - 0.12 * nILowerLimit - 12500) / 0.48;
// }

// 3) Income above NI UEL
// 3a) Higher income rate
// else if (income <= this.takeHomePay(100000)) {
//   salary = (income - 0.12 * nILowerLimit - 7499.6) / 0.58;
// }

// 3b) Personal allowance reducing
// else if (income <= this.takeHomePay(125000)) {
//   salary = (income - 0.12 * nILowerLimit - 17499.6) / 0.48;
// }

// 3c) Personal allowance is zero
// else if (income <= this.takeHomePay(150000)) {
//   salary = (income - 0.12 * nILowerLimit - 4999.6) / 0.58;
// }

// 3d) Highest rate
// else {
//   salary = (income - 0.12 * nILowerLimit - 12499.6) / 0.53;
// }
