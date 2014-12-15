/**
 * GroupController
 *
 * @description :: Server-side logic for managing Groups
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {

  new: function(req, res) {
    res.view();
  },

  create: function(req, res) {
    params = req.params.all();
    params['admin'] = req.session.user.id;
    Group.create(params, function groupCreated(err, group) {
      if(err) {
        req.session.flash = {
           err: err,
        }
        return res.redirect('/group/new');
      }
      // Add admin to group
      group.members.add(req.session.user.id);
      group.save(function(err) {
        if (err) {
            req.session.flash = {
            err: err,
          }
          return res.redirect('/group/new');
        }
        res.redirect('/group/view/' + group.id);
      });
    });
  },

  view: function(req, res) {
    Group.findOne(req.param('id')).populateAll().exec(function foundGroup(err, group) {
      if (err) {
        req.session.flash = {
           err: err,
        }
        return res.redirect('/group/list');
      }

      var after = _.after(group.recommendations.length + 1, function() {
        res.view({
          group: group,
          userIsMember: group.hasMember(req.session.user.id),
        });
      });

      _.each(group.recommendations, function(recommendation) {
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

  list: function(req, res) {
    Group.find().populateAll().exec(function foundGroup(err, groups) {
      if (err) {
        req.session.flash = {
           err: err,
        }
        return res.redirect('/user/profile/' + req.session.user.id);
      }

      res.view({
        groups: groups,
      });
    });
  },

  edit: function(req, res) {
    Group.findOne(req.param('id'), function foundGroup(err, group) {
      if (err) {
        req.session.flash = {
           err: err,
        }
        return res.redirect('/group/view/' + req.param('id'));
      }

      res.view({
        group: group,
      });
    });
  },

  update: function(req, res) {
    Group.findOne(req.param('id'), function foundGroup(err, group) {
      if (err) {
        req.session.flash = {
           err: err,
        }
        return res.redirect('/group/view/' + req.param('id'));
      }

      if (!group) {
        req.session.flash = {
          err: {
            message: 'Group does not exist',
          },
        };
        return res.redirect('/group/view/' + req.param('id'));
      }

      if (group.admin != req.session.user.id) {
        req.session.flash = {
          err: {
            message: 'You are not the group admin and cannot edit this group',
          },
        };
        return res.redirect('/group/edit/' + req.param('id'));
      }

      Group.update(req.param('id'), req.params.all(), function groupUpdated(err) {

        if(err) {
          req.session.flash = {
             err: err,
          }
          return res.redirect('/group/edit/' + req.param('id'));
        }

        res.redirect('/group/view/' + req.param('id'));
      });
    });
  },

  join: function(req, res) {
    Group.findOne(req.param('id')).populateAll().exec(function foundGroup(err, group) {
      if (err) {
        req.session.flash = {
           err: err,
        }
        return res.redirect('/group/view/' + req.param('id'));
      }

      if (group.hasMember(req.session.user.id)) {
        req.session.flash = {
          err: {
            message: 'User already belongs to group',
          },
        };
        res.redirect('/group/view/' + group.id);
      }
      else {
        group.members.add(req.session.user.id);
        group.save(function(err) {
          if (err) {
            req.session.flash = {
              err: err,
            }
            return res.redirect('/group/edit/' + group.id);
          }
          res.redirect('/group/view/' + group.id);
        });
      }
    });
  },

  leave: function(req, res) {
    Group.findOne(req.param('id')).populateAll().exec(function foundGroup(err, group) {
      if (err) {
        req.session.flash = {
           err: err,
        }
        return res.redirect('/group/view/' + req.param('id'));
      }

      if (group.hasMember(req.session.user.id)) {
        group.members.remove(req.session.user.id);
        group.save(function(err) {
          if (err) {
              req.session.flash = {
              err: err,
            }
            return res.redirect('/group/edit/' + group.id);
          }
          res.redirect('/group/view/' + group.id);
        });
      }
      else {
        req.session.flash = {
          err: {
            message: 'User does not belong group',
          },
        };
        res.redirect('/group/view/' + group.id);
      }
    });
  },

  recommend: function(req, res) {
    Group.findOne(req.param('id'), function foundGroup(err, group) {
      if (err) {
        req.session.flash = {
           err: err,
        }
        return res.redirect('/group/view/' + req.param('id'));
      }

      if (!group) {
        req.session.flash = {
          err: {
            message: 'Group does not exist',
          },
        };
        return res.redirect('/group/view/' + req.param('id'));
      }

      var searchTerm = req.params.all()['searchTerm'];

      if (searchTerm == undefined) {
        res.view({
          searchPerformed: false,
          group: group,
        });
      }
      else {
        var album = require('../services/album');
        album.search(searchTerm, function(results) {
          if (results == undefined) {
            req.session.flash = {
              err: {
                message: 'Search failed. Please try again later.',
              },
            };
            res.redirect('/group/recommend/' + req.param('id'));
          }
          else {
            res.view({
              searchPerformed: true,
              group: group,
              searchTerm: searchTerm,
              results: results,
            });
          }
        });
      }
    });
  },
};
