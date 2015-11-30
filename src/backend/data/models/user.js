import Promise from 'bluebird';
import bcrypt from 'bcrypt';

let hash = (password, salt) => {
  salt = salt || 10
  return new Promise(function (resolve, reject) {
    bcrypt.hash(password, salt, function (err, hash) {
      if (err) return reject(err)
      resolve(hash)
    })
  })
}

let compare = (expected, hash) => {
  return new Promise(function (resolve, reject) {
    bcrypt.compare(expected, hash, function (err, res) {
      if (err) return reject(err)
      resolve(res)
    })
  })
}

const bcryptPromise = Promise.promisifyAll(bcrypt)

export default function(sequelize, DataTypes) {
  let User = sequelize.define('User', {
    email: {
      type: DataTypes.STRING,
      unique: true,
      validate: {
        isEmail: true,
        isLowercase: true
      }
    },
    password: DataTypes.STRING
  }, {
    underscored: true,
    tableName: 'users',
    instanceMethods: {
      verifyPassword: function(password) {
        return compare(password, this.password)
      }
    }
  })
  let hashPassword = async (user, options) => {
    return hash(user.password, 8).then((res) => {
      user.password = res;
    })
  }
  User.beforeCreate(hashPassword);
  User.beforeUpdate(hashPassword);

  return User;
}