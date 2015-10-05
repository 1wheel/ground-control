import Relay from 'react-relay';

export default class extends Relay.Route {
  static queries = {
    groupCallInvitation: (Component) => Relay.QL`
      query {
        groupCallInvitation(id: $groupCallInvitationId)
      }`,
  };
  static paramDefinitions = {
    groupCallInvitationId: {required: true}
  }
  static routeName = 'AppHomeRoute';
}
