import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'pune_tour_guide_secret_key';

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email is already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        xp: 150 // Start with some bonus sign-up XP!
      }
    });

    // Pre-seed a default itinerary for the new user so they have a great experience right away
    const day1 = await prisma.itineraryDay.create({
      data: {
        day: 1,
        label: "Day 1 · Sat",
        userId: user.id
      }
    });

    const day2 = await prisma.itineraryDay.create({
      data: {
        day: 2,
        label: "Day 2 · Sun",
        userId: user.id
      }
    });

    // Seed default stops for Day 1 and Day 2
    await prisma.itineraryStop.createMany({
      data: [
        {
          itineraryDayId: day1.id,
          time: "09:00 AM",
          name: "Shaniwar Wada",
          name_mr: "शनिवार वाडा",
          desc: "Explore the primary fortress seat of the Peshwas.",
          desc_mr: "पेशव्यांचे मुख्य ऐतिहासिक निवासस्थान एक्सप्लोर करा.",
          dotColor: "#8B3A2A",
          tags: JSON.stringify([{ label: "Heritage", type: "heritage" }])
        },
        {
          itineraryDayId: day1.id,
          time: "11:30 AM",
          name: "Dagdusheth Halwai Ganpati",
          name_mr: "दगडूशेठ हलवाई गणपती",
          desc: "Pay a visit to the most celebrated golden Ganpati temple in Pune.",
          desc_mr: "पुण्यातील सर्वात प्रसिद्ध सोन्याच्या गणपती मंदिराला भेट द्या.",
          dotColor: "#B87318",
          tags: JSON.stringify([{ label: "Temple", type: "neutral" }])
        },
        {
          itineraryDayId: day2.id,
          time: "08:30 AM",
          name: "Pataleshwar Caves",
          name_mr: "पाताळेश्वर लेणी",
          desc: "Marvel at the ancient 8th-century rock-cut monolithic Shiva shrine.",
          desc_mr: "८ व्या शतकातील प्राचीन पाताळेश्वर शिव मंदिराला भेट द्या.",
          dotColor: "#4A6741",
          tags: JSON.stringify([{ label: "Heritage", type: "heritage" }])
        }
      ]
    });

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        xp: user.xp
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        xp: user.xp
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

export const getUserMe = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      xp: user.xp
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve profile' });
  }
};

export const getUserStats = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = req.user.id;

    // Fetch user details to get actual persistent XP
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const savedCount = await prisma.place.count({ where: { isSaved: true } });
    const discoveredCount = await prisma.place.count({ where: { NOT: { osmId: null } } });
    
    // Count stops completed by this specific user
    const completedStops = await prisma.itineraryStop.count({ 
      where: { 
        done: true,
        itineraryDay: {
          userId: userId
        }
      } 
    });

    // Points calculation: persistent user XP + counts
    const totalPoints = user.xp + (completedStops * 50);

    res.json({
      savedCount,
      discoveredCount,
      completedStops,
      totalPoints
    });
  } catch (error) {
    console.error('Failed to calculate user stats:', error);
    res.status(500).json({ error: 'Failed to calculate user stats' });
  }
};
