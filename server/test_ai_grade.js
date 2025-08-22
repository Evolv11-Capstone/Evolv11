// test_ai_grade.js
const aiSuggestionsService = require('./services/aiSuggestions');

console.log('🧪 Testing AI Grade Generation...\n');

// Test cases for different positions
const testCases = [
  {
    name: 'Goalkeeper Performance',
    stats: {
      goals: 0,
      assists: 0,
      saves: 8,
      tackles: 0,
      interceptions: 0,
      chances_created: 0,
      minutes_played: 90,
      coach_rating: 85,
      successful_goalie_kicks: 12,
      failed_goalie_kicks: 3,
      successful_goalie_throws: 5,
      failed_goalie_throws: 1
    },
    position: 'GK'
  },
  {
    name: 'Striker Performance',
    stats: {
      goals: 2,
      assists: 1,
      saves: 0,
      tackles: 1,
      interceptions: 0,
      chances_created: 3,
      minutes_played: 75,
      coach_rating: 78
    },
    position: 'ST'
  },
  {
    name: 'Midfielder Performance',
    stats: {
      goals: 0,
      assists: 2,
      saves: 0,
      tackles: 4,
      interceptions: 3,
      chances_created: 5,
      minutes_played: 90,
      coach_rating: 82
    },
    position: 'CM'
  },
  {
    name: 'Defender Performance',
    stats: {
      goals: 0,
      assists: 0,
      saves: 0,
      tackles: 7,
      interceptions: 4,
      chances_created: 1,
      minutes_played: 90,
      coach_rating: 76
    },
    position: 'CB'
  },
  {
    name: 'Poor Performance (Limited Minutes)',
    stats: {
      goals: 0,
      assists: 0,
      saves: 0,
      tackles: 0,
      interceptions: 0,
      chances_created: 0,
      minutes_played: 15,
      coach_rating: 45
    },
    position: 'CM'
  }
];

// Run tests
testCases.forEach((testCase, index) => {
  console.log(`📝 Test ${index + 1}: ${testCase.name}`);
  console.log(`Position: ${testCase.position}`);
  console.log(`Stats:`, testCase.stats);
  
  try {
    const result = aiSuggestionsService.generateAiGrade(testCase.stats, testCase.position);
    
    console.log(`✅ Result:`);
    console.log(`   Grade: ${result.numeric}/100 (${result.letter})`);
    console.log(`   Components:`, result.components);
    console.log(`   Notes:`, result.notes);
    
    // Validate result structure
    if (typeof result.numeric === 'number' && 
        result.numeric >= 0 && result.numeric <= 100 &&
        typeof result.letter === 'string' &&
        typeof result.components === 'object' &&
        Array.isArray(result.notes)) {
      console.log(`✅ Structure validation passed`);
    } else {
      console.log(`❌ Structure validation failed`);
    }
    
  } catch (error) {
    console.log(`❌ Error:`, error.message);
  }
  
  console.log('---\n');
});

console.log('🧪 AI Grade Testing Complete!');
