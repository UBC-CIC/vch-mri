import React from 'react';
import { Storage } from 'aws-amplify';
import {Form, Grid, Header, Segment, TextArea} from 'semantic-ui-react';
import { withRouter } from "react-router-dom";
import { sendSuccessToast, sendErrorToast } from "../../helpers";

class SynonymsForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            fileContents: '',
            synonyms: []
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentDidMount() {
        this.setState({ loading: true });
        Storage.get('thesaurus.ths', {
            download: true,
            expires: 1
        })
            .then(data => {
                data.Body.text().then(string => {
                    let synonymStrings = string.split(/[\r\n]+/);
                    let synonyms = synonymStrings.map((s) => {
                        let words = s.split(' : ');
                        return {word: words[0], synonym: words[1]}
                    });

                    let fileStrings = synonyms.map((s) => [s.word, s.synonym].join(" : "));
                    let fileString = fileStrings.join("\n");
                    console.log(fileString);

                    console.log(synonyms);
                    this.setState({
                        fileContents: string,
                        synonyms: synonyms
                    })
                });
            })
            .catch(err => {
                console.log('error getting the thesaurus file')
            })
            .finally(() => this.setState({ loading: false }));
    }

    handleChange(e) {
        const {name, value} = e.target;
        this.setState({
            [name]: value
        });
    }

    handleSubmit(e) {
        e.preventDefault();
        this.setState({ loading: true });

        Storage.put('thesaurus.ths', this.state.fileContents, {
            level: 'public'
        })
            .then (result => {
                console.log(result);
                sendSuccessToast('Synonyms have been successfully updated!');
            })
            .catch(e => {
                console.log(e);
                sendErrorToast(e.message);
            })
            .finally(() => this.setState({ loading: false }));
    }

    render() {
        return (
            <Grid textAlign='center' verticalAlign='middle'>
                <Grid.Column style={{ maxWidth: 600 }}>
                    <Segment inverted color='blue'>
                        <Header as='h2' color='white' textAlign='center'>
                            Synonyms
                        </Header>
                        <p> Add words to the synonym dictionary! Synonym declarations must be formatted according to the PostgreSQL
                            thesaurus dictionary configuration file. In other words, each synonym must be declared in one line,
                            and must be formatted like this: </p>
                        <p> sample word(s) : indexed word(s) </p>
                        <Form inverted color='blue' loading={this.state.loading} onSubmit={this.handleSubmit}>
                            <Form.Field
                                fluid
                                control={TextArea}
                                rows='20'
                                name='fileContents'
                                value={this.state.fileContents}
                                onChange={this.handleChange}
                            />
                            <Form.Button color='black' content='Submit'/>
                        </Form>
                    </Segment>
                </Grid.Column>
            </Grid>
        )
    }
}

export default withRouter(SynonymsForm);