const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Lightweight question generation without AI models
const questionDatabase = {
  easy: [
    {
      items: [
        { name: "Apple", category: "Fruit", isOdd: false },
        { name: "Banana", category: "Fruit", isOdd: false },
        { name: "Orange", category: "Fruit", isOdd: false },
        { name: "Carrot", category: "Vegetable", isOdd: true }
      ],
      explanation: "Carrot is a vegetable, while the others are fruits."
    },
    {
      items: [
        { name: "Dog", category: "Animal", isOdd: false },
        { name: "Cat", category: "Animal", isOdd: false },
        { name: "Bird", category: "Animal", isOdd: false },
        { name: "Fish", category: "Aquatic Animal", isOdd: true }
      ],
      explanation: "Fish lives in water, while the others are land animals."
    },
    {
      items: [
        { name: "Red", category: "Color", isOdd: false },
        { name: "Blue", category: "Color", isOdd: false },
        { name: "Green", category: "Color", isOdd: false },
        { name: "Square", category: "Shape", isOdd: true }
      ],
      explanation: "Square is a shape, while the others are colors."
    },
    {
      items: [
        { name: "Chair", category: "Furniture", isOdd: false },
        { name: "Table", category: "Furniture", isOdd: false },
        { name: "Bed", category: "Furniture", isOdd: false },
        { name: "Book", category: "Object", isOdd: true }
      ],
      explanation: "Book is for reading, while the others are furniture."
    },
    {
      items: [
        { name: "Sun", category: "Celestial Body", isOdd: false },
        { name: "Moon", category: "Celestial Body", isOdd: false },
        { name: "Star", category: "Celestial Body", isOdd: false },
        { name: "Cloud", category: "Weather", isOdd: true }
      ],
      explanation: "Cloud is weather-related, while the others are celestial bodies."
    }
  ],
  medium: [
    {
      items: [
        { name: "Lion", category: "Big Cat", isOdd: false },
        { name: "Tiger", category: "Big Cat", isOdd: false },
        { name: "Leopard", category: "Big Cat", isOdd: false },
        { name: "Wolf", category: "Canine", isOdd: true }
      ],
      explanation: "Wolf is a canine, while the others are big cats."
    },
    {
      items: [
        { name: "Piano", category: "String Instrument", isOdd: false },
        { name: "Guitar", category: "String Instrument", isOdd: false },
        { name: "Violin", category: "String Instrument", isOdd: false },
        { name: "Drums", category: "Percussion", isOdd: true }
      ],
      explanation: "Drums are percussion, while the others are string instruments."
    },
    {
      items: [
        { name: "Winter", category: "Cold Season", isOdd: false },
        { name: "Spring", category: "Warm Season", isOdd: false },
        { name: "Summer", category: "Warm Season", isOdd: false },
        { name: "Fall", category: "Warm Season", isOdd: false }
      ],
      explanation: "Winter is cold, while the others are warm seasons."
    },
    {
      items: [
        { name: "Doctor", category: "Medical Professional", isOdd: false },
        { name: "Nurse", category: "Medical Professional", isOdd: false },
        { name: "Teacher", category: "Education Professional", isOdd: true },
        { name: "Surgeon", category: "Medical Professional", isOdd: false }
      ],
      explanation: "Teacher works in education, while the others are medical professionals."
    },
    {
      items: [
        { name: "Coffee", category: "Hot Beverage", isOdd: false },
        { name: "Tea", category: "Hot Beverage", isOdd: false },
        { name: "Hot Chocolate", category: "Hot Beverage", isOdd: false },
        { name: "Orange Juice", category: "Cold Beverage", isOdd: true }
      ],
      explanation: "Orange juice is cold, while the others are hot beverages."
    }
  ],
  hard: [
    {
      items: [
        { name: "Diamond", category: "Precious Stone", isOdd: false },
        { name: "Ruby", category: "Precious Stone", isOdd: false },
        { name: "Emerald", category: "Precious Stone", isOdd: false },
        { name: "Pearl", category: "Organic Gem", isOdd: true }
      ],
      explanation: "Pearl is organic (from oysters), while the others are mineral stones."
    },
    {
      items: [
        { name: "Venus", category: "Terrestrial Planet", isOdd: false },
        { name: "Earth", category: "Terrestrial Planet", isOdd: false },
        { name: "Mars", category: "Terrestrial Planet", isOdd: false },
        { name: "Jupiter", category: "Gas Giant", isOdd: true }
      ],
      explanation: "Jupiter is a gas giant, while the others are rocky terrestrial planets."
    },
    {
      items: [
        { name: "Shakespeare", category: "Playwright", isOdd: false },
        { name: "Mozart", category: "Composer", isOdd: true },
        { name: "Beethoven", category: "Composer", isOdd: false },
        { name: "Bach", category: "Composer", isOdd: false }
      ],
      explanation: "Shakespeare wrote plays, while the others composed music."
    },
    {
      items: [
        { name: "Python", category: "Programming Language", isOdd: false },
        { name: "Java", category: "Programming Language", isOdd: false },
        { name: "JavaScript", category: "Programming Language", isOdd: false },
        { name: "HTML", category: "Markup Language", isOdd: true }
      ],
      explanation: "HTML is a markup language, while the others are programming languages."
    },
    {
      items: [
        { name: "Soccer", category: "Team Sport", isOdd: false },
        { name: "Basketball", category: "Team Sport", isOdd: false },
        { name: "Tennis", category: "Individual Sport", isOdd: true },
        { name: "Volleyball", category: "Team Sport", isOdd: false }
      ],
      explanation: "Tennis is individual, while the others are team sports."
    }
  ]
};

// Dynamic question generation with randomization
function generateDynamicQuestion(difficulty) {
  const baseQuestions = questionDatabase[difficulty] || questionDatabase.medium;
  
  // Randomly select a base question
  const baseQuestion = baseQuestions[Math.floor(Math.random() * baseQuestions.length)];
  
  // Create variations by shuffling items and adding random elements
  const variations = [
    // Variation 1: Shuffle items
    () => {
      const shuffled = [...baseQuestion.items].sort(() => Math.random() - 0.5);
      return { ...baseQuestion, items: shuffled };
    },
    
    // Variation 2: Add random adjectives
    () => {
      const adjectives = ['Big', 'Small', 'Fast', 'Slow', 'Old', 'New', 'Red', 'Blue', 'Green', 'Yellow'];
      const modifiedItems = baseQuestion.items.map(item => ({
        ...item,
        name: `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${item.name}`
      }));
      return { ...baseQuestion, items: modifiedItems };
    },
    
    // Variation 3: Change categories slightly
    () => {
      const categoryVariations = {
        'Animal': ['Wild Animal', 'Domestic Animal', 'Pet'],
        'Fruit': ['Tropical Fruit', 'Citrus Fruit', 'Berry'],
        'Color': ['Warm Color', 'Cool Color', 'Primary Color'],
        'Furniture': ['Living Room Furniture', 'Bedroom Furniture', 'Office Furniture']
      };
      
      const modifiedItems = baseQuestion.items.map(item => {
        const variations = categoryVariations[item.category] || [item.category];
        return {
          ...item,
          category: variations[Math.floor(Math.random() * variations.length)]
        };
      });
      return { ...baseQuestion, items: modifiedItems };
    }
  ];
  
  // Apply random variation
  const variation = variations[Math.floor(Math.random() * variations.length)];
  return variation();
}

// Generate Odd One Out question
app.get('/api/odd-one-out', async (req, res) => {
  try {
    const { difficulty = 'medium' } = req.query;
    
    // Validate difficulty
    if (!['easy', 'medium', 'hard'].includes(difficulty)) {
      return res.status(400).json({ error: 'Invalid difficulty level' });
    }
    
    // Generate dynamic question
    const question = generateDynamicQuestion(difficulty);
    
    res.json({
      ...question,
      difficulty,
      timestamp: new Date().toISOString(),
      source: 'lightweight-dynamic'
    });
    
  } catch (error) {
    console.error('Error generating question:', error);
    res.status(500).json({ 
      error: 'Failed to generate question',
      message: error.message 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    source: 'lightweight-dynamic',
    features: ['No AI models required', 'Instant responses', 'Dynamic variations']
  });
});

// Generate multiple questions for a session
app.get('/api/odd-one-out/batch', async (req, res) => {
  try {
    const { count = 5, difficulty = 'medium' } = req.query;
    const questions = [];
    
    for (let i = 0; i < Math.min(count, 20); i++) { // Limit to 20 questions max
      const question = generateDynamicQuestion(difficulty);
      questions.push({
        ...question,
        difficulty,
        timestamp: new Date().toISOString(),
        source: 'lightweight-dynamic'
      });
    }
    
    res.json({ 
      questions, 
      count: questions.length,
      source: 'lightweight-dynamic'
    });
  } catch (error) {
    console.error('Error generating batch:', error);
    res.status(500).json({ error: 'Failed to generate batch questions' });
  }
});

// Get available difficulties
app.get('/api/difficulties', (req, res) => {
  res.json({
    difficulties: ['easy', 'medium', 'hard'],
    descriptions: {
      easy: 'Simple categories like animals, fruits, colors',
      medium: 'More specific categories and relationships',
      hard: 'Complex categories and subtle differences'
    }
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Lightweight server running on http://localhost:${PORT}`);
  console.log('✨ No AI models required - Instant responses!');
  console.log('📱 Perfect for mobile apps');
  console.log('\nAvailable endpoints:');
  console.log('- GET /api/odd-one-out?difficulty=easy|medium|hard');
  console.log('- GET /api/odd-one-out/batch?count=5&difficulty=medium');
  console.log('- GET /api/health');
  console.log('- GET /api/difficulties');
}); 