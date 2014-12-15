module.exports = {

  search: function(searchTerm, cb) {
    query = {
      'media': 'music',
      'entity': 'album',
      'term': searchTerm,
    }
    var querystring = require('querystring');
    var query = querystring.stringify(query);

    var https = require('https');

    return https.get('https://itunes.apple.com/search?' + query, function(result) {

      var body = '';
      result.on('data', function(d) {
        body += d;
      });

      result.on('end', function() {
        cb(JSON.parse(body).results);
      });

    }).on('error', function(e) {
      cb(undefined);
    });
  },

  get: function(id, cb) {
    query = {
      'id': id,
    }
    var querystring = require('querystring');
    var query = querystring.stringify(query);

    var https = require('https');

    https.get('https://itunes.apple.com/lookup?' + query, function(result) {

      var body = '';
      result.on('data', function(d) {
        body += d;
      });

      result.on('end', function() {
        cb(JSON.parse(body).results[0]);
      });

    }).on('error', function(e) {
      cb(undefined);
    });
  }

}