import React from "react";
import {
  Button,
  Form,
  Header,
  Icon,
  Input,
  Modal,
  Label,
  Container,
} from "semantic-ui-react";
import { connect } from "react-redux";
import { addSynonym } from "../../actions/SynonymActions";

const initialState = {
  open: false,
  word: "",
  synonyms: [],
  synonym: "",
};

class AddSynonymForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = initialState;

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.addSynonymTag = this.addSynonymTag.bind(this);
    this.removeSynonymTag = this.removeSynonymTag.bind(this);
  }

  handleChange(e) {
    const { name, value } = e.target;
    this.setState({
      [name]: value,
    });
  }

  handleSubmit(e) {
    e.preventDefault();
    this.props.addSynonym({
      key: this.state.word.trim(),
      value: this.state.synonyms.join(" / ").trim(),
    });
    this.setState(initialState);
  }

  addSynonymTag(e) {
    if (e.key === "Enter" && e.target.value.trim()) {
      this.setState({
        synonyms: [...this.state.synonyms, e.target.value],
        synonym: "",
      });
    }
  }

  // addSynonymTag() {
  //     const s = this.state.synonym.trim();
  //     if (s) {
  //         this.setState({
  //             synonyms: [...this.state.synonyms, s],
  //             synonym: ''
  //         });
  //     }
  // }

  removeSynonymTag(i) {
    let newSynonyms = this.state.synonyms.slice(0);
    newSynonyms.splice(i, 1);
    this.setState({
      synonyms: newSynonyms,
    });
  }

  render() {
    return (
      <Modal
        as={Form}
        onSubmit={this.handleSubmit}
        style={{ maxWidth: 500 }}
        onClose={() => this.setState(initialState)}
        onOpen={() => this.setState({ open: true })}
        open={this.state.open}
        trigger={
          <Button
            floated="right"
            icon
            labelPosition="left"
            primary
            size="small"
          >
            <Icon name="add circle" /> Add Synonym
          </Button>
        }
      >
        <Header as="h2" color="blue" textAlign="center">
          Add a new Synonym Relation
        </Header>
        <Modal.Content>
          <Form.Field
            fluid
            control={Input}
            name="word"
            label="Word / Phrase"
            value={this.state.word}
            onChange={this.handleChange}
          />
          <Form.Field
            // action={{
            //     color: 'blue',
            //     labelPosition: 'right',
            //     icon: 'add',
            //     content: 'Add',
            //     onClick: () => this.addSynonymTag()
            // }}
            fluid
            control={Input}
            name="synonym"
            label="Assigned Synonyms - Press Enter to add each one"
            placeholder="Input your synonym here and press Enter to add it!"
            value={this.state.synonym}
            onChange={this.handleChange}
            onKeyPress={(e) => {
              if (e.key === "Enter") e.preventDefault();
            }}
            onKeyUp={this.addSynonymTag}
          />
          <Container>
            <b>Synonyms: </b>
            {this.state.synonyms.map((syn, index) => (
              <Label as="a" color="blue" key={"row-data-" + index}>
                {syn}
                <Icon
                  name="delete"
                  link
                  onClick={() => {
                    this.removeSynonymTag(index);
                  }}
                />
              </Label>
            ))}
          </Container>
        </Modal.Content>
        <Modal.Actions>
          <Button
            color="black"
            content="Cancel"
            onClick={() => this.setState(initialState)}
          />
          <Button
            type="submit"
            content="Add Synonym"
            color="blue"
            disabled={!this.state.word || this.state.synonyms.length === 0}
          />
        </Modal.Actions>
      </Modal>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    synonyms: state.synonyms.synonymsList,
    loading: state.synonyms.loading,
    error: state.synonyms.error,
  };
};

export default connect(mapStateToProps, { addSynonym })(AddSynonymForm);
