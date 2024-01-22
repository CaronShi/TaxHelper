import React, { Component } from 'react';
import fedtax from '../Assets/fedtax.json';
import statetax from '../Assets/CATax.json';

interface State {
    personCount: number;
    personIncomes: number[];
    selectedFilingStatus: string;
    totalIncome: number;
    Fedrate: number;
    staterate: number;
    incomeTax: number;
}

class IncomeInputs extends Component<{}, State> {
    constructor(props: {}) {
        super(props);
        this.state = {
            personCount: 1,
            personIncomes: [25000],
            selectedFilingStatus: "Married filing jointly",
            totalIncome: 0,
            Fedrate: 0,
            staterate: 0,
            incomeTax: 0,
        };
    }

    addAPerson = () => {
        this.setState((prevState: State) => ({
            personCount: prevState.personCount + 1,
            personIncomes: [...prevState.personIncomes, 25000],
        }));
    }

    deleteLastPerson = () => {
        if (this.state.personCount === 1) {
            alert('You must have at least one person');
            return;
        }

        this.setState((prevState: State) => {
            const updatedPersonIncomes = [...prevState.personIncomes];
            updatedPersonIncomes.pop(); // Remove the last person's income
            return {
                personCount: prevState.personCount - 1,
                personIncomes: updatedPersonIncomes,
            };
        });
    }
    calculateIncomeTax = () => {
        let curStatus = this.state.selectedFilingStatus; // Add space before capital letters

        const { personIncomes } = this.state;
        let totalIncome = personIncomes.reduce((acc, income) => acc + income, 0);

        this.setState({ totalIncome });
        //Find the appropriate tax brackets based on the selected filing status
        interface FedTax {
            [key: string]: {
                income_tax_brackets: {
                    bracket: number;
                    marginal_rate: number;
                }[];
            };
        }
        const taxBrackets = (fedtax as FedTax)[curStatus].income_tax_brackets;

        let Fedrate = 0
        let incomeTax = 0
        // Calculate the income tax based on the tax brackets
        for (let i = 0; i < 6; i++) {
            let curLevel = taxBrackets[i].bracket;
            let nextLevel = taxBrackets[i + 1].bracket;
            let maxLevel = taxBrackets[5].bracket;
            if (totalIncome >= maxLevel) {
                Fedrate = taxBrackets[5].marginal_rate;
                incomeTax = totalIncome * Fedrate;
            }

            else if (totalIncome >= curLevel && totalIncome < nextLevel) {
                Fedrate = taxBrackets[i].marginal_rate;
                incomeTax = totalIncome * Fedrate;
            }
        }

        interface StateTax {
            [key: string]: {
                income_tax_brackets: {
                    bracket: number;
                    marginal_rate: number;
                }[];
                special_taxes: never[];
                deductions: {
                    deduction_name: string;
                    deduction_amount: number;
                }[];
                credits: never[];
                annotations: never[];
            };
        }

        const stateTaxBrackets = (statetax as StateTax)[curStatus].income_tax_brackets;

        let stateRate = 0
        for (let i = 0; i < stateTaxBrackets.length - 2; i++) {
            let curLevel1 = stateTaxBrackets[i].bracket;
            let nextLevel1 = stateTaxBrackets[i + 1].bracket;
            let maxLevel1 = stateTaxBrackets[5].bracket;


            if (totalIncome >= maxLevel1) {
                stateRate = parseFloat((stateTaxBrackets[i].marginal_rate * 0.01).toFixed(3));
            }

            else if (totalIncome >= curLevel1 && totalIncome < nextLevel1) {
                stateRate = parseFloat((stateTaxBrackets[i].marginal_rate * 0.01).toFixed(3));
            }

        }

        // Update the state with the calculated values
        this.setState({ incomeTax });
        this.setState({ Fedrate });
        this.setState({ staterate: stateRate });

    }

    handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedValue = event.target.value;
        // Convert the select value to match the JSON key names
        //console.log("selectedValue", selectedValue)
        this.setState({ selectedFilingStatus: selectedValue });
    }




    renderPersons() {
        const { personIncomes } = this.state;

        return personIncomes.map((income: number, index: number) => (
            <div key={index} className="my-4 flex items-center">
                <label className="block mb-1">{`Person ${index + 1} Income $`}</label>
                <input
                    value={income}
                    onChange={(e) => this.handleIncomeChange(e, index)}
                    className="px-3 py-2 border rounded-md w-48"
                />
            </div>
        ));
    }

    handleIncomeChange = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const { value } = event.target;
        const updatedIncomes = [...this.state.personIncomes];
        updatedIncomes[index] = Number(value);
        this.setState({ personIncomes: updatedIncomes });
    }

    renderResults() {
        const { totalIncome, Fedrate, incomeTax, staterate } = this.state;

        return (
            <div className="my-4">
                <ul>Your total income: {totalIncome}</ul>
                <ul>Your tax Fedrate: {Fedrate}</ul>
                <ul>Your income tax: {incomeTax}</ul>
                <br></br>
                <ul>Your state tax rate: {staterate}</ul>
                <ul>Your state tax : {totalIncome * staterate}</ul>
            </div>
        );
    }

    render() {
        const { personCount } = this.state;

        return (
            <div>
                <form className="flex flex-col items-center justify-center">
                    <h1 className="text-2xl font-bold mb-4">Income Tax Calculator</h1>
                    <div className="my-4 flex items-center">
                        <label className="block mb-1">Filing Status</label>
                        <select
                            value={this.state.selectedFilingStatus}
                            onChange={this.handleSelectChange}
                            className="px-3 py-2 border rounded-md w-48"
                        >
                            <option value="Married filing jointly">Married filing jointly</option>
                            <option value="Single">Single</option>
                            <option value="Married filing separately">Married filing separately</option>
                            <option value="Head of household">Head of Household</option>
                        </select>
                    </div>
                    {this.renderPersons()}

                    {personCount > 0 && (
                        <div className="flex items-center">
                            <button
                                type="button"
                                onClick={this.deleteLastPerson}
                                className="px-2 py-1 border border-red-500 text-red-500 rounded-md hover:bg-red-100 hover:text-red-700"
                            >
                                -
                            </button>
                            <button
                                type="button"
                                onClick={this.addAPerson}
                                className="px-2 py-1 ml-2 border border-blue-500 text-blue-500 rounded-md hover:bg-blue-100 hover:text-blue-700"
                            >
                                +
                            </button>
                        </div>
                    )}

                    <button
                        type="button"
                        className="mt-4 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                        onClick={this.calculateIncomeTax}
                    >
                        Calculate Income Tax
                    </button>

                </form>
                {this.renderResults()}
            </div>
        );
    }
}
export default IncomeInputs;
