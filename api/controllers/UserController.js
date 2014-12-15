/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
  landing: function(req, res) {
    if (req.session.authenticated) {
      res.redirect('/user/profile/' + req.session.user.id);
    }
    res.view();
  },

  new: function(req, res) {
    res.view();
  },

  list: function(req, res) {
    User.find(function foundGroup(err, users) {
      if (err) {
        req.session.flash = {
           err: err,
        }
        return res.redirect('/user/profile/' + req.session.user.id);
      }

      res.view({
        users: users,
      });
    });
  },

  create: function(req, res) {
    User.create(req.params.all(), function userCreated(err, user) {
      if(err) {
        req.session.flash = {
           err: err,
        }
        return res.redirect('/user/new');
      }
      req.session.authenticated = true;
      req.session.user = user;
      res.redirect('/user/profile/' + user.id);
    });
  },

  edit: function(req, res) {
    User.findOne(req.param('id'), function foundUser(err, user) {
      if (err) {
        req.session.flash = {
           err: err,
        }
        return res.redirect('/user/profile/' + req.param('id'));
      }

      res.view({
        user: user,
      });
    });
  },

  update: function(req, res) {
    User.findOne(req.param('id'), function foundUser(err, user) {
      if (err) {
        req.session.flash = {
           err: err,
        }
        return res.redirect('/user/new');
      }

      if (!user) {
        req.session.flash = {
          err: {
            message: 'User does not exist',
          },
        };
        return res.redirect('/user/profile/' + req.session.user.id);
      }

      if (user.id != req.session.user.id) {
        req.session.flash = {
          err: {
            message: 'You cannot edit another user\'s profile',
          },
        };
        return res.redirect('/user/profile/' + req.session.user.id);
      }

      User.update(req.param('id'), req.params.all(), function userUpdated(err) {
        if(err) {
          req.session.flash = {
             err: err,
          }
          return res.redirect('/user/edit/' + req.param('id'));
        }

        res.redirect('/user/profile/' + req.param('id'));
      });
    });
  },

  profile: function(req, res) {
    User.findOne(req.param('id')).populateAll().exec(function foundUser(err, user) {
      if (err) {
        req.session.flash = {
           err: err,
        }
        return res.redirect('/user/new');
      }

      var after = _.after(user.recommendations.length + 1, function() {
        res.view({
          user: user,
        });
      });

      _.each(user.recommendations, function(recommendation) {
        var album = require('../services/album');
        album.get(recommendation.albumItunesId, function(result) {
          recommendation.albumInfo = {
            name: result.collectionName,
            artist: result.artistName,
            thumbnailUrl: result.artworkUrl100,
          };
          after();
        });
      });
      after();
    });
  },

};

