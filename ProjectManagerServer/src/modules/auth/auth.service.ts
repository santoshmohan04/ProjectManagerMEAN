import bcrypt from 'bcrypt';
import { User, IUser } from '../../models/user.model.js';
import { JWTUtils } from '../../utils/jwt.utils.js';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: Partial<IUser>;
  token: string;
}

export class AuthService {

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    // Find user by email
    const user = await User.findOne({ email: credentials.email });
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new Error('Account is deactivated');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Update last login
    await user.updateLastLogin();

    // Generate JWT token using JWTUtils
    const token = JWTUtils.generateAccessToken({
      userId: user.uuid,
      email: user.email,
      role: user.role
    });

    // Return user data and token
    return {
      user: {
        uuid: user.uuid,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      },
      token
    };
  }

  async register(userData: Partial<IUser> & { password: string }): Promise<AuthResponse> {
    // Check if user already exists
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(userData.password, saltRounds);

    // Create new user
    const newUser = new User({
      ...userData,
      passwordHash,
      isActive: true
    });

    await newUser.save();

    // Generate token using JWTUtils
    const token = JWTUtils.generateAccessToken({
      userId: newUser.uuid,
      email: newUser.email,
      role: newUser.role
    });

    return {
      user: {
        uuid: newUser.uuid,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        role: newUser.role
      },
      token
    };
  }
}