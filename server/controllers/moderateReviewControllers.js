// controllers/moderateReviewControllers.js
const knex = require('../db/knex');

/**
 * Calculate new player attributes based on match performance
 * Uses weighted formulas to update player stats based on their performance
 */
const calculateAttributeUpdates = (currentStats, matchStats) => {
  const {
    goals = 0,
    assists = 0,
    saves = 0,
    tackles = 0,
    interceptions = 0,
    chances_created = 0,
    minutes_played = 0,
    coach_rating = 50
  } = matchStats;

  const {
    shooting = 50,
    passing = 50,
    dribbling = 50,
    defense = 50,
    physical = 50,
    coach_grade = 50
  } = currentStats;

  // Calculate growth/decline based on performance with baseline expectations
  // Positive growth for good performance, negative for poor performance
  const baselinePenalty = -1.0; // Increased penalty for not meeting expectations
  const severePenalty = -2.5; // Severe penalty for really poor performance
  
  const shootingGrowth = ((goals * 2.0 + chances_created * 0.8) * 0.2) + 
    (goals === 0 && minutes_played > 45 ? baselinePenalty : 0); // Penalty for strikers/forwards with no goals
  
  const passingGrowth = ((assists * 1.8 + chances_created * 1.2) * 0.2) + 
    (assists === 0 && chances_created === 0 && minutes_played > 45 ? baselinePenalty : 0); // Penalty for no creative contribution
  
  const dribblingGrowth = ((goals * 0.5 + assists * 0.5 + chances_created * 0.8) * 0.2) + 
    (goals === 0 && assists === 0 && chances_created === 0 && minutes_played > 30 ? baselinePenalty : 0);
  
  const defenseGrowth = ((tackles * 2.0 + interceptions * 2.0 + saves * 2.5) * 0.2) + 
    (tackles === 0 && interceptions === 0 && saves === 0 && minutes_played > 45 ? baselinePenalty : 0); // Penalty for inactive defense
  
  // Physical decline for lack of playing time, improvement for full matches
  const physicalGrowth = (minutes_played / 90) * 1.0 - (minutes_played < 30 ? 1.5 : 0); // Significant decline if under 30 mins
  
  // Apply growth/decline with realistic constraints
  const applyGrowth = (current, growth) => {
    if (growth >= 0) {
      // Positive growth with diminishing returns for high stats
      const diminishingFactor = Math.max(0.1, (100 - current) / 100);
      return Math.min(100, current + (growth * diminishingFactor));
    } else {
      // Negative growth (decline) with less protection to make decline more noticeable
      const declineFactor = Math.max(0.6, current / 100); // Increased decline factor
      return Math.max(10, current + (growth * declineFactor)); // Minimum rating of 10
    }
  };

  const newShooting = Math.round(applyGrowth(shooting, shootingGrowth));
  const newPassing = Math.round(applyGrowth(passing, passingGrowth));
  const newDribbling = Math.round(applyGrowth(dribbling, dribblingGrowth));
  const newDefense = Math.round(applyGrowth(defense, defenseGrowth));
  const newPhysical = Math.round(applyGrowth(physical, physicalGrowth));
  
  // Coach grade with significant positive/negative impact
  const coachGrowth = (coach_rating - coach_grade) * 0.2; // Even more impact
  // Additional penalty for very poor coach ratings
  const coachPenalty = coach_rating < 30 ? -2.0 : (coach_rating < 40 ? -1.0 : 0);
  const newCoachGrade = Math.round(Math.min(100, Math.max(10, coach_grade + coachGrowth + coachPenalty)));
  
  // Calculate overall rating as weighted average
  const newOverall = Math.round(
    (newShooting * 0.2 + newPassing * 0.2 + newDribbling * 0.15 + 
     newDefense * 0.2 + newPhysical * 0.15 + newCoachGrade * 0.1)
  );

  return {
    shooting: newShooting,
    passing: newPassing,
    dribbling: newDribbling,
    defense: newDefense,
    physical: newPhysical,
    coach_grade: newCoachGrade,
    overall_rating: newOverall
  };
};

/**
 * Submit or update match stats for a player
 * Creates moderate_review, updates player attributes, and creates snapshot
 */
const submitPlayerMatchStats = async (req, res) => {
  const trx = await knex.transaction();
  
  try {
    const { 
      player_id, 
      match_id, 
      goals = 0,
      assists = 0,
      saves = 0,
      tackles = 0,
      interceptions = 0,
      chances_created = 0,
      minutes_played = 0,
      coach_rating = 50
    } = req.body;

    if (!player_id || !match_id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Player ID and Match ID are required' 
      });
    }

    // Get current player stats
    const currentPlayer = await trx('players')
      .where({ id: player_id })
      .first();

    if (!currentPlayer) {
      await trx.rollback();
      return res.status(404).json({ 
        success: false, 
        message: 'Player not found' 
      });
    }

    // Create or update moderate_review record
    const matchStats = {
      goals,
      assists,
      saves,
      tackles,
      interceptions,
      chances_created,
      minutes_played,
      coach_rating
    };

    const existingReview = await trx('moderate_reviews')
      .where({ player_id, match_id })
      .first();

    let reviewId;
    if (existingReview) {
      // Update existing review
      await trx('moderate_reviews')
        .where({ player_id, match_id })
        .update({
          ...matchStats,
          updated_at: knex.fn.now()
        });
      reviewId = existingReview.id;
    } else {
      // Create new review
      const [newReview] = await trx('moderate_reviews')
        .insert({
          player_id,
          match_id,
          ...matchStats
        })
        .returning('*');
      reviewId = newReview.id;
    }

    // Calculate new player attributes
    const newAttributes = calculateAttributeUpdates(currentPlayer, matchStats);

    // Update player attributes
    await trx('players')
      .where({ id: player_id })
      .update({
        shooting: newAttributes.shooting,
        passing: newAttributes.passing,
        dribbling: newAttributes.dribbling,
        defense: newAttributes.defense,
        physical: newAttributes.physical,
        coach_grade: newAttributes.coach_grade,
        overall_rating: newAttributes.overall_rating,
        updated_at: knex.fn.now()
      });

    // Create snapshot for growth tracking
    const existingSnapshot = await trx('player_snapshots')
      .where({ player_id, match_id })
      .first();

    if (existingSnapshot) {
      // Update existing snapshot
      await trx('player_snapshots')
        .where({ player_id, match_id })
        .update({
          shooting: newAttributes.shooting,
          passing: newAttributes.passing,
          dribbling: newAttributes.dribbling,
          defense: newAttributes.defense,
          physical: newAttributes.physical,
          coach_grade: newAttributes.coach_grade,
          overall_rating: newAttributes.overall_rating
        });
    } else {
      // Create new snapshot
      await trx('player_snapshots')
        .insert({
          player_id,
          match_id,
          shooting: newAttributes.shooting,
          passing: newAttributes.passing,
          dribbling: newAttributes.dribbling,
          defense: newAttributes.defense,
          physical: newAttributes.physical,
          coach_grade: newAttributes.coach_grade,
          overall_rating: newAttributes.overall_rating
        });
    }

    await trx.commit();

    res.status(200).json({
      success: true,
      message: 'Player stats updated successfully',
      data: {
        review_id: reviewId,
        player_id,
        match_id,
        previous_attributes: {
          shooting: currentPlayer.shooting,
          passing: currentPlayer.passing,
          dribbling: currentPlayer.dribbling,
          defense: currentPlayer.defense,
          physical: currentPlayer.physical,
          coach_grade: currentPlayer.coach_grade,
          overall_rating: currentPlayer.overall_rating
        },
        new_attributes: newAttributes,
        growth: {
          shooting: newAttributes.shooting - currentPlayer.shooting,
          passing: newAttributes.passing - currentPlayer.passing,
          dribbling: newAttributes.dribbling - currentPlayer.dribbling,
          defense: newAttributes.defense - currentPlayer.defense,
          physical: newAttributes.physical - currentPlayer.physical,
          coach_grade: newAttributes.coach_grade - currentPlayer.coach_grade,
          overall_rating: newAttributes.overall_rating - currentPlayer.overall_rating
        }
      }
    });

  } catch (error) {
    await trx.rollback();
    console.error('❌ Error submitting player match stats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to submit player stats',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get player's match history and growth data
 */
const getPlayerGrowthHistory = async (req, res) => {
  try {
    const { playerId } = req.params;

    if (!playerId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Player ID is required' 
      });
    }

    // Get all snapshots for the player ordered by match date
    const snapshots = await knex('player_snapshots')
      .join('matches', 'player_snapshots.match_id', 'matches.id')
      .where('player_snapshots.player_id', playerId)
      .select(
        'player_snapshots.*',
        'matches.match_date',
        'matches.opponent'
      )
      .orderBy('matches.match_date', 'asc');

    // Get current player stats
    const currentPlayer = await knex('players')
      .where({ id: playerId })
      .first();

    if (!currentPlayer) {
      return res.status(404).json({ 
        success: false, 
        message: 'Player not found' 
      });
    }

    res.status(200).json({
      success: true,
      data: {
        current_stats: currentPlayer,
        growth_history: snapshots,
        total_matches: snapshots.length
      }
    });

  } catch (error) {
    console.error('❌ Error fetching player growth history:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch player growth history',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get match stats for a specific player and match
 */
const getPlayerMatchStats = async (req, res) => {
  try {
    const { playerId, matchId } = req.params;

    if (!playerId || !matchId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Player ID and Match ID are required' 
      });
    }

    const matchStats = await knex('moderate_reviews')
      .where({ player_id: playerId, match_id: matchId })
      .first();

    if (!matchStats) {
      return res.status(404).json({ 
        success: false, 
        message: 'No stats found for this player and match' 
      });
    }

    res.status(200).json({
      success: true,
      data: matchStats
    });

  } catch (error) {
    console.error('❌ Error fetching player match stats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch player match stats',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get all player reviews for a specific match
 * GET /api/reviews/match/:matchId
 */
const getMatchReviews = async (req, res) => {
  try {
    const { matchId } = req.params;

    if (!matchId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Match ID is required' 
      });
    }

    // Get all reviews for this match with player information
    const matchReviews = await knex('moderate_reviews')
      .join('players', 'moderate_reviews.player_id', 'players.id')
      .join('users', 'players.user_id', 'users.id')
      .where('moderate_reviews.match_id', matchId)
      .select(
        'moderate_reviews.*',
        'users.name as player_name',
        'users.image_url as player_image'
      );

    res.status(200).json({
      success: true,
      data: matchReviews,
      count: matchReviews.length
    });

  } catch (error) {
    console.error('❌ Error fetching match reviews:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch match reviews',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  submitPlayerMatchStats,
  getPlayerGrowthHistory,
  getPlayerMatchStats,
  getMatchReviews,
  calculateAttributeUpdates // Export for testing
};
