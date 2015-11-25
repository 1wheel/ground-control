import Sequelize from 'sequelize';
let sequelize = new Sequelize(
  process.env.POSTGRES_DBNAME,
  process.env.POSTGRES_USER,
  process.env.POSTGRES_PASSWORD,
  {
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    dialect: 'postgres'
  }
);

sequelize.beforeDefine('defaultModelAttributes', (model) => {
  console.log(model);
})





//export const Event = sequelize.define('Event', {
//  id: type.string().options({enforce_missing: false}),
//  BSDId: type.string().allowNull(true),
//  name: type.string().allowNull(true)
//})

/*export const CallAssignment = sequelize.define('call_assignment', {
  name: Sequelize.STRING,
}, {
  underscored: true
})

export const Group = sequelize.define('group', {
  BSDId: {
    type: Sequelize.INTEGER,
    field: 'cons_group_id',
  }
})

export const Survey = sequelize.define('survey', {
  BSDId: {
    type: Sequelize.INTEGER,
    field: 'signup_form_id'
  }
}, { underscored: true })

export const GroupCall = sequelize.define('group_call', {
  name: Sequelize.STRING,
  scheduledTime: Sequelize.DATE,
  maxSignups: Sequelize.INTEGER,
  duration: Sequelize.INTEGER,
  maestroConferenceUID: Sequelize.STRING,
  signups: [{
    personId: Sequelize.STRING,
    attended: Sequelize.BOOLEAN,
    role: Sequelize.ENUM(['host', 'note_taker', 'participant'])
  }]
})

CallAssignment.hasOne(Group, {as: 'callerGroup', foreignKey : 'callerGroupId'});
CallAssignment.hasOne(Group, {as: 'targetGroup', foreignKey : 'targetGroupId'});
Person.hasMany(Email, {as: 'emails'})
*/
