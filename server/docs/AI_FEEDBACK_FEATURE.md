# AI Coach Feedback Enhancement

This feature integrates Google's Gemini AI to enhance coach feedback with constructive suggestions for player improvement.

## How It Works

1. **Coach submits feedback** - When submitting player match stats, coaches can include optional feedback
2. **AI processes feedback** - If feedback is provided, the system calls Gemini AI to:
   - Rephrase the feedback constructively 
   - Generate 3 specific improvement suggestions based on performance stats
3. **Enhanced feedback saved** - The AI-enhanced feedback is saved in the `ai_suggestions` field

## Setup

1. Get a Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Add to your `.env` file:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```
3. Restart your server

## API Usage

### Submit Player Stats with Feedback

```javascript
POST /api/reviews/moderate
{
  "player_id": 1,
  "match_id": 2,
  "goals": 1,
  "assists": 0,
  "saves": 0,
  "tackles": 3,
  "interceptions": 2,
  "chances_created": 1,
  "minutes_played": 90,
  "coach_rating": 65,
  "feedback": "Good effort today but you need to work on your passing accuracy and positioning"
}
```

### Response with AI Suggestions

```javascript
{
  "success": true,
  "message": "Player stats updated successfully",
  "data": {
    "review_id": 123,
    "player_id": 1,
    "match_id": 2,
    // ... other data
    "feedback": "Good effort today but you need to work on your passing accuracy and positioning",
    "ai_suggestions": "You showed great effort but struggled with composure at key moments.\n\n- Practice staying calm in high-pressure drills\n- Improve awareness of nearby defenders\n- Review past fouls to learn alternative positioning"
  }
}
```

### Test AI Service

```javascript
GET /api/reviews/test-ai
```

Returns test results and API availability status.

## Features

- **Conditional Processing**: AI only runs if feedback is provided and no AI suggestions exist yet
- **Graceful Fallback**: If AI API fails, the system continues without failing the request
- **Personalized Suggestions**: Uses player name and performance stats for context
- **Constructive Tone**: AI rephrases feedback to be encouraging while maintaining honesty

## Database Schema

The `moderate_reviews` table includes:
- `feedback` (text, nullable) - Original coach feedback
- `ai_suggestions` (text, nullable) - AI-enhanced feedback with suggestions

## Error Handling

- Missing API key: Service logs warning, continues without AI
- API failures: Logged as errors, provides fallback suggestions
- Invalid feedback: Skips AI processing, continues with stats submission
