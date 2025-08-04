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
      const {
        goals = 0,
        assists = 0,
        saves = 0,
        tackles = 0,
        interceptions = 0,
        chances_created = 0,
        minutes_played = 0,
        coach_rating = 50
      } = playerStats;

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
- Coach Rating: ${coach_rating}/100

Instructions:
1. First, rephrase the coach's feedback in a constructive, encouraging way that maintains honesty while being supportive
2. Then provide exactly 3 bullet points with specific, actionable improvement suggestions based on the feedback, performance stats, AND the player's position
3. Tailor suggestions to the player's position (e.g., goalkeepers focus on shot-stopping/distribution, defenders on tackling/positioning, midfielders on passing/vision, forwards on finishing/movement)
4. Keep the tone professional but encouraging
5. Focus on specific skills, techniques, or tactical improvements relevant to their position
6. Make suggestions practical and achievable for a ${position}

Position-specific focus areas:
- GK (Goalkeeper): Shot-stopping, distribution, command of penalty area, communication, positioning
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
