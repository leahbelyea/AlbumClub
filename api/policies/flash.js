module.exports = function(req, res, next) {
  res.locals.flash = {};

  if (!req.session.flash) {
    return next();
  }

  flash = _.clone(req.session.flash);
  flash.errMessages = [];
  if (flash.err) {
    if (flash.err.invalidAttributes) {
      for (var field in flash.err.invalidAttributes) {
        var message = field + ': ' + flash.err.invalidAttributes[field][0]['message'];
        if (flash.err.invalidAttributes[field][0]['rule'] == 'email') {
          message = field + " must be a valid email";
        }
        else if (flash.err.invalidAttributes[field][0]['rule'] == 'required') {
          message = field + " is required";
        }
        else if (flash.err.invalidAttributes[field][0]['rule'] == 'date') {
          message = field + " must be a valid date";
        }
        flash.errMessages.push(message);
      }
    }
    else if (typeof flash.err === 'object') {
      Object.keys(flash.err).forEach(function(error) {
        var message = JSON.stringify(flash.err[error]);
        message = message.substring(1, message.length-1);
        flash.errMessages.push(message);
      });
    }
    else {
      var message = JSON.stringify(flash.err);
      message = message.substring(1, message.length-1);
      flash.errMessages.push(message);
    }
  }

  res.locals.flash = flash;
  req.session.flash = {};
  next();
}