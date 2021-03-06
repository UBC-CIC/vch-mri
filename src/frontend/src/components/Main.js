import React from 'react';
import Navbar from "./Navbar";
import {Route, Switch, withRouter} from 'react-router-dom';
import HomePage from "./HomePage";
import BookingPage from "./BookingPage/BookingPage";
import ResultsPage from "./ResultsPage/ResultsPage";
import RulesPage from "./RulesPage/RulesPage";
import SpellcheckerPage from "./SpellcheckerPage/SpellcheckerPage";
import WeightsPage from "./WeightsPage/WeightsPage";
import ConjunctionsPage from "./ConjunctionsPage/ConjunctionsPage";
import SynonymsPage from "./SynonymsPage/SynonymsPage";
import SpecialtyExamPage from "./SpecialtyExamPage/SpecialtyExamPage";

class Main extends React.Component {

    render() {
        return (
            <div className='main-container'>
                <Navbar/>
                <Route exact path="/dashboard" component={HomePage}/>
                <Route path="/dashboard/booking" component={BookingPage}/>
                <Route path="/dashboard/results" component={ResultsPage}/>
                <Route path="/dashboard/rules" component={RulesPage}/>
                <Route path="/dashboard/spellcheck" component={SpellcheckerPage}/>
                <Route path="/dashboard/weights" component={WeightsPage}/>
                <Route path="/dashboard/conjunctions" component={ConjunctionsPage}/>
                <Route path="/dashboard/synonyms" component={SynonymsPage}/>
                <Route path="/dashboard/specialtyexams" component={SpecialtyExamPage}/>
            </div>
        );
    }
}

export default withRouter(Main);