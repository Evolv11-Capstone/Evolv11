// services/aiSuggestions.js
const { GoogleGenerativeAI } = require('@google/generative-ai');

class AISuggestionsService {
  constructor() {
    this.genAI = null;
    this.model = null;
    this.initializeAPI();
  }

  initializeAPI() {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        console.warn('⚠️ GEMINI_API_KEY not found. AI suggestions will be disabled.');
        return;
      }

      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      console.log('✅ Gemini AI initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Gemini AI:', error.message);
    }
  }

  isAvailable() {
    return this.model !== null;
  }

  /**
   * Generate constructive feedback and improvement suggestions from coach feedback
   * @param {string} coachFeedback - Original coach feedback
   * @param {Object} playerStats - Player match stats for context
   * @param {string} playerName - Player's name for personalization
   * @param {string} position - Player's position for position-specific suggestions
   * @returns {Promise<string|null>} - Enhanced feedback with suggestions or null if failed
   */
  async generatePlayerSuggestions(coachFeedback, playerStats, playerName = 'the player', position = 'unknown') {
    if (!this.isAvailable()) {
      console.warn('🤖 AI suggestions unavailable - Gemini API not initialized');
      return null;
    }

    if (!coachFeedback || coachFeedback.trim().length === 0) {
      console.log('📝 No coach feedback provided - skipping AI suggestions');
      return null;
    }

    try {
      // Extract standard stats
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
        failed_goalie_throws = 0,
        goals_conceded = 0
      } = playerStats;

      // Calculate goalkeeper-specific metrics if position is GK
      let gkMetrics = '';
      if (position === 'GK') {
        const kicks_attempted = successful_goalie_kicks + failed_goalie_kicks;
        const kicks_accuracy = kicks_attempted > 0 ? Math.round((successful_goalie_kicks / kicks_attempted) * 100) : 0;
        
        const throws_attempted = successful_goalie_throws + failed_goalie_throws;
        const throws_accuracy = throws_attempted > 0 ? Math.round((successful_goalie_throws / throws_attempted) * 100) : 0;

        gkMetrics = `
Goalkeeper-specific performance:
- Saves: ${saves}
- Goals Conceded: ${goals_conceded}
- Kicks: ${kicks_attempted} attempts, ${kicks_accuracy}% success rate
- Throws: ${throws_attempted} attempts, ${throws_accuracy}% success rate`;
      }

      const prompt = `
You are an experienced football coach providing constructive feedback to help players improve. 

Original coach feedback: "${coachFeedback}"

Player details:
- Position: ${position}
- Name: ${playerName}

Player match performance:
- Goals: ${goals}
- Assists: ${assists}
- Saves: ${saves}
- Tackles: ${tackles}
- Interceptions: ${interceptions}
- Chances Created: ${chances_created}
- Minutes Played: ${minutes_played}
- Coach Rating: ${coach_rating}/100${gkMetrics}

Instructions:
1. First, rephrase the coach's feedback in a constructive, encouraging way that maintains honesty while being supportive
2. Then provide exactly 3 bullet points with specific, actionable improvement suggestions based on the feedback, performance stats, AND the player's position
3. Tailor suggestions to the player's position${position === 'GK' ? ' (focus on goalkeeper-specific skills like diving, distribution, handling, kicking accuracy, and command of the penalty area)' : ' (e.g., goalkeepers focus on shot-stopping/distribution, defenders on tackling/positioning, midfielders on passing/vision, forwards on finishing/movement)'}
4. Keep the tone professional but encouraging
5. Focus on specific skills, techniques, or tactical improvements relevant to their position
6. Make suggestions practical and achievable for a ${position}

Position-specific focus areas:
- GK (Goalkeeper): Shot-stopping, distribution (kicks/throws), command of penalty area, communication, positioning, diving technique
- CB/LB/RB (Defenders): Tackling, marking, aerial duels, positioning, passing out from the back
- CDM/CM/CAM (Midfielders): Passing accuracy, vision, work rate, pressing, ball retention
- LW/RW (Wingers): Crossing, dribbling, tracking back, pace utilization, 1v1 situations
- ST/CF (Forwards): Finishing, movement in the box, hold-up play, pressing from the front

Format your response exactly like this:
[Constructive rephrased feedback in 1-2 sentences]

- [Position-specific improvement suggestion 1]
- [Position-specific improvement suggestion 2] 
- [Position-specific improvement suggestion 3]

Do not include any other text, headers, or formatting.
`;

      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const generatedText = response.text().trim();

      if (!generatedText) {
        console.error('❌ Empty response from Gemini API');
        return null;
      }

      console.log('✅ AI suggestions generated successfully');
      return generatedText;

    } catch (error) {
      console.error('❌ Error generating AI suggestions:', error.message);
      
      // Return a fallback response if API fails
      return this.generateFallbackSuggestions(coachFeedback);
    }
  }

  /**
   * Generate basic fallback suggestions when AI API is unavailable
   * @param {string} coachFeedback - Original coach feedback
   * @returns {string} - Basic enhanced feedback
   */
  generateFallbackSuggestions(coachFeedback) {
    const constructiveFeedback = `Your coach provided valuable feedback: "${coachFeedback}". Use this input to guide your development.`;
    
    const generalSuggestions = [
      '- Focus on consistent training to build muscle memory and technique',
      '- Watch match footage to identify areas for tactical improvement',
      '- Work with teammates during practice to enhance decision-making skills'
    ];

    return `${constructiveFeedback}\n\n${generalSuggestions.join('\n')}`;
  }

  /**
   * Generate position-aware AI grade for player performance
   * @param {Object} stats - Player match stats
   * @param {string} position - Player's position (GK, CB, LB, RB, CDM, CM, CAM, LW, RW, ST, CF)
   * @returns {Object} - { numeric, letter, components, notes }
   */
  generateAiGrade(stats, position = 'unknown') {
    try {
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
      } = stats;

      // Safe division helper
      const safeDivide = (numerator, denominator, fallback = 0) => {
        return denominator > 0 ? (numerator / denominator) : fallback;
      };

      // Minutes scaling factor (0.0 to 1.0, scales linearly up to 30 minutes)
      const minutesScale = Math.min(1.0, minutes_played / 30);
      
      let components = {};
      let notes = [];
      let positionWeight = 1.0;

      if (position === 'GK') {
        // Goalkeeper-specific grading
        const totalKicks = successful_goalie_kicks + failed_goalie_kicks;
        const totalThrows = successful_goalie_throws + failed_goalie_throws;
        
        // Calculate goalkeeper metrics
        const kicksAccuracy = safeDivide(successful_goalie_kicks, totalKicks, 0.7); // Default 70% if no kicks
        const throwsAccuracy = safeDivide(successful_goalie_throws, totalThrows, 0.8); // Default 80% if no throws
        
        // Save percentage based on saves vs goals conceded (approximate)
        // Note: goals_conceded not in stats, using saves as primary metric
        const savePerformance = Math.min(1.0, saves / Math.max(1, minutes_played / 15)); // Expect ~1 save per 15 mins
        
        components = {
          saves: Math.min(100, savePerformance * 100),
          kicks_accuracy: kicksAccuracy * 100,
          throws_accuracy: throwsAccuracy * 100,
          activity: Math.min(100, (totalKicks + totalThrows + saves) * 5) // Activity bonus
        };

        // Generate notes for GK
        if (saves > 3) notes.push(`Strong shot-stopping with ${saves} saves`);
        else if (saves === 0 && minutes_played > 45) notes.push('No saves recorded in significant playing time');
        
        if (totalKicks > 0) {
          if (kicksAccuracy >= 0.8) notes.push('Excellent distribution accuracy with kicks');
          else if (kicksAccuracy < 0.5) notes.push('Distribution accuracy needs improvement');
        }
        
        if (totalThrows > 0) {
          if (throwsAccuracy >= 0.9) notes.push('Precise throwing distribution');
          else if (throwsAccuracy < 0.7) notes.push('Hand distribution could be more accurate');
        }

      } else {
        // Outfield player grading
        const isDefender = ['CB', 'LB', 'RB'].includes(position);
        const isMidfielder = ['CDM', 'CM', 'CAM'].includes(position);
        const isForward = ['LW', 'RW', 'ST', 'CF'].includes(position);

        if (isDefender) {
          // Defender focus: tackles, interceptions, defensive actions
          components = {
            tackles: Math.min(100, tackles * 15), // Scale tackles (6-7 tackles = ~100)
            interceptions: Math.min(100, interceptions * 20), // Scale interceptions (5 = 100)
            defensive_actions: Math.min(100, (tackles + interceptions) * 12),
            contribution: Math.min(100, (goals + assists) * 30) // Goals/assists less weighted
          };

          if (tackles >= 5) notes.push('Strong defensive presence with tackles');
          else if (tackles === 0 && minutes_played > 45) notes.push('Limited defensive impact');
          
          if (interceptions >= 3) notes.push('Good positional play and ball interception');
          if (goals > 0) notes.push('Valuable attacking contribution from defense');

        } else if (isMidfielder) {
          // Midfielder focus: chances created, assists, all-around play
          components = {
            creativity: Math.min(100, chances_created * 25), // 4 chances = 100
            assists: Math.min(100, assists * 40), // 2-3 assists = 100
            defensive_work: Math.min(100, (tackles + interceptions) * 15),
            goals: Math.min(100, goals * 30) // Goals valuable but not primary
          };

          if (chances_created >= 3) notes.push('Excellent creative play and vision');
          else if (chances_created === 0 && minutes_played > 45) notes.push('Limited creative impact');
          
          if (assists >= 2) notes.push('Strong playmaking with multiple assists');
          if (tackles + interceptions >= 4) notes.push('Good defensive contribution from midfield');

        } else if (isForward) {
          // Forward focus: goals, assists, attacking metrics
          components = {
            goals: Math.min(100, goals * 35), // ~3 goals = 100
            assists: Math.min(100, assists * 30), // ~3 assists = 100
            attacking_threat: Math.min(100, (goals * 2 + assists + chances_created) * 15),
            defensive_work: Math.min(100, (tackles + interceptions) * 10) // Less weighted
          };

          if (goals >= 2) notes.push('Clinical finishing with multiple goals');
          else if (goals === 0 && minutes_played > 60) notes.push('Needs to find the back of the net');
          
          if (assists >= 2) notes.push('Great link-up play and assist creation');
          if (chances_created >= 2) notes.push('Good involvement in creating opportunities');

        } else {
          // Generic outfield player
          components = {
            attacking: Math.min(100, (goals * 25 + assists * 20 + chances_created * 15)),
            defensive: Math.min(100, (tackles + interceptions) * 15),
            involvement: Math.min(100, (goals + assists + tackles + interceptions + chances_created) * 8),
            minutes_impact: Math.min(100, minutes_played * 1.1)
          };
        }
      }

      // Apply minutes scaling to all components
      Object.keys(components).forEach(key => {
        components[key] = Math.round(components[key] * minutesScale);
      });

      // Calculate weighted average of components
      const componentValues = Object.values(components);
      const baseGrade = componentValues.length > 0 
        ? componentValues.reduce((sum, val) => sum + val, 0) / componentValues.length 
        : 50;

      // Factor in coach rating (20% weight)
      const finalNumeric = Math.round((baseGrade * 0.8) + (coach_rating * 0.2));

      // Apply slight positive bias (optimism): +2-4 points typical, capped at 100
      const biasedGrade = Math.min(100, Math.max(0, (finalNumeric * 1.03) + 1));
      
      // Ensure grade is within bounds
      const clampedGrade = Math.round(biasedGrade);

      // Convert to letter grade
      let letter;
      if (clampedGrade >= 97) letter = 'A+';
      else if (clampedGrade >= 93) letter = 'A';
      else if (clampedGrade >= 90) letter = 'A-';
      else if (clampedGrade >= 87) letter = 'B+';
      else if (clampedGrade >= 83) letter = 'B';
      else if (clampedGrade >= 80) letter = 'B-';
      else if (clampedGrade >= 77) letter = 'C+';
      else if (clampedGrade >= 73) letter = 'C';
      else if (clampedGrade >= 70) letter = 'C-';
      else if (clampedGrade >= 67) letter = 'D+';
      else if (clampedGrade >= 60) letter = 'D';
      else letter = 'F';

      // Add minutes-related notes
      if (minutes_played < 15) {
        notes.push('Limited playing time affects overall assessment');
      } else if (minutes_played >= 90) {
        notes.push('Full match performance demonstrates consistency');
      }

      // Add coach rating notes
      if (coach_rating >= 80) {
        notes.push('Coach highly rated this performance');
      } else if (coach_rating <= 40) {
        notes.push('Coach rating indicates areas for improvement');
      }

      // Ensure we have some notes
      if (notes.length === 0) {
        notes.push('Solid overall contribution to the match');
      }

      return {
        numeric: clampedGrade,
        letter,
        components,
        notes
      };

    } catch (error) {
      console.error('❌ Error generating AI grade:', error.message);
      
      // Fallback grade
      return {
        numeric: 50,
        letter: 'C',
        components: { fallback: 50 },
        notes: ['Grade calculation unavailable']
      };
    }
  }

  /**
   * Test the AI service with sample data
   */
  async testService() {
    if (!this.isAvailable()) {
      return { success: false, message: 'AI service not available' };
    }

    try {
      const testFeedback = "Good effort today but you need to work on your passing accuracy and positioning";
      const testStats = {
        goals: 1,
        assists: 0,
        saves: 0,
        tackles: 3,
        interceptions: 2,
        chances_created: 1,
        minutes_played: 90,
        coach_rating: 65
      };

      const result = await this.generatePlayerSuggestions(testFeedback, testStats, 'Test Player', 'CM');
      
      return {
        success: true,
        message: 'AI service test successful',
        sample_output: result
      };
    } catch (error) {
      return {
        success: false,
        message: `AI service test failed: ${error.message}`
      };
    }
  }
}

// Create a singleton instance
const aiSuggestionsService = new AISuggestionsService();

module.exports = aiSuggestionsService;
