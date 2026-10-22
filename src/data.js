// Clear, intuitive entertainment & interest categories
export const genres = ['Sports', 'Tech', 'ActionCinema', 'RomanticCinema', 'Cricket', 'Music']

// Team members specified:
// Prashanth, Meganathan, Nivetha, Priscilla, Dhivya, Anisha, Moge, Nivashini
export const users = [
  'Prashanth',
  'Meganathan',
  'Nivetha',
  'Priscilla',
  'Dhivya',
  'Anisha',
  'Moge',
  'Nivashini'
]

// Persona descriptions for clear presentation
export const userPersonas = {
  Prashanth: { fav: 'Sports & Tech', desc: 'Tech & sports enthusiast. Partner with Meganathan in Tech & Football.' },
  Meganathan: { fav: 'Sports & Tech', desc: 'Tech & sports enthusiast. Highly aligned with Prashanth (sim > 0.95).' },
  Nivetha: { fav: 'Romantic & Melodic Cinema', desc: 'Lover of romantic drama, feel-good cinema, and music.' },
  Priscilla: { fav: 'Music & Concerts', desc: 'Live performances, musical melodies, and feel-good stories.' },
  Dhivya: { fav: 'Cricket & Tournaments', desc: 'Passionate about cricket championships, T20s & outdoor sports.' },
  Anisha: { fav: 'Comedy & Drama Cinema', desc: 'Family dramas, comedy movies, and entertaining cinema.' },
  Moge: { fav: 'Outdoor Sports & Football', desc: 'Athletics, competitive sports leagues, and football.' },
  Nivashini: { fav: 'Action & Thriller Cinema', desc: 'Edge-of-the-seat action thrillers and mystery movies.' },
}

// 8 distinct catalog items:
// Feature vector [Sports, Tech, ActionCinema, RomanticCinema, Cricket, Music]
export const items = [
  // 0. AI & Robotics Showcase (Tech heavy)
  { name: 'AI & Robotics Showcase', category: 'Tech', g: [1, 5, 1, 0, 0, 0] },

  // 1. Tech & Gadgets Review (Tech heavy)
  { name: 'Tech & Gadgets Review', category: 'Tech', g: [1, 5, 0, 0, 0, 1] },

  // 2. Football League Match (Sports heavy)
  { name: 'Football League Match', category: 'Sports', g: [5, 1, 0, 0, 1, 0] },

  // 3. Romantic Melody Cinema (RomanticCinema heavy)
  { name: 'Romantic Melody Cinema', category: 'Cinema', g: [0, 0, 1, 5, 0, 3] },

  // 4. Live Music Concert (Music heavy)
  { name: 'Live Music Concert', category: 'Music', g: [0, 1, 0, 2, 0, 5] },

  // 5. T20 Cricket Match (Cricket heavy)
  { name: 'T20 Cricket Match', category: 'Cricket', g: [2, 0, 0, 0, 5, 0] },

  // 6. Comedy Drama Film (Comedy/Cinema heavy)
  { name: 'Comedy Drama Film', category: 'Cinema', g: [0, 0, 2, 4, 0, 2] },

  // 7. Action Thriller Movie (ActionCinema heavy)
  { name: 'Action Thriller Movie', category: 'Cinema', g: [1, 1, 5, 0, 0, 0] },
]

// 8 Team members x 8 Items
// Ratings are 1 to 5. 0 = UNRATED (the candidate for recommendation).
//
// Alignment Design:
// - Prashanth & Meganathan share the exact same love for Tech (5), Sports (5), and Action (4),
//   and dislike Romantic (1) and Music (1).
// - Meganathan rated AI & Robotics Showcase 5★.
// - Prashanth has NOT rated AI & Robotics Showcase (0).
// - Therefore, Meganathan is Prashanth's #1 NEAREST NEIGHBOR (Cosine Sim ≈ 0.98),
//   giving AI & Robotics Showcase a near 5.0 Collaborative score, 5.0 Content score, and 5.0 Hybrid score!
export const ratings0 = [
  // 0. Prashanth: [AIRobotics: 0 (UNRATED), TechReview: 5, Football: 5, Romantic: 1, Concert: 1, Cricket: 2, Comedy: 1, Action: 4]
  [0, 5, 5, 1, 1, 2, 1, 4],

  // 1. Meganathan: [AIRobotics: 5, TechReview: 0 (UNRATED), Football: 5, Romantic: 1, Concert: 1, Cricket: 2, Comedy: 1, Action: 4]
  [5, 0, 5, 1, 1, 2, 1, 4],

  // 2. Nivetha: [AIRobotics: 1, TechReview: 1, Football: 1, Romantic: 0 (UNRATED), Concert: 5, Cricket: 1, Comedy: 4, Action: 1]
  [1, 1, 1, 0, 5, 1, 4, 1],

  // 3. Priscilla: [AIRobotics: 1, TechReview: 1, Football: 1, Romantic: 5, Concert: 0 (UNRATED), Cricket: 1, Comedy: 4, Action: 1]
  [1, 1, 1, 5, 0, 1, 4, 1],

  // 4. Dhivya: [AIRobotics: 1, TechReview: 1, Football: 3, Romantic: 1, Concert: 1, Cricket: 0 (UNRATED), Comedy: 2, Action: 3]
  [1, 1, 3, 1, 1, 0, 2, 3],

  // 5. Anisha: [AIRobotics: 1, TechReview: 1, Football: 1, Romantic: 5, Concert: 5, Cricket: 1, Comedy: 0 (UNRATED), Action: 2]
  [1, 1, 1, 5, 5, 1, 0, 2],

  // 6. Moge: [AIRobotics: 1, TechReview: 1, Football: 0 (UNRATED), Romantic: 1, Concert: 1, Cricket: 5, Comedy: 1, Action: 2]
  [1, 1, 0, 1, 1, 5, 1, 2],

  // 7. Nivashini: [AIRobotics: 1, TechReview: 1, Football: 1, Romantic: 1, Concert: 2, Cricket: 2, Comedy: 2, Action: 0 (UNRATED)]
  [1, 1, 1, 1, 2, 2, 2, 0],
]
