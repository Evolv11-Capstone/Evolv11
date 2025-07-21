// models/ModerateReview.js
const knex = require('../db/knex');

class ModerateReview {
  static async getSummaryForPlayer(playerId) {
    const result = await knex('moderate_reviews')
      .where({ player_id: playerId })
      .sum({
        goals: 'goals',
        assists: 'assists',
        saves: 'saves',
        tackles: 'tackles',
        interceptions: 'interceptions',
        chances_created: 'chances_created',
        minutes_played: 'minutes_played',
        coach_rating: 'coach_rating',
      })
      .first();

    return result || {
      goals: 0,
      assists: 0,
      saves: 0,
      tackles: 0,
      interceptions: 0,
      chances_created: 0,
      minutes_played: 0,
      coach_rating: 0,
    };
  }
}

module.exports = ModerateReview;
