/**
 * SessionController
 *
 * @description :: Server-side logic for managing sessions
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	new: function(req, res) {
    res.view();
  },

  create: function(req, res, next) {
    // If no email/password was provided, display error
    if (!req.param('email') || !req.param('password')) {
      req.session.flash = {
        err: {
          message: 'Please enter your email and password',
        },
      };
      return res.redirect('/session/new');;
    }

    // If email does not exist in db, display error
    User.findOneByEmail(req.param('email'), function foundUser(err, user) {
      if (err) {
        req.session.flash = {
           err: err,
        }
        return res.redirect('/session/new');
      }

      if (!user) {
        req.session.flash = {
          err: {
            message: 'The email address ' + req.param('email') + ' was not found.',
          },
        };
        return res.redirect('/session/new');
      }

      // If password is correct, log user in and redirect to profile. Otherwise, display error
      var sha1 = require('sha1');
      if (user.encryptedPassword == sha1(req.param('password'))) {
        // Log user in
        req.session.authenticated = true;
        req.session.user = user;
        res.redirect('/user/profile/' + user.id);
      }
      else {
        req.session.flash = {
          err: {
            message: 'Invalid email and password combination. Please try again.',
          },
        };
        return res.redirect('/session/new');
      }
    });
  },

  destroy: function(req, res) {
    req.session.destroy();
    res.redirect('/user/landing');
  }
};

