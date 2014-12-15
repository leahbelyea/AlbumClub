/**
* Recommendation.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {

    user: {
      model: 'user'
    },

    group: {
      model: 'group'
    },

    albumItunesId: {
      type: 'integer',
      required: true,
    },

    comments: {
      collection: 'comment',
      via: 'recommendation',
    },

    ratings: {
      collection: 'rating',
      via: 'recommendation',
    },

    getAverageRating: function() {
      ratingSum = 0;
      numRatings = 0;
      _.each(this.ratings, function(rating) {
        ratingSum = ratingSum + rating.ratingValue;
        numRatings = numRatings + 1;
      })
      if (numRatings == 0) {
        return 0;
      }
      return Math.round(ratingSum/numRatings);
    }

  }

};

