require('dotenv').config();
const axios = require('axios');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const User = require('./models/User'); 
const Transaction = require('./models/Transaction');
const Game = require('./models/games')
const Counter = require('./models/counter'); 
const Tournament = require('./models/tournaments'); 
const jwt = require('jsonwebtoken');
const accountSid = 'ACd5c29eec6964f5746103277fb764467e';
const authToken = 'b27c37e66bc12e969e704b34d3eef930';   

const JWT_SECRET = process.env.JWT_SECRET;

const app = express();
const PORT = 5000;
app.use(express.json());
app.use(cors());

// Apply body-parser JSON parsing to POST and PUT requests only
app.post('*', bodyParser.json({ limit: '1mb' }));
app.put('*', bodyParser.json({ limit: '1mb' }));

// MongoDB connection
const mongoURI = process.env.MONGO_URI; // MongoDB URI from the .env file

mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('MongoDB connected');
    
    // Log database name
    console.log('Connected to DB:', mongoose.connection.name);

    // Log the collections in the database
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections:', collections.map(collection => collection.name));
  })
  .catch(err => console.error('Error connecting to MongoDB:', err));

// Function to send SMS using Fast2SMS
async function sendSMS(otp, phone) {
  try {
    const response = await axios.get('https://www.fast2sms.com/dev/bulkV2', {
      params: {
        authorization: 'JF82yPcou5GKUgkxSEpC7T0YdNOQ1MnjqHmZBXIbvDWaz6shtlrh25sYV4uUjk3FiPaw1eQHMWJOBtRD', // Replace with your Fast2SMS API Key
        route: 'dlt',
        sender_id: 'RKRUN', // Replace with your sender ID if applicable
        message: '169141', // Replace with your DLT template ID
        variables_values: otp,
        flash: 0,
        numbers: phone,
      },
    });
    console.log('SMS Response:', response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error sending SMS:', error.message);
    return { success: false, error: error.message };
  }
}     

app.post('/api/send-otp', async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({ success: false, message: 'Phone number is required' });
  }

  try {
    // Check if the user exists by phone number
    let user = await User.findOne({ phone });

    let otp;
    if (user) {
      // User exists, use existing OTP
      otp = user.activeOtp;
    } else {
      // Generate a new OTP
      otp = Math.floor(100000 + Math.random() * 900000).toString();

      // Fetch or increment the counter for sequential IDs
      let counter = await Counter.findOneAndUpdate(
        { collectionName: 'Users' },
        { $inc: { sequenceValue: 1 } },
        { new: true, upsert: true }
      );

      const newId = counter.sequenceValue.toString().padStart(3, '0'); // Format ID as "001", "002", etc.

      // Create a new user record
      const newUser = new User({
        id: newId,
        phone,
        activeOtp: otp,
        user_type: 'Player',
        wallet_balance: 0,
        hold_balance: 0,
        referral_code: 'REF' + Math.floor(Math.random() * 100000),
        referral_earning: 0,
        avatar: 'https://example.com/images/default-avatar.png',
        lastLogin: new Date(),
        userStatus: 'unblock',
        permissions: ["Create Game", "Join Tournament", "Withdraw Funds"],
        totalDeposit: 0,
        totalWithdrawl: 0,
        misc_amount: 0,
      });

      console.log("New user data before saving:", newUser);
      await newUser.save();
    }

    // Send the OTP using Fast2SMS
    const smsResult = await sendSMS(otp, phone);
    if (!smsResult.success) {
      return res.status(500).json({ success: false, message: 'Failed to send OTP', error: smsResult.error });
    }

    console.log(`OTP sent to ${phone}: ${otp}`);

    // Return success response
    res.json({ success: true, message: 'OTP sent successfully', data: { otp } });
  } catch (err) {
    console.error('Error processing OTP request:', err);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// API to verify OTP
app.post('/api/verify-otp', async (req, res) => {
  const { phone, otp } = req.body;

  // Validate input
  if (!phone || !otp) {
    return res.status(400).json({ success: false, message: 'Phone and OTP are required' });
  }

  try {
    // Find the user by phone
    const user = await User.findOne({ phone });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if the OTP matches
    if (user.activeOtp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    // OTP matches, update lastLogin
    user.lastLogin = new Date();

    // Generate a JWT token
    const token = jwt.sign(
      { userId: user.id, phone: user.phone }, // Payload
      JWT_SECRET, // Secret key
      { expiresIn: '1h' } // Token expiry
    );

    // Save the token in the database
    user.authToken = token;
    await user.save();

    // Respond with success and token
    res.json({
      success: true,
      message: 'OTP verified successfully',
      data: { userId: user.id, token },
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

app.get('/api/users/byId/:id', async (req, res) => {
  const { id } = req.params; 
  console.log('Requested User ID:', id);  

  try {
    // Log the query format to ensure correct data is being passed
    console.log('Querying Database for id:', id);  // Log the id being queried

    // Query the database using 'id' field from your schema
    const user = await User.findOne({ id: id });

    console.log('Query Result:', user);  // Log the result of the query

    if (user) {
      res.status(200).json({ success: true, data: user });
    } else {
      console.log('User not found for id:', id);
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (err) {
    console.error('Error fetching user by id:', err);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

app.put('/api/update-user', async (req, res) => {
  const { id, name, email, user_type, avatar } = req.body;

  // Ensure the `id` is provided
  if (!id) {
    return res.status(400).json({ success: false, message: 'User ID is required' });
  }

  try {
    // Find the user by ID
    let user = await User.findOne({ id });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Update user details
    user.name = name || user.name;           // Update if `name` is provided
    user.email = email || user.email;       // Update if `email` is provided
    user.user_type = user_type || user.user_type; // Update if `user_type` is provided
    user.avatar = avatar || user.avatar;   // Update if `avatar` is provided
    user.lastLogin = new Date();           // Update last login time

    // Save the updated user in the database
    await user.save();

    res.json({ success: true, message: 'User updated successfully', data: user });
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

app.get('/api/transactions', async (req, res) => {
  try {
    // Fetch the first document in the collection (assuming there's only one document)
    const transactions = await Transaction.findOne();

    // Log the fetched data for debugging
    console.log('Fetched data from database:', transactions);

    // Check if data exists and return it; otherwise, respond with "not found"
    if (transactions) {
      res.status(200).json(transactions);
    } else {
      console.log('No transactions found in the database.');
      res.status(404).json({ success: false, message: 'No transactions found' });
    }
  } catch (err) {
    // Log the error and respond with a 500 status code
    console.error('Error fetching transactions:', err);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

app.get('/api/games', async (req, res) => {
  try {
    const games = await Game.findOne(); // Fetch the first document in the collection
    console.log('Fetched games from database:', games);

    if (games) {
      res.status(200).json({ success: true, data: games.data });
    } else {
      res.status(404).json({ success: false, message: 'No games found' });
    }
  } catch (err) {
    console.error('Error fetching games:', err);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

app.get('/api/tournaments', async (req, res) => {
  try {
    const tournaments = await Tournament.find(); // Fetch all tournaments from DB
     console.log(tournaments,'tournaments Data')
    res.status(200).json(tournaments); // Send back the list of tournaments
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving tournaments', error: err });
  }
});

// POST /tournaments - Save a new tournament
app.post('/api/tournaments', async (req, res) => {
  try {
    const newTournament = new Tournament(req.body); // Save request data directly
    const savedTournament = await newTournament.save();
    res.status(201).json({
      message: 'Tournament created successfully',
      data: savedTournament
    });
  } catch (err) {
    res.status(500).json({ message: 'Error creating tournament', error: err.message });
  }
});



// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// app.get('/api/users', async (req, res) => {
//   try {
//     const users = await User.find();
//     res.json({ success: true, data: users });
//   } catch (err) {
//     console.error('Error fetching users:', err);
//     res.status(500).json({ success: false, message: 'Internal Server Error' });
//   }
// });

// app.get('/api/users/:id', async (req, res) => {
//   try {
//     const user = await User.findById(req.params.id);
//     if (!user) {
//       return res.status(404).json({ success: false, message: 'User not found' });
//     }
//     res.json({ success: true, data: user });
//   } catch (err) {
//     console.error('Error fetching user:', err);
//     res.status(500).json({ success: false, message: 'Internal Server Error' });
//   }
// });

// app.post('/api/users', async (req, res) => {
//   try {
//     const newUser = new User(req.body);
//     await newUser.save();
//     res.status(201).json({ success: true, data: newUser });
//   } catch (err) {
//     console.error('Error adding user:', err);
//     res.status(500).json({ success: false, message: 'Internal Server Error' });
//   }
// });

// app.put('/api/users/:id', async (req, res) => {
//   try {
//     const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
//     if (!updatedUser) {
//       return res.status(404).json({ success: false, message: 'User not found' });
//     }
//     res.json({ success: true, data: updatedUser });
//   } catch (err) {
//     console.error('Error updating user:', err);
//     res.status(500).json({ success: false, message: 'Internal Server Error' });
//   }
// });

// app.delete('/api/users/:id', async (req, res) => {
//   try {
//     const deletedUser = await User.findByIdAndDelete(req.params.id);
//     if (!deletedUser) {
//       return res.status(404).json({ success: false, message: 'User not found' });
//     }
//     res.json({ success: true, message: 'User deleted successfully' });
//   } catch (err) {
//     console.error('Error deleting user:', err);
//     res.status(500).json({ success: false, message: 'Internal Server Error' });
//   }
// });
