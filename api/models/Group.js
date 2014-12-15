/**
* Group.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {

    name: {
      type: 'string',
      required: true,
      unique: true,
    },

    admin :{
      model: 'user'
    },

    description: {
      type: 'text',
      required: true,
    },

    members: {
      collection: 'user',
      via: 'groups',
      dominant: true,
    },

    recommendations: {
      collection: 'recommendation',
      via: 'group',
    },

    toJSON: function() {
      var obj = this.toObject();
      delete obj.createdAt;
      delete obj.updatedAt;
      return obj;
    },

    hasMember: function(userId) {
      var member = _.find(this.members, function(member) {
        return userId == member.id;
      });
      return !(member == undefined);
    },

  },

};

