import React from "react";
import ReviewTable from "./ReviewTable";
import ReviewSearchBar from "./ReviewSearchBar";
import { Grid, Header } from "semantic-ui-react";
// import RulesTable from "../RulesPage/RulesTable";
import RulesPage from "../RulesPage/RulesPage";
import { connect } from "react-redux";
import { getMRIRules } from "../../actions/RuleActions";
import { getSpecialtyExams } from "../../actions/SpecialtyExamActions";
import "../../styles/LabellingRules.css";

class ReviewPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showRules: true,
    };
  }
  async componentDidMount() {
    console.log("ReviewPage componentDidMount");
    await this.props.getMRIRules();
    await this.props.getSpecialtyExams();
  }

  handleClickShowRules = () => {
    this.setState({ showRules: !this.state.showRules });
    console.log(this.state.showRules);
  };

  render() {
    // if (this.props.loading)
    //   return <div className="page-container">Loading...</div>;

    let labellingClassname = "fieldsLabellingRules";
    let labellingWidth = 9;
    if (!this.state.showRules) {
      labellingClassname = "fieldsLabelling";
      labellingWidth = 12;
    }
    return (
      <div className="page-container">
        <Header as="h1" textAlign="left">
          Review
        </Header>
        <ReviewSearchBar />        
		<ReviewTable
			showRules={this.state.showRules}
			handleClickShowRules={this.handleClickShowRules}
			rulesListDropdown={this.props.rulesListDropdown}
		/>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    rulesListDropdown: state.rules.rulesListDropdown,
    rules: state.rules.rulesList,
    loading: state.rules.loading && state.specialtyExam.loading,
    error: state.rules.error,
    success: state.rules.success,
    sortedColumn: state.rules.column,
    sortDirection: state.rules.direction,
  };
};

export default connect(mapStateToProps, {
  getMRIRules,
  getSpecialtyExams,
})(ReviewPage);
