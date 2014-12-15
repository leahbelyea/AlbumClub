/**
 * RecommendationController
 *
 * @description :: Server-side logic for managing recommendations
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {

  view: function(req, res) {
    Recommendation.findOne(req.param('id')).populateAll().exec(function foundRecommendation(err, recommendation) {
      if (err) {
        req.session.flash = {
           err: err,
        }
        return res.redirect('/user/profile/' + req.session.user.id);
      }

      if (!recommendation) {
        req.session.flash = {
          err: {
            message: 'Recommendation does not exist',
          },
        };
        return res.redirect('/user/profile/' + req.session.user.id);
      }

      var album = require('../services/album');
      album.get(recommendation.albumItunesId, function(result) {
        recommendation.albumInfo = {
          name: result.collectionName,
          artist: result.artistName,
          thumbnailUrl: result.artworkUrl100,
        };

        var after = _.after(recommendation.comments.length + 1, function() {

          Group.findOne(recommendation.group.id).populateAll().exec(function foundGroup(err, group) {
            if (err) {
              req.session.flash = {
                 err: err,
              }
              return res.redirect('/group/view/' + recommendation.group.id);
            }

            userInGroup = false;
            if (group) {
              userInGroup = group.hasMember(req.session.user.id);
            }

            Rating.findOne({recommendation: recommendation.id, rater: req.session.user.id}, function(err, rating){
              if (err) {
                req.session.flash = {
                   err: err,
                }
                return res.redirect('/group/view/' + recommendation.group.id);
              }

              res.view({
                recommendation: recommendation,
                averageRating: recommendation.getAverageRating(),
                userRating: rating ? rating.ratingValue : null,
                userInGroup: userInGroup,
              });

            });
          });
        });

        var commentIndices = [];
        for (i=0; i<recommendation.comments.length; i++) {
          commentIndices.push(i);
        }
        _.each(commentIndices, function(index) {
          Comment.findOne(recommendation.comments[index].id).populateAll().exec(function foundComment(err, populated_comment) {
            if (err) {
              req.session.flash = {
                 err: err,
              }
              return res.redirect('/group/view/' + recommendation.group.id);
            }
            recommendation.comments[index] = populated_comment;
            after();
          });
        });
        after();
      });
    });
  },

  create: function(req, res) {
    Group.findOne(req.params.all()['group']).populateAll().exec(function foundGroup(err, group) {
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

      if (!group.hasMember(req.session.user.id)) {
        req.session.flash = {
          err: {
            message: 'You must join this group before recommending an album',
          },
        };
        return res.redirect('/group/view/' + group.id);
      }

      params = req.params.all();
      params['user'] = req.session.user.id;
      Recommendation.create(params, function recommendationCreated(err, user) {
        if(err) {
          req.session.flash = {
             err: err,
          }
          return res.redirect('/group/view/' + params['group']);
        }

        res.redirect('/group/view/' + params['group']);
      });
    });
  },

  comment: function(req, res) {
    Recommendation.findOne(req.param('id')).populateAll().exec(function foundRecommendation(err, recommendation) {
      if (err) {
        req.session.flash = {
           err: err,
        }
        return res.redirect('/recommendation/view/' + req.param('id'));
      }

      if (!recommendation) {
        req.session.flash = {
          err: {
            message: 'Recommendation does not exist',
          },
        };
        return res.redirect('/recommendation/view/' + req.param('id'));
      }

      var album = require('../services/album');
      album.get(recommendation.albumItunesId, function(result) {
        recommendation.albumInfo = {
          name: result.collectionName,
          artist: result.artistName,
          thumbnailUrl: result.artworkUrl100,
        };

        res.view({
          recommendation: recommendation,
        });

      });
    });
  },

  rate: function(req, res) {
    Recommendation.findOne(req.param('id')).populateAll().exec(function foundRecommendation(err, recommendation) {
      if (err) {
        req.session.flash = {
           err: err,
        }
        return res.redirect('/recommendation/view/' + req.param('id'));
      }

      if (!recommendation) {
        req.session.flash = {
          err: {
            message: 'Recommendation does not exist',
          },
        };
        return res.redirect('/recommendation/view/' + req.param('id'));
      }

      var album = require('../services/album');
      album.get(recommendation.albumItunesId, function(result) {
        recommendation.albumInfo = {
          name: result.collectionName,
          artist: result.artistName,
          thumbnailUrl: result.artworkUrl100,
        };

        res.view({
          recommendation: recommendation,
        });

      });
    });
  }
};

