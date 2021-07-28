import React, { Component } from "react";
import {
  taxYear_19to20 as _19to20,
  taxYear_20to21 as _20to21,
} from "../reusableTaxCalculator";

class TaxTable extends Component {
  render() {
    const { toCalculate, query } = this.props;
    const salary_19to20 =
      toCalculate === "takeHome" ? query : _19to20.salaryFromTakeHome(query);
    const nI_19to20 = _19to20.nationalInsurance(salary_19to20);
    const incomeTax_19to20 = _19to20.incomeTax(salary_19to20);
    const takeHome_19to20 =
      toCalculate === "takeHome" ? _19to20.takeHomePay(query) : query;

    const salary_20to21 =
      toCalculate === "takeHome" ? query : _20to21.salaryFromTakeHome(query);
    const nI_20to21 = _20to21.nationalInsurance(salary_20to21);
    const incomeTax_20to21 = _20to21.incomeTax(salary_20to21);
    const takeHome_20to21 =
      toCalculate === "takeHome" ? _20to21.takeHomePay(query) : query;

    return (
      <table>
        <thead>
          <tr>
            <th></th>
            <th>2019/20</th>
            <th>2020/21</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>Salary</th>
            <td>{salary_19to20}</td>
            <td>{salary_20to21}</td>
          </tr>
          <tr>
            <th>NI</th>
            <td>{nI_19to20}</td>
            <td>{nI_20to21}</td>
          </tr>
          <tr>
            <th>Income Tax</th>
            <td>{incomeTax_19to20}</td>
            <td>{incomeTax_20to21}</td>
          </tr>
          <tr>
            <th>Take Home pay</th>
            <td>{takeHome_19to20}</td>
            <td>{takeHome_20to21}</td>
          </tr>
        </tbody>
      </table>
    );
  }
}

export default TaxTable;
