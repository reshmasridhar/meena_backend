const express = require('express');
const cors=require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = express();

// Connect to MongoDB
mongoose.connect('mongodb+srv://reshmas21it:Reshma@cluster0.t6xawj3.mongodb.net/?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});


app.use(cors());
app.use(bodyParser.json());



 

  const User = mongoose.model('User', {
    
    username: String,
    email: String,
    password: String,
    contactNumber: String,
    
  });
  // Define the Appointment schema and model
const Appointment = mongoose.model('Appointment', {
  doctorName: String,
  patientName: String,
  patientEmail: String,
  appointmentDate: Date,
  selectedSlot: String,
});
 
 
    
  app.post('/signup', async (req, res) => {
    const {
      
      username,   
      email,
      password,
      contactNumber,
    } = req.body;

    try {


      if (!username || !email || !password || !contactNumber ) {
        return res.status(400).json({ message: 'Please fill in all fields' });
      }

      const newUser = new User({
        
        username,
        email,
        password,
        contactNumber,
      });

    
      await newUser.save();

      
      res.status(201).json({ message: 'Registration successful!' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post('/Patientlogin', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const user = await User.findOne({ email });
      if (!user ) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
      
      if (password !== user.password) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
  
      // Create and send a JWT token for successful login
      const token = jwt.sign({ userId: user._id }, 'your-secret-key', {
        expiresIn: '1h', // You can adjust the token expiration time
      });
  
      res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  app.post('/appointments', async (req, res) => {
    const { doctorName, patientName,patientEmail, appointmentDate, selectedSlot } = req.body;
  
    try {
      const appointment = new Appointment({
        doctorName,
        patientName,
        patientEmail,
        appointmentDate,
        selectedSlot,
      });
  
      const savedAppointment = await appointment.save();
      res.json(savedAppointment);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error saving appointment' });
    }
  });
  app.get('/getUserDetails', async (req, res) => {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, 'your-secret-key');
      const user = await User.findById(decoded.userId);
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      res.json(user);
    } catch (error) {
      res.status(401).json({ message: 'Unauthorized' });
    }
  });
  app.get('/bookings', async (req, res) => {
    const { email } = req.query;
    try {
      const bookings = await Appointment.find({ patientEmail: email });
      res.json(bookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      res.status(500).json({ error: 'Error fetching bookings' });
    }
  });
  app.get('/myAppointments', async (req, res) => {
    try {
      // Extract the user's email from the JWT token
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, 'your-secret-key');
      const userEmail = (await User.findById(decoded.userId)).email;
  
      // Query the appointments for the specific patient using their email
      const appointments = await Appointment.find({ patientEmail: userEmail });
  
      res.json(appointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      res.status(500).json({ error: 'Error fetching appointments' });
    }
  });

  app.get('/Patientlogin',(req,res)=>{});
  app.get('/About',(req,res)=>{});
  app.get('/Displaydoc',(req,res)=>{});
  app.get('/DoctorSearch',(req,res)=>{});
  app.get('/PatientPage',(req,res)=>{});
  app.get('/PatientSignup',(req,res)=>{});
  app.get('/myAppointmentNew', (req,res)=>{});
  app.get('/OurDoctors', (req,res)=>{});
  app.get('/AllDoctors', async (req, res) => {
    try {
      // Fetch the list of all doctors from your database or data source
      // Replace this with the actual code to fetch doctors' data
      const allDoctors = await Doctor.find(); // Replace Doctor with your actual model
  
      res.json(allDoctors);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      res.status(500).json({ error: 'Error fetching doctors' });
    }
  });

  

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });