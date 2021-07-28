import React, { Component } from "react";
import {
  calculateIncomeTax,
  calculateGrossFromTakeHome,
  calculateNI,
  calculateTakeHome,
} from "./taxCalculator";

class TaxTable extends Component {
  render() {
    const { toCalculate, query } = this.props;
    const salary_19to20 =
      toCalculate === "takeHome"
        ? query
        : calculateGrossFromTakeHome(query, 2019);
    const nI_19to20 = calculateNI(salary_19to20, 2019);
    const incomeTax_19to20 = calculateIncomeTax(salary_19to20);
    const takeHome_19to20 =
      toCalculate === "takeHome" ? calculateTakeHome(query, 2019) : query;

    const salary_20to21 =
      toCalculate === "takeHome"
        ? query
        : calculateGrossFromTakeHome(query, 2020);
    const nI_20to21 = calculateNI(salary_19to20, 2020);
    const incomeTax_20to21 = calculateIncomeTax(salary_19to20);
    const takeHome_20to21 =
      toCalculate === "takeHome" ? calculateTakeHome(query, 2020) : query;

    return (
      <table>
        <tr>
          <th></th>
          <th>2019/20</th>
          <th>2020/21</th>
        </tr>
        <tr>
          <td>Salary</td>
          <td>{salary_19to20}</td>
          <td>{salary_20to21}</td>
        </tr>
        <tr>
          <td>NI</td>
          <td>{nI_19to20}</td>
          <td>{nI_20to21}</td>
        </tr>
        <tr>
          <td>Income Tax</td>
          <td>{incomeTax_19to20}</td>
          <td>{incomeTax_20to21}</td>
        </tr>
        <tr>
          <td>Take Home pay</td>
          <td>{takeHome_19to20}</td>
          <td>{takeHome_20to21}</td>
        </tr>
      </table>
    );
  }
}

export default TaxTable;
