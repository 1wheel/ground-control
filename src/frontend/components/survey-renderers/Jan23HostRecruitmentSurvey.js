import React from 'react';
import Relay from 'react-relay';
import moment from 'moment';
import {BernieText, BernieColors} from '../styles/bernie-css';
import {Paper} from 'material-ui';
import GCBooleanField from '../forms/GCBooleanField';
import GCSelectField from '../forms/GCSelectField'
import GCTextField from '../forms/GCTextField'
import Geosuggest from 'react-geosuggest'
import {USTimeZones} from '../data/USTimeZones';

class Jan23HostRecruitmentSurvey extends React.Component {

  styles = {
    question: {
      ...BernieText.secondaryTitle,
      fontWeight: 600,
      marginTop: 20,
      color: BernieColors.blue,
      fontSize: '1em',
      letterSpacing: '0em'
    },
    paragraph: {
      marginTop: 10
    }
  }

  state = {
    errors: {},
    alreadyHosting: null,
    hasLocation: null,
    address: null,
    state: null,
    city: null,
    zip: null,
    timezone: 'US/Eastern',

  }

  submit() {
    if (this.checkForm())
      this.props.onSubmitted({
        'already_hosting': this.state.alreadyHosting,
        'has_location': this.state.hasLocation,
        /*
        'event': {
          'event_type_id': 1,
          'creator_cons_id': this.props.interviewee.id,
          'name': 'Jan 23rd Bernie Livestream Party',
          'description': 'Bernie has a special message to share with his supporters one week away from the Iowa caucus. Join other volunteers in your area to watch Bernie address all of us live!',
          'venue_name': `${this.props.interviewee.firstName}'s House`,
          'venue_addr1': this.state.address,
          'venue_zip': this.state.zip,
          'venue_city': this.state.city,
          'venue_state_cd': this.state.state,
          'venue_country': 'US',
          'local_timezone': this.state.timezone,
          'start_dt': moment('2016-01-23 14:30:00-08:00').toDate(),
          'capacity': 0,
          'is_searchable': 1,
          'flag_approval': 0,
        }
        */
      })
  }

  checkForm() {
    let errors = {}
    if (this.state.alreadyHosting === null) {
      errors = {alreadyHosting: 'This field is required'}
    }
    else if (this.state.alreadyHosting === false) {
      if (this.state.hasLocation === null) {
        errors = {hasLocation: 'This field is required'}
      }
/*      else if (this.state.hasLocation === 'yes') {
        let requiredFields = ['address', 'state', 'city', 'zip']
        requiredFields.forEach((field) => {
          if (this.state[field] === null)
            errors[field] = 'This field is required'
        })
      }
      */
    }
    this.setState({errors})
    if (Object.keys(errors).length > 0)
      return false
    return true;
  }

  renderScriptAfterQuestion(yes, no, questionValue) {
    let both = (
      <div>
        <div><strong>[If yes]</strong> {yes}</div>
        <div style={this.styles.paragraph}><strong>[If no]</strong> {no}</div>
      </div>
    )

    return (
      <div style={{marginTop: 20}}>
        {questionValue === true ? yes : (questionValue === false) ? no : both}
      </div>
    )
  }

  renderLocationFields() {
    return (
      <div>
        <Geosuggest
          ref='address'
          country='us'
          placeholder="Address"
          errorText={this.state.errors.address}
          initialValue={this.state.address}
          onChange={(val) => {
            this.setState({address: val})
          }}
          onSuggestSelect={(val) => {
            let {address, state, city, zip} = this.state
            let newAddress = ''
            if (val && val.gmaps && val.gmaps.address_components) {
              val.gmaps.address_components.forEach((component) => {
                if (component.types) {
                  if (component.types[0] === 'street_number')
                    newAddress = component.long_name + ' ' + newAddress
                  else if (component.types[0] === 'route')
                    newAddress = newAddress + component.short_name
                  else if (component.types[0] === 'locality')
                    city = component.long_name
                  else if (component.types[0] === 'administrative_area_level_1')
                    state = component.short_name
                  else if (component.types[0] === 'postal_code')
                    zip = component.short_name
                }
              })
              if (newAddress !== '')
                address = newAddress
              let newState = {address, state, city, zip}
              this.setState(newState)
              this.refs.address.update(address)
            }
          }}
        />
        <GCTextField
          label='City'
          value={this.state.city}
          style={{width: 300}}
          errorText={this.state.errors.city}
          onChange={(val) => this.setState({city: val})}
        />
        <GCTextField
          label='State'
          value={this.state.state}
          style={{width: 120}}
          errorText={this.state.errors.state}
          onChange={(val) => this.setState({state: val})}
        />
        <GCTextField
          label='Zip'
          value={this.state.zip}
          style={{width: 120}}
          errorText={this.state.errors.zip}
          onChange={(val) => this.setState({zip: val})}
        />
        <GCSelectField
          value={this.state.timezone}
          choices={this.timezoneChoices()}
          style={{width: 180}}
          errorText={this.state.errors.timezone}
          clearable={false}
          onChange={(val) => this.setState({timezone: val})}
        />

      </div>
    )
  }

  timezoneChoices() {
    let choices = {}
    USTimeZones.forEach((tz) => {
      choices[tz.value] = tz.name
    })
    return choices;
  }

  render() {
    let hasLocationYes = (
      <div>
        Great! Let me take down that location now, and your party will be all set up for you!
        <br /><strong>[Go to <a target="_blank" href="http://organize.berniesanders.com/admin/events/create">the event creation page</a> and create the event for the person]</strong>
        <div style={{paddingTop: 10}}>
        You are all set. Thanks so much for hosting, and have a great day!
        </div>
      </div>
    )
    let hasLocationNo = <div>No worries! You’ll get an email really soon with a link to modify your event.  If you’re having any trouble updating it, just write to help@berniesanders.com. Thanks, and have a great day!
    <br /><strong>[Go to <a target="_blank" href="http://organize.berniesanders.com/admin/events/create">the event creation page</a> and create the event for the person with TBD for location]</strong></div>
    let wontHost = <div>That’s okay. Hopefully someone else hosts in your area and you can attend their event.  You will get an email with your local options or you can always check map.berniesanders.com  Thanks for your time and have a great day.</div>
    let allLocationOptions = (
      <div>
        <div><strong>[If yes]</strong> {hasLocationYes}</div>
        <div style={this.styles.paragraph}><strong>[If no]</strong> {hasLocationNo}</div>
        <div style={this.styles.paragraph}><strong>[If cannot host]</strong> {wontHost}</div>
      </div>
    )

    let alreadyHostingYes = <div>Perfect! Looks like my work here is just about done. If you have any questions about the event, you can email the Help Desk at help@berniesanders.com.  We are also having a host training call at 6pm EST/3pm PST as well as one on Thursday at 9:30 EST/6:30 PST.  Can you make one of those? Check your email for the RSVP links the subject of the email was “Important Information about your Jan 23rd Livestream event”  Thanks and have a great rest of your day!</div>
    let alreadyHostingNo = <div>
      Not a problem! Let’s get your event page set up now; once that happens you’ll get a link that will let you edit the details which you can update if needed.  We also will be able to help get you RSVPs from our list if you get your event up right now.
        <GCSelectField
          style={{
            width: '100%'
          }}
          choices={{
            'yes': 'Yes',
            'no': 'No',
            'wont_host': 'Actually, I can\'t host an event anymore'
          }}
          errorText={this.state.errors.hasLocation}
          label='So, do you have a location ready?'
          labelStyle={this.styles.question}
          clearable={false}
          value={this.state.hasLocation}
          onChange={(value) => {
            this.setState({hasLocation: value})
          }}
          />
          <div style={{marginTop: 20}}>
            {this.state.hasLocation === null ? allLocationOptions : (this.state.hasLocation === 'yes' ? hasLocationYes : (this.state.hasLocation === 'no' ? hasLocationNo : wontHost))}
          </div>
      </div>

    return (
      <div style={BernieText.default}>
        <div>
          Hi, may I please speak to <strong>{this.props.interviewee.firstName}</strong>?

          My name is {this.props.currentUser.firstName} and I'm a volunteer with the Bernie Sanders campaign. How are you doing today?

          I'm calling because you committed to host a party on January 23rd for the Bernie Livestream. It’s so awesome that you’ve decided to hold one of these events!
        </div>

        <GCBooleanField
          errorText={this.state.errors.alreadyHosting}
          label="Have you already created your event on berniesanders.com?"
          labelStyle={this.styles.question}
          value={this.state.alreadyHosting}
          onChange={(value) => {
            this.setState({
              alreadyHosting: value
            })
          }}
          />
        {this.renderScriptAfterQuestion(alreadyHostingYes, alreadyHostingNo, this.state.alreadyHosting)}
      </div>
    )
  }
}

export default Relay.createContainer(Jan23HostRecruitmentSurvey, {
  fragments: {
    currentUser: () => Relay.QL`
      fragment on User {
        firstName
        relatedPerson {
          id
        }
      }
    `,
    interviewee: () => Relay.QL`
      fragment on Person {
        id
        firstName
      }
    `,
  }
})