const mongoose = require('mongoose');

const TournamentSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  name: { type: String, required: true },
  game: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  location: { type: String, required: true },
  teams: [
    {
      id: { type: Number, required: true },
      name: { type: String, required: true }
    }
  ],
  prizePool: { type: Number, required: true },
  description: { type: String, required: true }
},{ collection: 'Tournaments' });

module.exports = mongoose.model('Tournaments', TournamentSchema);