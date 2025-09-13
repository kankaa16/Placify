import mongoose from 'mongoose';
import Admin from './Admin.js';

const uri = 'mongodb+srv://okay122:okay122@placify.iw3wqdp.mongodb.net/?retryWrites=true&w=majority&appName=placify'; // replace with your URI if different

async function createAdmin() {
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB connected');

    const admin = new Admin('admin.placify@gmail.com', 'admin123');
    const saved = await admin.save();
    console.log('Admin created:', saved);

    mongoose.disconnect();
  } catch (err) {
    console.error('Error creating admin:', err.message);
  }
}

createAdmin();
