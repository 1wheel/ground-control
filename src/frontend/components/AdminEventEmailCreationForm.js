import React from 'react'
import Relay from 'react-relay'
import {BernieColors, BernieText} from './styles/bernie-css'
import {Paper} from 'material-ui'
import GCForm from './forms/GCForm'
import Form from 'react-formal'
import EventPreview from './EventPreview'
import MutationHandler from './MutationHandler'
import CreateEventEmail from '../mutations/CreateEventEmail'
import yup from 'yup'

class AdminEventEmailCreationForm extends React.Component {
  styles = {
    detailsContainer: {
      float: 'left',
      width: 380
    },

    formContainer: {
      float: 'left',
      width: 380,
      paddingLeft: 15,
      paddingRight: 15,
      paddingTop: 15,
      paddingBottom: 15,
      marginTop: 15,
      border: 'solid 1px ' + BernieColors.lightGray
    }
  }

  formSchema = yup.object({
    hostEmail: yup.string().email().required(),
    senderEmail: yup.string().email().required(),
    hostMessage: yup.string().required(),
    senderMessage: yup.string().required()
  })

//    <Paper zDepth={1} style={this.styles.detailsContainer}>
//<EventPreview
//event={this.props.event}
///>
//</Paper>

  render() {
    return (
      <div>
        <MutationHandler ref='mutationHandler'
                         successMessage='Event email sent!'
                         mutationClass={CreateEventEmail} />
        <div style={BernieText.title}>
          Send Event Email
        </div>
        <p>
          Email nearby potential attendees, encouraging them to come out.
        </p>
        <br />

        <Paper zDepth={1} style={this.styles.formContainer}>
          <GCForm
            schema={this.formSchema}
            defaultValue={{
              hostEmail: this.props.event.host.email
            }}
            onSubmit={(formValue) => {
              this.refs.mutationHandler.send({
                listContainer: this.props.listContainer,
                ...formValue
              })
            }}
          >
            <Form.Field
              name='hostEmail'
              label="Host Email Address"
            />
            <br />
            <Form.Field
              name='senderEmail'
              label="Sender Email Address"
            />
            <Form.Field
              name='hostMessage'
              multiLine={true}
              rows={5}
              label="Message From Host"
            />
            <br />
            <Form.Field
              name='senderMessage'
              multiLine={true}
              rows={5}
              label="Message From Sender"
            />
            <br />
            <br />
            <Form.Button type='submit' label='Send!' fullWidth={true} />
          </GCForm>
        </Paper>
      </div>
    )
  }
}

export default Relay.createContainer(AdminEventEmailCreationForm, {
  fragments: {
    event: () => Relay.QL`
      fragment on Event {
        attendeesCount
        attendeeVolunteerMessage
        attendeeVolunteerShow
        capacity
        contactPhone
        createDate
        description
        duration
        eventIdObfuscated
        eventType {
          id
          name
        }
        flagApproval
        host {
          id
          firstName
          lastName
          email
        }
        hostReceiveRsvpEmails
        id
        isSearchable
        latitude
        localTimezone
        localUTCOffset
        longitude
        name
        publicPhone
        rsvpEmailReminderHours
        rsvpUseReminderEmail
        startDate
        venueAddr1
        venueAddr2
        venueCity
        venueCountry
        venueDirections
        venueName
        venueState
        venueZip
      }
    `
  }
})
