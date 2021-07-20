import React from "react";
import { connect } from "react-redux";
import {
  Button,
  Grid,
  Icon,
  Statistic,
  StatisticGroup,
  Container,
  Header,
} from "semantic-ui-react";
import { withRouter } from "react-router-dom";
import { getResultData } from "../actions/ResultActions";
import { getUserInfo } from "../actions/AuthActions";
import { compose } from "redux";
import { AUTH_USER_ID_TOKEN_KEY } from "../constants/userConstant";
import { Cache } from "aws-amplify";
import jwt_decode from "jwt-decode";
import Statistics from "./Statistics";

class HomePage extends React.Component {
  componentDidMount() {
    this.props.getResultData();
  }

  handleClick = () => {
    const { history } = this.props;
    history.push("dashboard/booking");
  };

  render() {
    const user = jwt_decode(Cache.getItem(AUTH_USER_ID_TOKEN_KEY));
    return (
      <div className="page-container">
        <Grid centered>
          <Grid.Row centered>
            <Container text>
              <Header as="h1" style={{ fontSize: "2em", paddingTop: "0.75em" }}>
                {`Welcome back, ${
                  this.props.auth.user.name
                    ? this.props.auth.user.name
                    : user.name
                }!`}
              </Header>
            </Container>
          </Grid.Row>
          <Grid.Row centered style={{ paddingBottom: "4em" }}>
            <Button
              color="blue"
              size="huge"
              onClick={this.handleClick}
              icon
              labelPosition="right"
            >
              <Icon name="arrow circle right" /> Book an MRI
            </Button>
          </Grid.Row>
          <Grid.Row centered>
            <StatisticGroup>
              <Statistic>
                <Statistic.Value>{this.props.info.daily}</Statistic.Value>
                <Statistic.Label>Forms processed today</Statistic.Label>
              </Statistic>
              <Statistic>
                <Statistic.Value>{this.props.info.weekly}</Statistic.Value>
                <Statistic.Label>Forms processed this week</Statistic.Label>
              </Statistic>
              <Statistic>
                <Statistic.Value>{this.props.info.monthly}</Statistic.Value>
                <Statistic.Label>Forms processed this month</Statistic.Label>
              </Statistic>
            </StatisticGroup>
          </Grid.Row>
          <Grid.Row centered>
            <Statistics />
          </Grid.Row>
        </Grid>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  auth: state.authentication,
  info: state.results.info,
});

export default compose(
  withRouter,
  connect(mapStateToProps, { getResultData, getUserInfo })
)(HomePage);
