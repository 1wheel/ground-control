export default function(sequelize, DataTypes) {
  let BSDAssignedCall = sequelize.define('BSDAssignedCall', {

  }, {
    underscored: true,
    tableName: 'bsd_assigned_calls',
    classMethods: {
      associate: (models) => {
        BSDAssignedCall.belongsTo(models.User,
          {
            as: 'caller',
            foreignKey: {
              name: 'caller_id',
              uniqe: true
            }
          })
        BSDAssignedCall.belongsTo(models.BSDPerson,
          {
            as: 'interviewee',
            foreignKey: {
              name: 'interviewee_id',
              unique: true
            }
          })
        BSDAssignedCall.belongsTo(models.BSDCallAssignment, {as: 'callAssignment'})
      }
    }
  })
  return BSDAssignedCall;
}