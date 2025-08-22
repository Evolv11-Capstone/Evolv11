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
        // Goalkeeper-specific stats
        successful_goalie_kicks: 'successful_goalie_kicks',
        failed_goalie_kicks: 'failed_goalie_kicks',
        successful_goalie_throws: 'successful_goalie_throws',
        failed_goalie_throws: 'failed_goalie_throws',
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
      successful_goalie_kicks: 0,
      failed_goalie_kicks: 0,
      successful_goalie_throws: 0,
      failed_goalie_throws: 0,
    };
  }

  static async getAiGradeSummaryForPlayer(playerId) {
    const result = await knex('moderate_reviews')
      .where({ player_id: playerId })
      .whereNotNull('ai_rating')
      .select(
        knex.raw('AVG(ai_rating) as average_grade'),
        knex.raw('COUNT(*) as total_reviews'),
        knex.raw('MAX(ai_rating) as highest_grade'),
        knex.raw('MIN(ai_rating) as lowest_grade')
      )
      .first();

    if (!result || result.total_reviews === 0) {
      return {
        average_grade: null,
        total_reviews: 0,
        highest_grade: null,
        lowest_grade: null
      };
    }

    return {
      average_grade: Math.round(result.average_grade),
      total_reviews: parseInt(result.total_reviews),
      highest_grade: result.highest_grade,
      lowest_grade: result.lowest_grade
    };
  }
}

module.exports = ModerateReview;
