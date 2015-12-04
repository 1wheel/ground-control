import 'babel/polyfill';
import jQuery from 'jquery';
import Minilog from 'minilog';
import React from 'react';
import ReactDOM from 'react-dom';
import Relay from 'react-relay';
import {Redirect, IndexRoute, IndexRedirect, Route, Router} from 'react-router';
import ReactRouterRelay from 'react-router-relay';
import injectTapEventPlugin from 'react-tap-event-plugin';
import AdminDashboard from './components/AdminDashboard';
import AdminEventsSection from './components/AdminEventsSection';
import AdminCallAssignmentsSection from './components/AdminCallAssignmentsSection';
import AdminCallAssignmentCreationForm from './components/AdminCallAssignmentCreationForm';
import GCTextField from './components/forms/GCTextField';
import GCRadioButtonsField from './components/forms/GCRadioButtonsField';
import GCSelectField from './components/forms/GCSelectField';
import GCBooleanField from './components/forms/GCBooleanField';
import CallAssignmentsDashboard from './components/CallAssignmentsDashboard';
import AdminCallAssignment from './components/AdminCallAssignment';
import CallAssignment from './components/CallAssignment';
import CallAssignmentsSection from './components/CallAssignmentsSection';
import Dashboard from './components/Dashboard';
import Signup from './components/Signup';
import NotFound from './components/NotFound'
import Form from 'react-formal';
import {createHistory} from 'history';
import RelayNetworkLayer from './RelayNetworkLayer'

// Necessary to make minilog work
window.jQuery = jQuery;
Minilog
  .enable()
  .pipe(new Minilog.backends.jQuery({
    url: 'http://localhost:3000/log',
    interval: 5000
    }));
window.log = Minilog('client');
log.error('test', 'what\ntest');
injectTapEventPlugin();
Relay.injectNetworkLayer(new RelayNetworkLayer('/graphql'));

Form.addInputTypes({
  string: GCTextField,
  boolean: GCBooleanField,
  radio: GCRadioButtonsField,
  select: GCSelectField
})

const ListContainerQueries = {
  listContainer: () => Relay.QL`query { listContainer }`
};

const CallAssignmentQueries = {
  callAssignment: () => Relay.QL`query { callAssignment(id: $id) }`
}

const CurrentUserQueries = {
  currentUser: () => Relay.QL`query { currentUser}`
}

let history = createHistory()

ReactDOM.render(
  <Router
    history={history}
    createElement={ReactRouterRelay.createElement}>
    <Route
      path='/admin'
      component={AdminDashboard}>
      <Route
        path='call-assignments'
        component={AdminCallAssignmentsSection}
        queries={ListContainerQueries}
      >
        <Route
          path='create'
          component={AdminCallAssignmentCreationForm}
          queries={ListContainerQueries}
        />
        <Route
          path=':id'
          component={AdminCallAssignment}
          queries={CallAssignmentQueries}
        />
      </Route>
      <Route
        path='events'
        component={AdminEventsSection}
        queries={ListContainerQueries}
      />
    </Route>
    <Route
      path='/'
      component={Dashboard}>
      <IndexRedirect to='/call-assignments' />
      <Route
        path='call-assignments'
        component={CallAssignmentsDashboard}
      >
        <IndexRoute
          component={CallAssignmentsSection}
          queries={CurrentUserQueries}
        />
        <Route
          path=':id'
          component={CallAssignment}
          queries={{
            ...CallAssignmentQueries,
            ...CurrentUserQueries
          }}
        />
      </Route>
      <Route
        path='/signup'
        component={Signup}
      />
    </Route>
    <Route path="*" component={NotFound} />
  </Router>,
  document.getElementById('root')
);
