import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import User from '../models/User';
import Profile from '../models/Profile';
import { generateToken } from '../utils/jwt';

export const signUp = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { email, password, name } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ error: 'User already exists' });
      return;
    }

    // Create user
    const user = new User({
      email,
      password,
      name,
    });

    await user.save();

    // Create profile for the user
    const profile = new Profile({
      userId: user._id,
    });

    await profile.save();

    // Generate token
    const token = generateToken({
      userId: String(user._id),
      email: user.email,
    });

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
      token,
    });
  } catch (error: any) {
    console.error('SignUp error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
};

export const signIn = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Generate token
    const token = generateToken({
      userId: String(user._id),
      email: user.email,
    });

    res.status(200).json({
      message: 'Signed in successfully',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
      token,
    });
  } catch (error: any) {
    console.error('SignIn error:', error);
    res.status(500).json({ error: 'Failed to sign in' });
  }
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;

    const user = await User.findById(userId).select('-password');
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.status(200).json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      },
    });
  } catch (error: any) {
    console.error('GetMe error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
};
