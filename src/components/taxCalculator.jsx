import React, { Component } from "react";
import logo from "../untied_logo.png";

import TaxTable from "./taxTable";

class TaxCalculator extends Component {
  state = { toCalculate: "takeHome", query: 0 };

  renderInputLabel() {
    if (this.state.toCalculate === "salary")
      return "What is your desired take-home pay?";
    return "What is your current salary?";
  }

  handleSearchQuery(e) {
    const query = Math.abs(parseInt(e.currentTarget.value));
    if (isNaN(query)) this.setState({ query: 0 });
    else
      this.setState({
        query,
      });
  }

  render() {
    const { query, toCalculate } = this.state;
    return (
      <React.Fragment>
        <div className="logoDiv">
          <img src={logo} alt="untied logo" className="logo" />
        </div>
        <div className="mainDiv">
          <h1>Welcome to the Untied tax calculator</h1>
          <hr />
          <h2>With this calculator you can:</h2>
          <ul>
            <li>- Calculate your take-home pay from a salary</li>
            <li>
              - See what salary you should demand in order to acheive a certain
              take-home pay
            </li>
          </ul>
          <hr />
          <h3>Select what you would like to calculate:</h3>
          <div className="calculationSelect">
            <span
              className="leftCalculationButton"
              onChange={() => this.setState({ toCalculate: "takeHome" })}
            >
              <input
                type="radio"
                id="takeHome"
                name="calculation"
                value="takeHome"
                defaultChecked
              />
              <label htmlFor="takeHome">Take-home pay from salary</label>
            </span>

            <span
              className="rightCalculationButton"
              onChange={() => this.setState({ toCalculate: "salary" })}
            >
              <input
                type="radio"
                id="salary"
                name="calculation"
                value="salary"
              />
              <label htmlFor="salary">Salary from take-home pay</label>
            </span>
          </div>
          <br />
          <div className="userInput">
            <label
              htmlFor="income"
              style={{ marginRight: "1%" }}
              className="inputGroup"
            >
              {this.renderInputLabel()}
              {" (GBP)"}
            </label>
            <input
              id="income"
              type="number"
              className="inputGroup"
              min={0}
              step="1000"
              onChange={(e) => this.handleSearchQuery(e)}
            />
          </div>
          <TaxTable query={query} toCalculate={toCalculate} />
        </div>
      </React.Fragment>
    );
  }
}

export default TaxCalculator;
