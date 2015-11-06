
import {
  GraphQLBoolean,
  GraphQLList,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLInputObjectType,
  GraphQLSchema,
  GraphQLString,
  GraphQLID,
  GraphQLEnumType
} from 'graphql';

import {
  connectionArgs,
  connectionDefinitions,
  connectionFromArray,
  fromGlobalId,
  globalIdField,
  mutationWithClientMutationId,
  nodeDefinitions,
} from 'graphql-relay';

import {
  Person,
  Group,
  CallAssignment,
  Call,
  Survey,
  GroupCall,
} from './models';

import moment from 'moment-timezone';
import Promise from 'bluebird';
import Maestro from '../maestro';
import thinky from './thinky';

class Viewer {
  constructor(identifier) {
    this.id = identifier
  }
}
const SharedViewer = new Viewer(1);

let {nodeInterface, nodeField} = nodeDefinitions(
  (globalId) => {
    let {type, id} = fromGlobalId(globalId);
    if (type === 'Person')
      return Person.get(id);
    if (type === 'Group')
      return Group.get(id);
    if (type === 'CallAssignment')
      return CallAssignment.get(id);
    if (type === 'Call')
      return Call.get(id);
    if (type === 'Survey')
      return Survey.get(id);
    if (type === 'GroupCall')
      return GroupCall.get(id);
    if (type === 'Viewer')
      return SharedViewer;
    return null;
  },
  (obj) => {
    if (obj instanceof Person)
      return GraphQLPerson;
    if (obj instanceof Group)
      return GraphQLGroup;
    if (obj instanceof CallAssignment)
      return GraphQLCallAssignment;
    if (obj instanceof Call)
      return GraphQLCall;
    if (obj instanceof Survey)
      return GraphQLSurvey;
    if (obj instanceof GroupCall)
      return GraphQLGroupCall;
    if (obj instanceof Viewer)
      return GraphQLViewer;
    return null;
  }
);

const GraphQLPerson = new GraphQLObjectType({
  name: "Person",
  description: "A person.",
  fields: () => ({
    id: globalIdField('Person'),
  }),
  interfaces: [nodeInterface]
})

let {
  connectionType: GraphQLPersonConnection,
} = connectionDefinitions({
  name: 'Person',
  nodeType: GraphQLPerson
});

const GraphQLGroup = new GraphQLObjectType({
  name: "Group",
  description: "A list of people as determined by some criteria",
  fields: () => ({
    personList: { type: GraphQLPersonConnection }
  })
});

const GraphQLCallAssignment = new GraphQLObjectType({
  name: "CallAssignment",
  description: 'A mass calling assignment',
  fields: () => ({
    id: globalIdField('CallAssignment'),
    name: { type: GraphQLString },
    callerGroup: { type: GraphQLGroup },
    targetGroup: { type: GraphQLGroup },
    survey: { type: GraphQLSurvey }
  }),
  interfaces: [nodeInterface]
});

var {
  connectionType: GraphQLCallAssignmentConnection,
} = connectionDefinitions({
  name: 'CallAssignment',
  nodeType: GraphQLCallAssignment
});

const GraphQLSurvey = new GraphQLObjectType({
  name: "Survey",
  description: "A survey to be filled out by a person",
  fields: () => ({
    id: globalIdField('Survey'),
    slug: { type: GraphQLString },
    bsdData: {
      type: GraphQLString,
      resolve: (survey) => {
        if (survey.bsdLink)
          console.log("here");
        return null;
      }
    }
  }),
  interfaces: [nodeInterface]
})

const GraphQLGroupCall = new GraphQLObjectType({
  name: "GroupCall",
  description: 'A group call',
  fields: () => ({
    id: globalIdField('GroupCall'),
    name: { type: GraphQLString },
    scheduledTime: { type: GraphQLInt },
    maxSignups: { type: GraphQLInt }
  }),
  interfaces: [nodeInterface]
});

let {
  connectionType: GraphQLGroupCallConnection,
} = connectionDefinitions({
  name: 'GroupCall',
  nodeType: GraphQLGroupCall
});

const GraphQLViewer = new GraphQLObjectType({
  name: 'Viewer',
  fields: () => ({
    id: globalIdField('Viewer'),
    groupCallList: {
      type: GraphQLGroupCallConnection,
      args: {
       upcoming: {
          type: GraphQLBoolean,
          defaultValue: null
        },
        ...connectionArgs,
      },
      resolve: async (viewer, {first, upcoming}) => {
        let r = thinky.r;
        let queryFilter = {};
        if (upcoming)
          queryFilter = (row) => row('scheduledTime').gt(new Date());
        else if (upcoming == false)
          queryFilter = (row) => row('scheduledTime').le(new Date());

        let calls = await r.table(GroupCall.getTableName())
          .orderBy('scheduledTime')
          .filter(queryFilter)
          .limit(first)

        return connectionFromArray(calls, {first});
      }
    },
    groupCall: {
      type: GraphQLGroupCall,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) }
      },
      resolve: async (viewer, {id}) => {
        let localID = fromGlobalId(id).id;
        let call = await GroupCall.get(localID);
        return call;
      }
    },
    callAssignmentList: {
      type: GraphQLCallAssignmentConnection,
      resolve: async (assignment, {first}) => {
        console.log("haere");
        let assignments = CallAssignment.fetch({})
        return connectionFromArray(assignments, {first});
      }
    }
  }),
  interfaces: [nodeInterface]
})

const GraphQLGroupCallInput = new GraphQLInputObjectType({
  name: 'GroupCallInput',
  fields: {
    name: { type: new GraphQLNonNull(GraphQLString) },
    scheduledTime: { type: new GraphQLNonNull(GraphQLInt) },
    maxSignups: { type: new GraphQLNonNull(GraphQLInt) },
    duration: { type: new GraphQLNonNull(GraphQLInt) }
  }
})

const GraphQLBatchCreateGroupCallMutation = mutationWithClientMutationId({
  name: 'BatchCreateGroupCall',
  inputFields: {
    groupCallList: { type: new GraphQLNonNull(new GraphQLList(GraphQLGroupCallInput)) }
  },
  outputFields: {
    viewer: {
      type: GraphQLViewer,
      resolve: () => {
        return SharedViewer;
      }
    }
  },
  mutateAndGetPayload:async ({topic, groupCallList}) => {
    let promises = [];
    let maestro = new Maestro(process.env.MAESTRO_UID, process.env.MAESTRO_TOKEN, process.env.MAESTRO_URL, process.env.DEBUG);

    for (let index = 0; index < groupCallList.length; index++) {
      let groupCall = groupCallList[index];
      let response = await maestro.createConferenceCall(groupCall.name, groupCall.maxSignups, moment(groupCall.scheduledTime).tz("America/Los_Angeles").format("YYYY.MM.DD HH:mm:ss"), groupCall.duration)

      promises.push(GroupCall.save({
        name: groupCall.name,
        scheduledTime: groupCall.scheduledTime,
        maxSignups: groupCall.maxSignups,
        duration: groupCall.duration,
        maestroConferenceUID: response.value.UID,
        signups: []
      }));
    };

    await Promise.all(promises);
    return {};
  }
});

let RootMutation = new GraphQLObjectType({
  name: 'RootMutation',
  fields: () => ({
    batchCreateGroupCall: GraphQLBatchCreateGroupCallMutation
  })
});

let RootQuery = new GraphQLObjectType({
  name: 'RootQuery',
  fields: () => ({
    viewer: {
      type: GraphQLViewer,
      resolve: () => SharedViewer
    },
    node: nodeField
  }),
});

export let Schema = new GraphQLSchema({
  query: RootQuery,
  mutation: RootMutation
});