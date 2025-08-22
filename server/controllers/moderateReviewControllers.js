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
        coach_grade: previousSnapshot.coach_grade,
        // Goalkeeper attributes
        diving: previousSnapshot.diving,
        handling: previousSnapshot.handling,
        kicking: previousSnapshot.kicking
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
        coach_grade: initialSnapshot.coach_grade,
        // Goalkeeper attributes
        diving: initialSnapshot.diving,
        handling: initialSnapshot.handling,
        kicking: initialSnapshot.kicking
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
      coach_grade: 50,
      // Goalkeeper attributes
      diving: 50,
      handling: 50,
      kicking: 50
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
      coach_grade: 50,
      // Goalkeeper attributes
      diving: 50,
      handling: 50,
      kicking: 50
    };
  }
};
const calculateAttributeUpdates = (currentStats, matchStats, playerPosition = null) => {
  const {
    goals = 0,
    assists = 0,
    saves = 0,
    tackles = 0,
    interceptions = 0,
    chances_created = 0,
    minutes_played = 0,
    coach_rating = 50,
    // Goalkeeper-specific stats
    successful_goalie_kicks = 0,
    failed_goalie_kicks = 0,
    successful_goalie_throws = 0,
    failed_goalie_throws = 0
  } = matchStats;

  const {
    shooting = 50,
    passing = 50,
    dribbling = 50,
    defense = 50,
    physical = 50,
    coach_grade = 50,
    // Goalkeeper-specific attributes
    diving = 50,
    handling = 50,
    kicking = 50
  } = currentStats;

  // --- Tuned penalty magnitudes (softer, but still meaningful)
  const baselinePenalty = -0.6;   // was -1.0
  const severePenalty   = -1.5;   // was -2.5 (kept for future use)

  // --- Tuned growth formulas (same logic/branches; just better weights)
  // Shooting: goals drive most; creation gives smaller lift
  const shootingGrowth =
    ((goals * 3.2 + chances_created * 0.9) * 0.22) +
    (goals === 0 && minutes_played > 45 ? baselinePenalty : 0);

  // Passing: assists+creation weighted a bit higher; encourages chance creation
  const passingGrowth =
    ((assists * 3.0 + chances_created * 1.4) * 0.18) +
    (assists === 0 && chances_created === 0 && minutes_played > 45 ? baselinePenalty : 0);

  // Dribbling: creation-centric with modest goal/assist echo; penalty if totally inactive
  const dribblingGrowth =
    ((goals * 0.8 + assists * 0.7 + chances_created * 1.1) * 0.18) +
    (goals === 0 && assists === 0 && chances_created === 0 && minutes_played > 30 ? baselinePenalty : 0);

  // Defense: interceptions slightly > tackles; saves still counted but reduced (prevents odd boosts)
  const defenseGrowth =
    ((tackles * 2.0 + interceptions * 2.3 + saves * 0.8) * 0.22) +
    (tackles === 0 && interceptions === 0 && saves === 0 && minutes_played > 45 ? baselinePenalty : 0);

  // Physical: reward full games; softer penalty for <30'
  const physicalGrowth = (minutes_played / 90) * 0.8 - (minutes_played < 30 ? 0.8 : 0);

  // --- Same applyGrowth shape; slightly gentler declines
  const applyGrowth = (current, growth) => {
    if (growth >= 0) {
      const diminishingFactor = Math.max(0.1, (100 - current) / 100);
      return Math.min(100, current + (growth * diminishingFactor));
    } else {
      const declineFactor = Math.max(0.5, current / 100); // was 0.6 min -> slightly gentler
      return Math.max(10, current + (growth * declineFactor));
    }
  };

  const newShooting  = Math.round(applyGrowth(shooting,  shootingGrowth));
  const newPassing   = Math.round(applyGrowth(passing,   passingGrowth));
  const newDribbling = Math.round(applyGrowth(dribbling, dribblingGrowth));
  const newDefense   = Math.round(applyGrowth(defense,   defenseGrowth));
  const newPhysical  = Math.round(applyGrowth(physical,  physicalGrowth));

  // Coach grade: still meaningful, less swingy; softer extra penalties
  const coachGrowth  = (coach_rating - coach_grade) * 0.15; // was 0.2
  const coachPenalty = coach_rating < 30 ? -1.5 : (coach_rating < 40 ? -0.7 : 0); // was -2.0 / -1.0
  const newCoachGrade = Math.round(
    Math.min(100, Math.max(10, coach_grade + coachGrowth + coachPenalty))
  );

  // Overall rating: keep your same weights, slightly rebalanced toward defense/physical
  const newOverall = Math.round(
    (newShooting * 0.18 + newPassing * 0.20 + newDribbling * 0.14 +
     newDefense * 0.22 + newPhysical * 0.16 + newCoachGrade * 0.10)
  );

  // --- Goalkeeper branch (same logic, tuned weights/expectations)
  let newDiving = diving;
  let newHandling = handling;
  let newKicking = kicking;

  if (playerPosition === 'GK') {
    // Diving: reward saves, but don't hammer keepers for quiet games
    const divingGrowth =
      (saves * 1.8) * 0.4 +
      (saves === 0 && minutes_played > 45 ? -0.6 : 0); // was -1.5
    newDiving = Math.round(applyGrowth(diving, divingGrowth));

    // Kicking: expectation ~75% success; volume still helps a bit
    const totalKicks = successful_goalie_kicks + failed_goalie_kicks;
    const kickSuccessRate = totalKicks > 0 ? successful_goalie_kicks / totalKicks : 0.75;
    const kickingGrowth = totalKicks > 0
      ? ((kickSuccessRate - 0.75) * 12) + (totalKicks * 0.06)
      : (minutes_played > 45 ? -0.5 : 0); // was -1.0
    newKicking = Math.round(applyGrowth(kicking, kickingGrowth));

    // Handling: expectation ~85% success; volume slight boost
    const totalThrows = successful_goalie_throws + failed_goalie_throws;
    const throwSuccessRate = totalThrows > 0 ? successful_goalie_throws / totalThrows : 0.85;
    const handlingGrowth = totalThrows > 0
      ? ((throwSuccessRate - 0.85) * 10) + (totalThrows * 0.05)
      : (minutes_played > 45 ? -0.5 : 0); // was -1.0
    newHandling = Math.round(applyGrowth(handling, handlingGrowth));

    // (Keep your log lines as-is if you want)
    // console.log(`🥅 GK Attribute Updates: Diving ${diving}→${newDiving}, Handling ${handling}→${newHandling}, Kicking ${kicking}→${newKicking}`);
  }

  return {
    shooting: newShooting,
    passing: newPassing,
    dribbling: newDribbling,
    defense: newDefense,
    physical: newPhysical,
    coach_grade: newCoachGrade,
    overall_rating: newOverall,
    // Goalkeeper-specific attributes
    diving: newDiving,
    handling: newHandling,
    kicking: newKicking
  };
};


/**
 * Recalculate all player snapshots that occur after the given match chronologically
 * @param {Object} trx - Knex transaction object
 * @param {number} playerId - The player ID
 * @param {number} currentMatchId - The match ID that was just updated
 * @param {Object} currentMatchAttributes - The new attributes from the current match
 * @returns {Object} Final attributes after all recalculations
 */
const recalculateSubsequentSnapshots = async (trx, playerId, currentMatchId, currentMatchAttributes) => {
  try {
    console.log(`🔄 Starting chain recalculation for player ${playerId} after match ${currentMatchId}`);

    // 1) Player and position context
    const player = await trx('players').where({ id: playerId }).first();
    const playerPosition = player?.position || null;

    // 2) Current match (anchor)
    const currentMatch = await trx('matches').where({ id: currentMatchId }).first();
    if (!currentMatch) {
      console.log(`⚠️ Current match ${currentMatchId} not found, skipping chain recalculation`);
      return currentMatchAttributes;
    }

    // 3) Fetch all future reviews in a deterministic order (date, then match_id)
    const futureMatchReviews = await trx('moderate_reviews')
      .join('matches', 'moderate_reviews.match_id', 'matches.id')
      .where('moderate_reviews.player_id', playerId)
      .where('matches.match_date', '>', currentMatch.match_date)
      .select('moderate_reviews.*', 'matches.match_date')
      .orderBy([{ column: 'matches.match_date', order: 'asc' }, { column: 'moderate_reviews.match_id', order: 'asc' }]);

    if (futureMatchReviews.length === 0) {
      console.log(`✅ No future matches found for player ${playerId}, chain recalculation complete`);
      await trx('players')
        .where({ id: playerId })
        .update({
          shooting:       currentMatchAttributes.shooting,
          passing:        currentMatchAttributes.passing,
          dribbling:      currentMatchAttributes.dribbling,
          defense:        currentMatchAttributes.defense,
          physical:       currentMatchAttributes.physical,
          coach_grade:    currentMatchAttributes.coach_grade,
          overall_rating: currentMatchAttributes.overall_rating,
          // GK
          diving:         currentMatchAttributes.diving,
          handling:       currentMatchAttributes.handling,
          kicking:        currentMatchAttributes.kicking,
          updated_at: trx.fn.now()
        });
      return currentMatchAttributes;
    }

    console.log(`📊 Found ${futureMatchReviews.length} future matches to recalculate for player ${playerId}`);

    // 4) Preload existing snapshots for these matches to avoid per-iteration reads
    const futureMatchIds = futureMatchReviews.map(r => r.match_id);
    const existingSnapshots = await trx('player_snapshots')
      .where({ player_id: playerId })
      .whereIn('match_id', futureMatchIds)
      .select('match_id');

    const hasSnapshot = new Set(existingSnapshots.map(s => s.match_id));

    // 5) Iterate in memory, compute new attributes, and build rows to upsert
    let previousAttributes = { ...currentMatchAttributes };
    const snapshotRows = [];

    for (const review of futureMatchReviews) {
      if (process.env.NODE_ENV !== 'production') {
        console.log(`🔄 Processing match ${review.match_id} (${review.match_date}) for player ${playerId}`);
      }

      const matchStats = {
        goals: review.goals || 0,
        assists: review.assists || 0,
        saves: review.saves || 0,
        tackles: review.tackles || 0,
        interceptions: review.interceptions || 0,
        chances_created: review.chances_created || 0,
        minutes_played: review.minutes_played || 0,
        coach_rating: review.coach_rating || 50,
        // GK-specific
        successful_goalie_kicks:  review.successful_goalie_kicks  || 0,
        failed_goalie_kicks:      review.failed_goalie_kicks      || 0,
        successful_goalie_throws: review.successful_goalie_throws || 0,
        failed_goalie_throws:     review.failed_goalie_throws     || 0
      };

      const newAttributes = calculateAttributeUpdates(previousAttributes, matchStats, playerPosition);

      snapshotRows.push({
        player_id: playerId,
        match_id:  review.match_id,
        shooting:  newAttributes.shooting,
        passing:   newAttributes.passing,
        dribbling: newAttributes.dribbling,
        defense:   newAttributes.defense,
        physical:  newAttributes.physical,
        coach_grade:    newAttributes.coach_grade,
        overall_rating: newAttributes.overall_rating,
        // GK
        diving:    newAttributes.diving,
        handling:  newAttributes.handling,
        kicking:   newAttributes.kicking,
        // Use match date for chronological accuracy; also set updated_at
        created_at: review.match_date,
        updated_at: trx.fn.now()
      });

      previousAttributes = newAttributes;
    }

    // 6) Bulk UPSERT snapshots (insert-or-update) to avoid per-row branch
    // Requires Postgres and a unique constraint on (player_id, match_id)
    // CREATE UNIQUE INDEX ON player_snapshots(player_id, match_id);
    if (snapshotRows.length > 0) {
      await trx('player_snapshots')
        .insert(snapshotRows)
        .onConflict(['player_id', 'match_id'])
        .merge({
          shooting: trx.raw('EXCLUDED.shooting'),
          passing: trx.raw('EXCLUDED.passing'),
          dribbling: trx.raw('EXCLUDED.dribbling'),
          defense: trx.raw('EXCLUDED.defense'),
          physical: trx.raw('EXCLUDED.physical'),
          coach_grade: trx.raw('EXCLUDED.coach_grade'),
          overall_rating: trx.raw('EXCLUDED.overall_rating'),
          diving: trx.raw('EXCLUDED.diving'),
          handling: trx.raw('EXCLUDED.handling'),
          kicking: trx.raw('EXCLUDED.kicking'),
          created_at: trx.raw('EXCLUDED.created_at'), // keep aligned to match_date
          updated_at: trx.raw('EXCLUDED.updated_at')
        });
    }

    // 7) Update player's current attributes with the final state
    await trx('players')
      .where({ id: playerId })
      .update({
        shooting:       previousAttributes.shooting,
        passing:        previousAttributes.passing,
        dribbling:      previousAttributes.dribbling,
        defense:        previousAttributes.defense,
        physical:       previousAttributes.physical,
        coach_grade:    previousAttributes.coach_grade,
        overall_rating: previousAttributes.overall_rating,
        // GK
        diving:         previousAttributes.diving,
        handling:       previousAttributes.handling,
        kicking:        previousAttributes.kicking,
        updated_at: trx.fn.now()
      });

    console.log(`✅ Chain recalculation complete for player ${playerId}. Final attributes updated.`);
    return previousAttributes;

  } catch (error) {
    console.error(`❌ Error during chain recalculation for player ${playerId}:`, error);
    throw error;
  }
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
      feedback = null,
      // Goalkeeper-specific stats
      successful_goalie_kicks = 0,
      failed_goalie_kicks = 0,
      successful_goalie_throws = 0,
      failed_goalie_throws = 0
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
      feedback,
      // Goalkeeper-specific stats
      successful_goalie_kicks,
      failed_goalie_kicks,
      successful_goalie_throws,
      failed_goalie_throws
    };

    const existingReview = await trx('moderate_reviews')
      .where({ player_id, match_id })
      .first();

    let reviewId;
    let shouldGenerateAI = false;
    
    if (existingReview) {
      // Check if we should generate AI suggestions
      // Only regenerate if feedback is present AND (no existing suggestions OR feedback has changed)
      shouldGenerateAI = feedback && 
                        feedback.trim().length > 0 && 
                        (!existingReview.ai_suggestions || existingReview.feedback !== feedback);
      
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
    const newAttributes = calculateAttributeUpdates(baselineStats, matchStats, currentPlayer.position);
    console.log('🔍 NEW ATTRIBUTES CALCULATED:', newAttributes);
    console.log('🏥 BASELINE STATS:', baselineStats);
    console.log('📊 MATCH STATS:', matchStats);
    console.log('🥅 PLAYER POSITION:', currentPlayer.position);

    // Get the current match for timestamp alignment
    const currentMatch = await trx('matches')
      .where({ id: match_id })
      .first();

    if (!currentMatch) {
      await trx.rollback();
      return res.status(404).json({ 
        success: false, 
        message: 'Match not found' 
      });
    }

    // Create or update snapshot for the current match
    const existingSnapshot = await trx('player_snapshots')
      .where({ player_id, match_id })
      .first();

    if (existingSnapshot) {
      // Update existing snapshot with aligned timestamp
      await trx('player_snapshots')
        .where({ player_id, match_id })
        .update({
          shooting: newAttributes.shooting,
          passing: newAttributes.passing,
          dribbling: newAttributes.dribbling,
          defense: newAttributes.defense,
          physical: newAttributes.physical,
          coach_grade: newAttributes.coach_grade,
          overall_rating: newAttributes.overall_rating,
          diving: newAttributes.diving,
          handling: newAttributes.handling,
          kicking: newAttributes.kicking,
          created_at: currentMatch.match_date // Align with match date
        });
    } else {
      // Create new snapshot with aligned timestamp
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
          overall_rating: newAttributes.overall_rating,
          diving: newAttributes.diving,
          handling: newAttributes.handling,
          kicking: newAttributes.kicking,
          created_at: currentMatch.match_date // Use match date for chronological accuracy
        });
    }

    // Recalculate all subsequent snapshots chronologically
    await recalculateSubsequentSnapshots(trx, player_id, match_id, newAttributes);

    // Always generate AI grade for performance (regardless of feedback)
    let aiRating = null;
    let aiReasoning = null;
    
    try {
      console.log('📊 Generating AI grade for player performance...');
      
      // Get player position and match data for context
      const playerPosition = currentPlayer.position || 'unknown';
      const matchData = await trx('matches').where({ id: match_id }).first();
      const goalsConceded = matchData?.opponent_score || 0;
      
      // Enhanced match stats with goalkeeper context
      const enhancedMatchStats = {
        ...matchStats,
        goals_conceded: goalsConceded
      };
      
      // Generate AI grade for the performance
      const aiGradeResult = aiSuggestionsService.generateAiGrade(enhancedMatchStats, playerPosition);
      
      // Prepare AI grade data for database
      aiRating = aiGradeResult.numeric;
      aiReasoning = JSON.stringify({
        letter: aiGradeResult.letter,
        components: aiGradeResult.components,
        notes: aiGradeResult.notes
      });

      console.log(`📊 AI Grade: ${aiRating} (${aiGradeResult.letter})`);
      
    } catch (gradeError) {
      console.error('❌ Error generating AI grade:', gradeError.message);
      // Set fallback values if AI grade generation fails
      aiRating = 50;
      aiReasoning = JSON.stringify({
        letter: 'C',
        components: { fallback: 50 },
        notes: ['Grade calculation unavailable']
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
        
        // Get match data for goalkeeper context (goals conceded)
        const matchData = await trx('matches').where({ id: match_id }).first();
        const goalsConceded = matchData?.opponent_score || 0;
        
        // Enhanced match stats with goalkeeper context
        const enhancedMatchStats = {
          ...matchStats,
          goals_conceded: goalsConceded
        };
        
        // Generate AI suggestions
        aiSuggestions = await aiSuggestionsService.generatePlayerSuggestions(
          feedback,
          enhancedMatchStats,
          playerName,
          playerPosition
        );

        // Generate AI grade for the performance
        console.log('📊 Generating AI grade for player performance...');
        const aiGradeResult = aiSuggestionsService.generateAiGrade(enhancedMatchStats, playerPosition);
        
        // Prepare AI grade data for database
        const aiGrade = aiGradeResult.numeric;
        const aiReasoning = JSON.stringify({
          letter: aiGradeResult.letter,
          components: aiGradeResult.components,
          notes: aiGradeResult.notes
        });

        if (aiSuggestions) {
          // Update the moderate_review record with AI suggestions and grade
          await trx('moderate_reviews')
            .where({ id: reviewId })
            .update({
              ai_suggestions: aiSuggestions,
              ai_rating: aiRating,
              ai_reasoning: aiReasoning,
              updated_at: knex.fn.now()
            });
          
          console.log('✅ AI suggestions and grade generated successfully');
        } else {
          console.log('⚠️ AI suggestions generation returned null');
        }
      } catch (aiError) {
        console.error('❌ Error generating AI suggestions:', aiError.message);
        // Don't fail the entire request if AI fails
        // Continue with the transaction
      }
    }

    // Always update AI grade (regardless of suggestions outcome)
    try {
      await trx('moderate_reviews')
        .where({ id: reviewId })
        .update({
          ai_rating: aiRating,
          ai_reasoning: aiReasoning,
          updated_at: knex.fn.now()
        });
      console.log('✅ AI grade saved to database');
    } catch (gradeUpdateError) {
      console.error('❌ Error saving AI grade to database:', gradeUpdateError.message);
      // Continue with transaction even if grade update fails
    }

    await trx.commit();

    // Get the final player attributes after chain recalculation
    const finalPlayer = await knex('players')
      .where({ id: player_id })
      .first();

    if (!finalPlayer) {
      console.error(`❌ Player ${player_id} not found after transaction commit`);
      return res.status(500).json({ 
        success: false, 
        message: 'Player data inconsistency after update'
      });
    }

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
          ),
          diving: baselineStats.diving,
          handling: baselineStats.handling,
          kicking: baselineStats.kicking
        },
        match_attributes: newAttributes, // Attributes calculated for this specific match
        final_attributes: { // Final attributes after chain recalculation
          shooting: finalPlayer.shooting || 50,
          passing: finalPlayer.passing || 50,
          dribbling: finalPlayer.dribbling || 50,
          defense: finalPlayer.defense || 50,
          physical: finalPlayer.physical || 50,
          coach_grade: finalPlayer.coach_grade || 50,
          overall_rating: finalPlayer.overall_rating || 50,
          diving: finalPlayer.diving || 50,
          handling: finalPlayer.handling || 50,
          kicking: finalPlayer.kicking || 50
        },
        match_growth: { // Growth specifically from this match
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
          )),
          diving: newAttributes.diving - baselineStats.diving,
          handling: newAttributes.handling - baselineStats.handling,
          kicking: newAttributes.kicking - baselineStats.kicking
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
  calculateAttributeUpdates, // Export for testing
  recalculateSubsequentSnapshots // Export for testing
};
