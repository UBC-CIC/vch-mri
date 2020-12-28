import React from 'react';
import SynonymsForm from "./SynonymsForm";
import SynonymsTable from "./SynonymsTable";

class SynonymsPage extends React.Component {

    render() {
        return (
            <div className='page-container'>
                <SynonymsTable/>
                {/*<SynonymsForm/>*/}
            </div>
        )
    }
}

export default SynonymsPage;