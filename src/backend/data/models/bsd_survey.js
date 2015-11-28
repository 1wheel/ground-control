export default function(sequelize, DataTypes) {
  let BSDSurvey = sequelize.define('BSDSurvey', {
    id: {
      type: DataTypes.BIGINT,
      field: 'signup_form_id',
      primaryKey: true
    },
    slug: {
      type: DataTypes.STRING,
      field: 'signup_form_slug',
      allowNull: null
    }
  }, {
    updatedAt: 'modified_dt',
    createdAt: 'create_dt',
    underscored: true,
    tableName: 'bsd_signup_form',
  })
  return BSDSurvey;
}