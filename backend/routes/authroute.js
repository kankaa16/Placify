import express from 'express';
import { loginUser, registerUser, getCurrentUser, updateUserProfile } from '../controllers/authcontroller.js';
import verifyToken from '../middlewares/verifyToken.js';

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const data = await loginUser(email, password);
    res.json({ message: 'Login successful', data });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});

router.post('/register', async (req, res) => {
  try {
    const data = await registerUser(req.body);
    res.status(201).json({ message: 'Registration successful', data });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await getCurrentUser(req.user.id);
    res.json({ data: { user } });
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

router.put('/profile', verifyToken, async (req, res) => {
  try {
    const updatedUser = await updateUserProfile(req.user.id, req.body);
    res.json({ message: 'Profile updated', data: { user: updatedUser } });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
