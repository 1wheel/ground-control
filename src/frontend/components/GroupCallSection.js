import React from 'react';
import Relay from 'react-relay';
import GroupCallInvitationList from './GroupCallInvitationList';
import {filterTypes} from './GroupCallInvitationList';
import {Paper, Styles} from "material-ui";

export class GroupCallSection extends React.Component {
  styles = {
    container: {
      position: "relative"
    },

    sideBar: {
      display: "inline-block",
      width: 200,
      minHeight: "800px",
      border: "solid 1px " + Styles.Colors.grey300,
    },

    content: {
      display: "inline-block",
      verticalAlign: 'top'
    }
  }

  render() {
    return (
      <Paper style={this.styles.container}>
        <Paper zDepth={0} style={this.styles.sideBar}>
          <GroupCallInvitationList viewer={this.props.viewer}  withUpcomingGroupCalls={true} />
          <GroupCallInvitationList viewer={this.props.viewer}  withUpcomingGroupCalls={false} />
        </Paper>
        <Paper zDepth={0} style={this.styles.content}>
          "Hi"
        </Paper>
      </Paper>
    )
  }
}

export default Relay.createContainer(GroupCallSection, {
  fragments: {
    viewer: () => Relay.QL`
      fragment on Viewer {
        ${GroupCallInvitationList.getFragment('viewer', {withUpcomingGroupCalls: true})},
        ${GroupCallInvitationList.getFragment('viewer', {withUpcomingGroupCalls: false})}
      }
    `,
  },
});