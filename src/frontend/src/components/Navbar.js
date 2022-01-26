import React from "react";
import logo from "../SapienML_Watermark-03.png";
import { Menu, Segment, Dropdown } from "semantic-ui-react";
import { Auth } from "aws-amplify";
import { NavLink, withRouter } from "react-router-dom";
import {
  AUTH_USER_ACCESS_TOKEN_KEY,
  AUTH_USER_ID_TOKEN_KEY,
} from "../constants/userConstant";
import { compose } from "redux";
import { connect } from "react-redux";
import { logout } from "../actions/AuthActions";
import { Cache } from "aws-amplify";

class Navbar extends React.Component {
  constructor(props) {
    super(props);
    this.handleLogout = this.handleLogout.bind(this);
  }

  async handleLogout() {
    const { history } = this.props;
    try {
      await Auth.signOut({ global: true });
      Cache.removeItem(AUTH_USER_ACCESS_TOKEN_KEY);
      Cache.removeItem(AUTH_USER_ID_TOKEN_KEY);
      this.props.logout();
      history.push("/login");
    } catch (e) {
      console.log("error signing out: ", e);
    }
  }

  render() {
    return (
      <Segment inverted color="blue">
        <Menu inverted secondary color="blue">
          <img src={logo} alt="logo" height="auto" width="200px" />
          <Menu.Item
            icon="home"
            name="home"
            as={NavLink}
            exact
            to="/dashboard"
          />
          <Menu.Item name="Book An MRI" as={NavLink} to="/dashboard/booking" />
          <Menu.Item name="Results" as={NavLink} to="/dashboard/results" />
          <Dropdown item text="Labelling">
            <Dropdown.Menu>
              <Dropdown.Item
                text="Labelling"
                as={NavLink}
                to="/dashboard/labelling"
              />
              <Dropdown.Item
                text="Results Statistics"
                as={NavLink}
                to="/dashboard/statistics"
              />
              <Dropdown.Item
                text="Re-run AI Status"
                as={NavLink}
                to="/dashboard/rerunstatus"
              />
            </Dropdown.Menu>
          </Dropdown>
		  <Dropdown item text="Denis">
			  <Dropdown.Menu>
				<Dropdown.Item
					text="Review"
					as={NavLink}
					to="/dashboard/Review"
				/>
				<Dropdown.Item
					text="Statistics"
					as={NavLink}
					to="/dashboard/stats"
				/>
			  </Dropdown.Menu>
		  </Dropdown>
          <Dropdown item text="Rules">
            <Dropdown.Menu>
              <Dropdown.Item text="Rules" as={NavLink} to="/dashboard/rules" />
              <Dropdown.Item
                text="Word Weights"
                as={NavLink}
                to="/dashboard/weights"
              />
              <Dropdown.Item
                text="Specialty Exams"
                as={NavLink}
                to="/dashboard/specialtyexams"
              />
            </Dropdown.Menu>
          </Dropdown>
          <Dropdown item text="Word Management">
            <Dropdown.Menu>
              <Dropdown.Item
                text="Spellchecker"
                as={NavLink}
                to="/dashboard/spellcheck"
              />
              <Dropdown.Item
                text="Conjunctions"
                as={NavLink}
                to="/dashboard/conjunctions"
              />
              <Dropdown.Item
                text="Synonyms"
                as={NavLink}
                to="/dashboard/synonyms"
              />
            </Dropdown.Menu>
          </Dropdown>
          {/* <Menu.Item name="Rules" as={NavLink} to="/dashboard/rules" />
          <Menu.Item
            name="Spellchecker"
            as={NavLink}
            to="/dashboard/spellcheck"
          />
          <Menu.Item name="Word Weights" as={NavLink} to="/dashboard/weights" />
          <Menu.Item
            name="Conjunctions"
            as={NavLink}
            to="/dashboard/conjunctions"
          />
          <Menu.Item name="Synonyms" as={NavLink} to="/dashboard/synonyms" />
          <Menu.Item
            name="Specialty Exams"
            as={NavLink}
            to="/dashboard/specialtyexams"
          /> */}
          <Menu.Menu position="right">
            {/*<Menu.Item>*/}
            {/*    <Input icon='search' placeholder='Search...' />*/}
            {/*</Menu.Item>*/}
            <Menu.Item name="logout" onClick={this.handleLogout} />
          </Menu.Menu>
        </Menu>
      </Segment>
    );
  }
}

const mapStateToProps = (state) => ({
  auth: state.authentication,
});

export default compose(
  withRouter,
  connect(mapStateToProps, { logout })
)(Navbar);
