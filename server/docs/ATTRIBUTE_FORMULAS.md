# Evolv11 – Attribute Update Formulas

This document describes how Evolv11 updates player attributes after each match. Each attribute is adjusted relative to the player's baseline stats, using weighted match performance data. Penalties apply for inactivity or poor performances, while growth diminishes as attributes approach their ceiling.

## General Principles

### Baseline Penalties
- **Mild penalty** for inactivity (`-0.6`) when expected contributions are not made
- **Severe penalty** (`-1.5`) is reserved for potential future extensions but not applied directly here

### Growth Application
- **Positive growth** uses diminishing returns — improvements are smaller at higher ratings
- **Negative growth** applies a decline factor, but is gentler than previous versions (floor at 10)

### Growth Formula Structure
```javascript
const applyGrowth = (current, growth) => {
  if (growth >= 0) {
    // Diminishing returns for high attributes
    const diminishingFactor = Math.max(0.1, (100 - current) / 100);
    return Math.min(100, current + (growth * diminishingFactor));
  } else {
    // Gentler decline with protection floor
    const declineFactor = Math.max(0.5, current / 100);
    return Math.max(10, current + (growth * declineFactor));
  }
};
```

## Outfield Attributes

### Shooting
```javascript
Growth = (goals * 3.2 + chances_created * 0.9) * 0.22
       + penalty if no goals after >45 minutes
```

**Key Factors:**
- Goals are the strongest driver
- Chance creation gives a secondary boost
- Missing goals over extended minutes leads to a mild decline

**Implementation:**
```javascript
const shootingGrowth =
  ((goals * 3.2 + chances_created * 0.9) * 0.22) +
  (goals === 0 && minutes_played > 45 ? baselinePenalty : 0);
```

### Passing
```javascript
Growth = (assists * 3.0 + chances_created * 1.4) * 0.18
       + penalty if no assists or creation after >45 minutes
```

**Key Factors:**
- Assists weigh most heavily
- Creating chances contributes meaningfully
- Inactivity over a full half reduces growth

**Implementation:**
```javascript
const passingGrowth =
  ((assists * 3.0 + chances_created * 1.4) * 0.18) +
  (assists === 0 && chances_created === 0 && minutes_played > 45 ? baselinePenalty : 0);
```

### Dribbling
```javascript
Growth = (goals * 0.8 + assists * 0.7 + chances_created * 1.1) * 0.18
       + penalty if no goals, assists, or chances after >30 minutes
```

**Key Factors:**
- Chance creation is the primary driver
- Goals and assists provide smaller boosts
- Inactivity penalties kick in earlier (after 30 minutes)

**Implementation:**
```javascript
const dribblingGrowth =
  ((goals * 0.8 + assists * 0.7 + chances_created * 1.1) * 0.18) +
  (goals === 0 && assists === 0 && chances_created === 0 && minutes_played > 30 ? baselinePenalty : 0);
```

### Defense
```javascript
Growth = (tackles * 2.0 + interceptions * 2.3 + saves * 0.8) * 0.22
       + penalty if no defensive actions after >45 minutes
```

**Key Factors:**
- Interceptions are weighted slightly more than tackles
- Saves contribute, but less strongly (so non-keepers don't inflate)
- Inactivity in defense leads to mild decline

**Implementation:**
```javascript
const defenseGrowth =
  ((tackles * 2.0 + interceptions * 2.3 + saves * 0.8) * 0.22) +
  (tackles === 0 && interceptions === 0 && saves === 0 && minutes_played > 45 ? baselinePenalty : 0);
```

### Physical
```javascript
Growth = (minutes_played / 90) * 0.8
       - penalty if <30 minutes played
```

**Key Factors:**
- Endurance and full-match participation boost physicality
- Short appearances (<30 minutes) reduce physical growth

**Implementation:**
```javascript
const physicalGrowth = (minutes_played / 90) * 0.8 - (minutes_played < 30 ? 0.8 : 0);
```

### Coach Grade
```javascript
Growth = (coach_rating - coach_grade) * 0.15
Penalty = -1.5 if coach_rating < 30
          -0.7 if coach_rating < 40
```

**Key Factors:**
- Coach ratings pull the grade closer to the actual evaluation
- Extreme negative coach ratings trigger additional decline
- More moderate influence than before, reducing swinginess

**Implementation:**
```javascript
const coachGrowth = (coach_rating - coach_grade) * 0.15;
const coachPenalty = coach_rating < 30 ? -1.5 : (coach_rating < 40 ? -0.7 : 0);
const newCoachGrade = Math.round(
  Math.min(100, Math.max(10, coach_grade + coachGrowth + coachPenalty))
);
```

### Overall Rating
```javascript
Overall = 18% Shooting
        + 20% Passing
        + 14% Dribbling
        + 22% Defense
        + 16% Physical
        + 10% Coach Grade
```

**Key Factors:**
- Defensive and physical performance are weighted slightly higher
- Passing and shooting remain important
- Coach grade provides qualitative adjustment

**Implementation:**
```javascript
const newOverall = Math.round(
  (newShooting * 0.18 + newPassing * 0.20 + newDribbling * 0.14 +
   newDefense * 0.22 + newPhysical * 0.16 + newCoachGrade * 0.10)
);
```

## Goalkeeper Attributes

These attributes apply only when `playerPosition === 'GK'`.

### Diving
```javascript
Growth = (saves * 1.8) * 0.4
       + penalty if no saves after >45 minutes
```

**Key Factors:**
- Saves are the key driver
- A quiet match is penalized lightly, not severely

**Implementation:**
```javascript
const divingGrowth =
  (saves * 1.8) * 0.4 +
  (saves === 0 && minutes_played > 45 ? -0.6 : 0);
newDiving = Math.round(applyGrowth(diving, divingGrowth));
```

### Kicking
```javascript
SuccessRate = successful_goalie_kicks / total_kicks (default 0.75)
Growth = (SuccessRate - 0.75) * 12 + (total_kicks * 0.06)
Penalty = -0.5 if no kicks after >45 minutes
```

**Key Factors:**
- Expected baseline: 75% accuracy
- Performance above or below this baseline adjusts growth
- Higher volume provides a slight bonus

**Implementation:**
```javascript
const totalKicks = successful_goalie_kicks + failed_goalie_kicks;
const kickSuccessRate = totalKicks > 0 ? successful_goalie_kicks / totalKicks : 0.75;
const kickingGrowth = totalKicks > 0
  ? ((kickSuccessRate - 0.75) * 12) + (totalKicks * 0.06)
  : (minutes_played > 45 ? -0.5 : 0);
newKicking = Math.round(applyGrowth(kicking, kickingGrowth));
```

### Handling
```javascript
SuccessRate = successful_goalie_throws / total_throws (default 0.85)
Growth = (SuccessRate - 0.85) * 10 + (total_throws * 0.05)
Penalty = -0.5 if no throws after >45 minutes
```

**Key Factors:**
- Expected baseline: 85% accuracy
- Throwing performance directly drives handling
- Volume of attempts provides a small positive influence

**Implementation:**
```javascript
const totalThrows = successful_goalie_throws + failed_goalie_throws;
const throwSuccessRate = totalThrows > 0 ? successful_goalie_throws / totalThrows : 0.85;
const handlingGrowth = totalThrows > 0
  ? ((throwSuccessRate - 0.85) * 10) + (totalThrows * 0.05)
  : (minutes_played > 45 ? -0.5 : 0);
newHandling = Math.round(applyGrowth(handling, handlingGrowth));
```

## Constants and Configuration

### Penalty Values
```javascript
const baselinePenalty = -0.6;   // Mild penalty for inactivity
const severePenalty = -1.5;     // Reserved for future use
```

### Time Thresholds
- **Full match consideration**: 45+ minutes
- **Short appearance penalty**: <30 minutes
- **Early inactivity check** (dribbling): 30+ minutes

### Success Rate Expectations
- **Goalkeeper kicks**: 75% baseline
- **Goalkeeper throws**: 85% baseline

## Usage in Code

The attribute calculation is implemented in `controllers/moderateReviewControllers.js` in the `calculateAttributeUpdates()` function. This function:

1. Takes current player stats as baseline
2. Applies match performance to calculate growth/decline
3. Uses position-specific logic for goalkeepers
4. Returns updated attributes for database persistence

### Function Signature
```javascript
const calculateAttributeUpdates = (currentStats, matchStats, playerPosition = null) => {
  // Returns object with all updated attributes
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
```

## Version History

- **Current**: Tuned formulas with gentler penalties and balanced growth rates
- **Previous**: More aggressive penalties and higher growth volatility
- **Goal**: Realistic player development that rewards performance while maintaining progression balance
