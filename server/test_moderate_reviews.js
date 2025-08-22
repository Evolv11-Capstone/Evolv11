const knex = require('./db/knex');

async function testModerateReviews() {
  try {
    console.log('Testing moderate reviews seeding...');
    
    // Import the seed function
    const { seed } = require('./db/seeds/05_moderate_match_reviews.js');
    
    // Run the seed
    await seed(knex);
    
    console.log('✅ Moderate reviews seeding completed successfully!');
    
    // Check count
    const count = await knex('moderate_reviews').count('*');
    console.log('Total moderate reviews:', count[0].count);
    
  } catch (error) {
    console.error('❌ Error in moderate reviews seeding:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await knex.destroy();
  }
}

testModerateReviews();
