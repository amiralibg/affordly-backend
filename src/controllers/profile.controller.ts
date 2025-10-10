import { Response } from 'express';
import { validationResult } from 'express-validator';
import Profile from '../models/Profile';
import { AuthRequest } from '../middleware/auth';

export const getProfile = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId;

    const profile = await Profile.findOne({ userId }).populate(
      'userId',
      'name email'
    );

    if (!profile) {
      res.status(404).json({ error: 'Profile not found' });
      return;
    }

    res.status(200).json({ profile });
  } catch (error: any) {
    console.error('GetProfile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

export const updateProfile = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const userId = req.userId;
    const { monthlySalary, currency, monthlySavingsPercentage } = req.body;

    let profile = await Profile.findOne({ userId });

    if (!profile) {
      // Create profile if it doesn't exist
      profile = new Profile({
        userId,
        monthlySalary: monthlySalary || 0,
        currency: currency || 'USD',
        monthlySavingsPercentage: monthlySavingsPercentage || 20,
      });
    } else {
      // Update existing profile
      if (monthlySalary !== undefined) profile.monthlySalary = monthlySalary;
      if (currency !== undefined) profile.currency = currency;
      if (monthlySavingsPercentage !== undefined) profile.monthlySavingsPercentage = monthlySavingsPercentage;
    }

    await profile.save();

    res.status(200).json({
      message: 'Profile updated successfully',
      profile,
    });
  } catch (error: any) {
    console.error('UpdateProfile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};
