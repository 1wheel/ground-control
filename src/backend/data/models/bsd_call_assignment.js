export default function(sequelize, DataTypes) {
  let BSDCallAssignment = sequelize.define('BSDCallAssignment', {
    name: DataTypes.STRING
  }, {
    underscored: true,
    tableName: 'call_assignments',
    classMethods: {
      associate: (models) => {
        BSDCallAssignment.belongsTo(models.BSDSurvey)
        BSDCallAssignment.belongsTo(models.BSDGroup, {as: 'targetGroup'});
        BSDCallAssignment.belongsTo(models.BSDGroup, {as: 'callerGroup'});
      }
    }
  })
  return BSDCallAssignment;
}