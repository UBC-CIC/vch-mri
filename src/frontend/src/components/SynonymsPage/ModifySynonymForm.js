import React from "react";
import {
  Button,
  Container,
  Form,
  Header,
  Icon,
  Input,
  Label,
  Modal,
} from "semantic-ui-react";
import { modifySynonym } from "../../actions/SynonymActions";
import { connect } from "react-redux";

const initialState = {
  open: false,
  word: "",
  synonyms: [],
  synonym: "",
};

class ModifySynonymForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      word: this.props.word,
      synonyms: this.props.synonymList,
      synonym: "",
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.addSynonymTag = this.addSynonymTag.bind(this);
    this.removeSynonymTag = this.removeSynonymTag.bind(this);
  }

  componentWillReceiveProps(nextProps, nextContext) {
    this.setState({
      word: nextProps.word,
      synonyms: nextProps.synonymList,
    });
  }

  handleChange(e) {
    const { name, value } = e.target;
    this.setState({
      [name]: value,
    });
  }

  handleSubmit(e) {
    e.preventDefault();
    this.props.modifySynonym({
      //   synonym: {
      key: this.state.word.trim(),
      value: this.state.synonyms.join(" / ").trim(),
      //   },
      index: this.props.id,
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
        onClose={() => this.setState({ open: false })}
        onOpen={() => this.setState({ open: true })}
        open={this.state.open}
        trigger={
          <Button icon size="tiny" labelPosition="left">
            <Icon name="edit" />
            Modify
          </Button>
        }
      >
        <Header as="h2" color="blue" textAlign="center">
          Modify an existing Synonym
        </Header>
        <Modal.Content>
          <Form.Field
            fluid
            control={Input}
            name="word"
            label="Word / Phrase"
            disabled={true}
            value={this.state.word}
            onChange={this.handleChange}
          />
          <Form.Field
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
            onClick={() => this.setState({ open: false })}
          />
          <Button
            type="submit"
            content="Modify Synonym"
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

export default connect(mapStateToProps, { modifySynonym })(ModifySynonymForm);
