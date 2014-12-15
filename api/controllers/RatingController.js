/**
 * RatingController
 *
 * @description :: Server-side logic for managing ratings
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {

  create: function(req, res) {
    Recommendation.findOne(req.params.all()['recommendation'], function foundRecommendation(err, recommendation) {
      if (err) {
        req.session.flash = {
           err: err,
        }
        return res.redirect('/recommendation/view/' + req.params.all()['recommendation']);
      }

      if (!recommendation) {
        req.session.flash = {
          err: {
            message: 'Recommendation does not exist',
          },
        };
        return res.redirect('/recommendation/view/' + req.params.all()['recommendation']);
      }

      Group.findOne(recommendation.group).populateAll().exec(function foundGroup(err, group) {
        if (err) {
          req.session.flash = {
             err: err,
          }
          return res.redirect('/recommendation/view/' + req.params.all()['recommendation']);
        }

        if (!group) {
          req.session.flash = {
            err: {
              message: 'Group does not exist',
            },
          };
          return res.redirect('/recommendation/view/' + req.params.all()['recommendation']);
        }

        if (!group.hasMember(req.session.user.id)) {
          req.session.flash = {
            err: {
              message: 'You must join this group before rating an album',
            },
          };
          return res.redirect('/group/view/' + group.id);
        }

        Rating.findOne({recommendation: recommendation.id, rater: req.session.user.id}, function(err, rating){
          if (err) {
            req.session.flash = {
               err: err,
            }
            return res.redirect('/group/view/' + group.id);
          }

          if (rating) {
            req.session.flash = {
              err: {
                message: 'You have already rated this recommendation',
              },
            };
            return res.redirect('/recommendation/view/' + recommendation.id);
          }

          params = req.params.all();
          params['rater'] = req.session.user.id;
          Rating.create(params, function ratingCreated(err, rating) {
            if(err) {
              req.session.flash = {
                 err: err,
              }
              return res.redirect('/recommendation/view/' + params['recommendation']);
            }

            res.redirect('/recommendation/view/' + params['recommendation']);
          });
        });
      });
    });
  },
};

