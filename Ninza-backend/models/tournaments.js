const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  id: Number,
  name: String
});

const tournamentSchema = new mongoose.Schema({
  id: Number,
  name: String,
  game: String,
  startDate: String,
  endDate: String,
  location: String,
  teams: [teamSchema],
  prizePool: Number,
  description: String
},{ collection: 'Tournaments' });

module.exports = mongoose.model('Tournaments', tournamentSchema);
