import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma.js';
import { LoginSchema, UserRole } from '@sih/shared';

const JWT_SECRET = process.env.JWT_SECRET || 'mord-land-acq-national-secret-key-2024-sih-rfctlarr';

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = LoginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials or inactive official account',
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials or inactive official account',
      });
    }

    const payload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as UserRole,
      designation: user.designation,
      state: user.state,
      district: user.district,
      department: user.department,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });

    return res.json({
      success: true,
      message: 'Authentication successful',
      token,
      user: payload,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getMe(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Unauthenticated' });
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      designation: true,
      state: true,
      district: true,
      department: true,
      phone: true,
      createdAt: true,
    },
  });

  return res.json({
    success: true,
    user,
  });
}
