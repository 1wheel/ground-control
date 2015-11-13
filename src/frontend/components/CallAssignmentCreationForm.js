import React from 'react';
import Relay from 'react-relay';
import {BernieColors, BernieText} from './styles/bernie-css'
import {Paper} from 'material-ui';
import GCForm from './forms/GCForm';
import Form from 'react-formal';
import CreateCallAssignment from '../mutations/CreateCallAssignment';
import yup from 'yup';

export default class CallAssignmentCreationForm extends React.Component {

  styles = {
    formContainer: {
      width: 280,
      paddingLeft: 15,
      paddingRight: 15,
      paddingTop: 15,
      paddingBottom: 15,
      marginTop: 15,
      border: 'solid 1px ' + BernieColors.lightGray
    }
  }

  formSchema = yup.object({
    surveyId: yup.string().required(),
    callerGroupId: yup.string().required(),
    targetGroupId: yup.string().required(),
    name: yup.string().required(),
//    startDate: yup.date().required(),
//    endDate: yup.date()
  })

  render() {
    return (
      <div>
      <div style={BernieText.title}>
        Create Assignment
      </div>
      <div>
        Create a new phonebanking assignment. Before you fill out this form, make sure you've set up the correct objects in BSD.
      </div>
      <Paper zDepth={0} style={this.styles.formContainer}>
        <GCForm
          schema={this.formSchema}
          onSubmit={(formValue) => {
            let onFailure = (transaction) => {
              let error = transaction.getError() || new Error('Mutation failed.');
              console.log(error);
            };
            Relay.Store.update(
              new CreateCallAssignment({
                viewer: this.props.viewer,
                ...formValue
              }), {onFailure}
            );
          }}
        >
          <Form.Field
            name='name'
            label='Name'
          />
          <br />
          <Form.Field
            name='surveyId'
            label='Survey ID (BSD ID)'
          /><br />
          <Form.Field
            name='callerGroupId'
            label='Caller Group (BSD cons_group ID)'
          /><br />
          <Form.Field
            name='targetGroupId'
            label='Target Group (BSD cons_group ID)'
          /><br />
          <Form.Button type='submit' label='Create!' fullWidth={true} />
        </GCForm>
      </Paper>
      </div>
    )
  }
}

export default Relay.createContainer(CallAssignmentCreationForm, {
  fragments: {
    viewer: () => Relay.QL`
      fragment on Viewer {
        ${CreateCallAssignment.getFragment('viewer')},
      }
    `
  },
});
