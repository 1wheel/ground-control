import React from 'react';
import Relay from 'react-relay';
import {BernieText, BernieColors} from './styles/bernie-css'
import Radium from 'radium'
import SideBarLayout from './SideBarLayout';
import CallAssignmentList from './CallAssignmentList';
import CallAssignment from './CallAssignment';
import TopNav from './TopNav';

@Radium
class CallAssignmentsDashboard extends React.Component {
  render() {
    return (
      <div>
        <TopNav
          zDepth={0}
          barColor={BernieColors.lightGray}
          tabColor={BernieColors.darkGray}
          selectedTabColor={BernieColors.gray}
          logoColors={{
            primary: BernieColors.blue,
            swoosh: BernieColors.red
          }}
          tabs={[
          {
            value: '/call',
            label: 'Make Calls'
          }]}
          history={this.props.history}
          location={this.props.location}
        />
        {this.props.children}
      </div>
    )
  }
}

export default Relay.createContainer(CallAssignmentsDashboard, {
  fragments: {
    currentUser: () => Relay.QL`
      fragment on User {
        callsMadeCount
      }
    `
  }
})
