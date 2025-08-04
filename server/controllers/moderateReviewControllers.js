// controllers/moderateReviewControllers.js
const knex = require('../db/knex');
const aiSuggestionsService = require('../services/aiSuggestions');

/**
 * Get the baseline stats for growth calculation using player snapshots
 * @param {Object} trx - Knex transaction object
 * @param {number} playerId - The player ID
 * @param {number} matchId - The current match ID
 * @returns {Object} Baseline stats to use for growth calculation
 */
const getBaselineStatsFromSnapshots = async (trx, playerId, matchId) => {
  try {
    // Get the current match date
    const currentMatch = await trx('matches')
      .where({ id: matchId })
      .first();
    
    if (!currentMatch) {
      throw new Error(`Match with ID ${matchId} not found`);
    }

    // Find the most recent snapshot BEFORE this match's date
    const previousSnapshot = await trx('player_snapshots')
      .join('matches', 'player_snapshots.match_id', 'matches.id')
      .where('player_snapshots.player_id', playerId)
      .whereNotNull('player_snapshots.match_id') // Use whereNotNull instead of != null
      .where('matches.match_date', '<', currentMatch.match_date)
      .orderBy('matches.match_date', 'desc')
      .select('player_snapshots.*')
      .first();

    if (previousSnapshot) {
      console.log(`📊 Using previous snapshot from match ${previousSnapshot.match_id} as baseline for player ${playerId}`);
      return {
        shooting: previousSnapshot.shooting,
        passing: previousSnapshot.passing,
        dribbling: previousSnapshot.dribbling,
        defense: previousSnapshot.defense,
        physical: previousSnapshot.physical,
        coach_grade: previousSnapshot.coach_grade
      };
    }

    // Fall back to the initial snapshot (match_id IS NULL)
    const initialSnapshot = await trx('player_snapshots')
      .where({ player_id: playerId, match_id: null })
      .first();

    if (initialSnapshot) {
      console.log(`📊 Using initial snapshot as baseline for player ${playerId} (no previous matches)`);
      return {
        shooting: initialSnapshot.shooting,
        passing: initialSnapshot.passing,
        dribbling: initialSnapshot.dribbling,
        defense: initialSnapshot.defense,
        physical: initialSnapshot.physical,
        coach_grade: initialSnapshot.coach_grade
      };
    }

    // Fallback to default baseline if no snapshots exist
    console.log(`⚠️ No snapshots found for player ${playerId}, using default baseline (all stats = 50)`);
    return {
      shooting: 50,
      passing: 50,
      dribbling: 50,
      defense: 50,
      physical: 50,
      coach_grade: 50
    };

  } catch (error) {
    console.error('Error getting baseline stats from snapshots:', error);
    // Fallback to default baseline
    return {
      shooting: 50,
      passing: 50,
      dribbling: 50,
      defense: 50,
      physical: 50,
      coach_grade: 50
    };
  }
};
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
      coach_rating = 50,
      feedback = null
    } = req.body;

    if (!player_id || !match_id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Player ID and Match ID are required' 
      });
    }

    // Get current player stats for reference
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

    // Get baseline stats from snapshots for proper growth calculation
    const baselineStats = await getBaselineStatsFromSnapshots(trx, player_id, match_id);

    // Create or update moderate_review record
    const matchStats = {
      goals,
      assists,
      saves,
      tackles,
      interceptions,
      chances_created,
      minutes_played,
      coach_rating,
      feedback
    };

    const existingReview = await trx('moderate_reviews')
      .where({ player_id, match_id })
      .first();

    let reviewId;
    let shouldGenerateAI = false;
    
    if (existingReview) {
      // Check if we should generate AI suggestions
      shouldGenerateAI = feedback && 
                        feedback.trim().length > 0 && 
                        !existingReview.ai_suggestions;
      
      // Update existing review
      await trx('moderate_reviews')
        .where({ player_id, match_id })
        .update({
          ...matchStats,
          updated_at: knex.fn.now()
        });
      reviewId = existingReview.id;
    } else {
      // Check if we should generate AI suggestions for new review
      shouldGenerateAI = feedback && feedback.trim().length > 0;
      
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

    // Calculate new player attributes using baseline stats from snapshots
    const newAttributes = calculateAttributeUpdates(baselineStats, matchStats);

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

    // Generate AI suggestions if feedback was provided
    let aiSuggestions = null;
    if (shouldGenerateAI) {
      try {
        console.log('🤖 Generating AI suggestions for player feedback...');
        
        // Get player name and position for personalized suggestions
        const playerName = currentPlayer.name || `Player ${currentPlayer.id}`;
        const playerPosition = currentPlayer.position || 'unknown';
        
        // Generate AI suggestions
        aiSuggestions = await aiSuggestionsService.generatePlayerSuggestions(
          feedback,
          matchStats,
          playerName,
          playerPosition
        );

        if (aiSuggestions) {
          // Update the moderate_review record with AI suggestions
          await trx('moderate_reviews')
            .where({ id: reviewId })
            .update({
              ai_suggestions: aiSuggestions,
              updated_at: knex.fn.now()
            });
          
          console.log('✅ AI suggestions generated and saved successfully');
        } else {
          console.log('⚠️ AI suggestions generation returned null');
        }
      } catch (aiError) {
        console.error('❌ Error generating AI suggestions:', aiError.message);
        // Don't fail the entire request if AI fails
        // Continue with the transaction
      }
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
          shooting: baselineStats.shooting,
          passing: baselineStats.passing,
          dribbling: baselineStats.dribbling,
          defense: baselineStats.defense,
          physical: baselineStats.physical,
          coach_grade: baselineStats.coach_grade,
          overall_rating: baselineStats.overall_rating || Math.round(
            (baselineStats.shooting * 0.2 + baselineStats.passing * 0.2 + 
             baselineStats.dribbling * 0.15 + baselineStats.defense * 0.2 + 
             baselineStats.physical * 0.15 + baselineStats.coach_grade * 0.1)
          )
        },
        new_attributes: newAttributes,
        growth: {
          shooting: newAttributes.shooting - baselineStats.shooting,
          passing: newAttributes.passing - baselineStats.passing,
          dribbling: newAttributes.dribbling - baselineStats.dribbling,
          defense: newAttributes.defense - baselineStats.defense,
          physical: newAttributes.physical - baselineStats.physical,
          coach_grade: newAttributes.coach_grade - baselineStats.coach_grade,
          overall_rating: newAttributes.overall_rating - (baselineStats.overall_rating || Math.round(
            (baselineStats.shooting * 0.2 + baselineStats.passing * 0.2 + 
             baselineStats.dribbling * 0.15 + baselineStats.defense * 0.2 + 
             baselineStats.physical * 0.15 + baselineStats.coach_grade * 0.1)
          ))
        },
        feedback: feedback || null,
        ai_suggestions: aiSuggestions || null
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

/**
 * Test AI suggestions service
 * GET /api/reviews/test-ai
 */
const testAISuggestions = async (req, res) => {
  try {
    const result = await aiSuggestionsService.testService();
    
    res.status(200).json({
      success: true,
      message: 'AI suggestions test completed',
      test_result: result,
      api_available: aiSuggestionsService.isAvailable()
    });
  } catch (error) {
    console.error('❌ Error testing AI suggestions service:', error);
    res.status(500).json({ 
      success: false, 
      message: 'AI suggestions test failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Update player's reflection for a specific match
 * PATCH /api/reviews/player/:playerId/match/:matchId/reflection
 */
const updatePlayerReflection = async (req, res) => {
  try {
    const { playerId, matchId } = req.params;
    const { reflection } = req.body;

    if (!playerId || !matchId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Player ID and Match ID are required' 
      });
    }

    if (typeof reflection !== 'string') {
      return res.status(400).json({ 
        success: false, 
        message: 'Reflection must be a string' 
      });
    }

    // Check if a moderate_review record exists for this player and match
    const existingReview = await knex('moderate_reviews')
      .where({ player_id: playerId, match_id: matchId })
      .first();

    if (!existingReview) {
      return res.status(404).json({ 
        success: false, 
        message: 'No match record found for this player and match' 
      });
    }

    // Update the reflection field
    await knex('moderate_reviews')
      .where({ player_id: playerId, match_id: matchId })
      .update({ 
        reflection: reflection.trim(),
        updated_at: knex.fn.now()
      });

    res.status(200).json({
      success: true,
      message: 'Reflection updated successfully'
    });

  } catch (error) {
    console.error('❌ Error updating player reflection:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update reflection',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  submitPlayerMatchStats,
  getPlayerGrowthHistory,
  getPlayerMatchStats,
  getMatchReviews,
  testAISuggestions,
  updatePlayerReflection,
  calculateAttributeUpdates // Export for testing
};
