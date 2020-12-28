import React from 'react';
import ResultsTable from "./ResultsTable";
import ResultSearchBar from "./ResultSearchBar";

class ResultsPage extends React.Component {

    render() {
        return (
            <div className='page-container'>
                <ResultSearchBar/>
                <ResultsTable/>
            </div>
        )
    }
}

export default ResultsPage;