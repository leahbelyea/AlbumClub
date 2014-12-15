/**
* User.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {

    email: {
      type: 'string',
      email: true,
      unique: true,
      required: true,
    },

    firstName: {
      type: 'string',
      required: true,
    },

    lastName: {
      type: 'string',
      required: true,
    },

    dateOfBirth: {
      type: 'date',
      required: true,
    },

    encryptedPassword: {
      type: 'string',
    },

    bio: {
      type: 'text',
    },

    groupsOwned: {
      collection: 'group',
      via: 'admin',
    },

    groups: {
      collection: 'group',
      via: 'members',
    },

    recommendations: {
      collection: 'recommendation',
      via: 'user',
    },

    toJSON: function() {
      var obj = this.toObject();
      delete obj.encryptedPassword;
      delete obj.createdAt;
      delete obj.updatedAt;
      return obj;
    },

    getDobString: function() {
      var calendarMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      var day = this.dateOfBirth.getDate();
      var month = calendarMonths[this.dateOfBirth.getMonth()];
      var year = this.dateOfBirth.getFullYear();
      return month + ' ' + day + ', ' + year;
    }

  },

  beforeCreate: function(values, cb) {
    var err = User.validatePassword(values.password, values.passwordConfirm);

    if (!_.isEmpty(err)) {
      cb(err);
    }

    values.encryptedPassword = User.encryptPassword(values.password);
    cb();
  },

  beforeUpdate: function(values, cb) {
    if (!values.password && !values.passwordConfirm) {
      cb();
    }
    else {
      var err = User.validatePassword(values.password, values.passwordConfirm);

      if (!_.isEmpty(err)) {
        cb(err);
      }

      values.encryptedPassword = User.encryptPassword(values.password);
      cb();
    }
  },
  
  validatePassword: function(password, passwordConfirm) {
      var err = {};

      if (password != passwordConfirm) {
        err['no match'] = 'Passwords do not match, please try again.';
      }

      if (password.length < 8) {
        err['too short'] = 'Password must be at least 8 characters.';
      }

      return err;
  },

  encryptPassword: function(password) {
      var sha1 = require('sha1');
      return sha1(password);
  }

};

