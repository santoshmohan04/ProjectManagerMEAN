import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { UserRepository } from './user.repository.js';
import { IUser, UserRole } from '../../models/user.model.js';
import { signupSchema, loginSchema, LoginInput, SignupInput } from './user.validation.js';
import { JWTUtils } from '../../utils/jwt.utils.js';

export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async getAllUsers(searchKey?: string, sortKey?: string, activeOnly: boolean = false): Promise<IUser[]> {
    return this.userRepository.findAll(searchKey, sortKey, activeOnly);
  }

  async getActiveUsers(): Promise<IUser[]> {
    return this.userRepository.findActiveUsers();
  }

  async getUserById(id: string): Promise<IUser | null> {
    return this.userRepository.findById(id);
  }

  async getUserByUuid(uuid: string): Promise<IUser | null> {
    return this.userRepository.findByUuid(uuid);
  }

  async getUserByEmail(email: string): Promise<IUser | null> {
    return this.userRepository.findByEmail(email);
  }

  async getUserByEmployeeId(employeeId: string): Promise<IUser | null> {
    return this.userRepository.findByEmployeeId(employeeId);
  }

  async getUsersByRole(role: UserRole): Promise<IUser[]> {
    return this.userRepository.findByRole(role);
  }

  async createUser(userData: Partial<IUser>): Promise<IUser> {
    // Check if email already exists
    const existingUser = await this.userRepository.findByEmail(userData.email!);
    if (existingUser) {
      throw new Error('Email already exists');
    }

    // Check if employeeId already exists (if provided)
    if (userData.employeeId) {
      const existingEmployee = await this.userRepository.findByEmployeeId(userData.employeeId);
      if (existingEmployee) {
        throw new Error('Employee ID already exists');
      }
    }

    return this.userRepository.create(userData);
  }

  async updateUser(id: string, userData: Partial<IUser>): Promise<IUser | null> {
    // Check email uniqueness if email is being updated
    if (userData.email) {
      const existingUser = await this.userRepository.findByEmail(userData.email);
      if (existingUser && (existingUser._id as mongoose.Types.ObjectId).toString() !== id) {
        throw new Error('Email already exists');
      }
    }

    // Check employeeId uniqueness if being updated
    if (userData.employeeId) {
      const existingEmployee = await this.userRepository.findByEmployeeId(userData.employeeId);
      if (existingEmployee && (existingEmployee._id as mongoose.Types.ObjectId).toString() !== id) {
        throw new Error('Employee ID already exists');
      }
    }

    return this.userRepository.update(id, userData);
  }

  async updateUserByUuid(uuid: string, userData: Partial<IUser>): Promise<IUser | null> {
    return this.userRepository.updateByUuid(uuid, userData);
  }

  async deleteUser(id: string): Promise<boolean> {
    return this.userRepository.delete(id);
  }

  async softDeleteUser(id: string): Promise<IUser | null> {
    return this.userRepository.softDelete(id);
  }

  async updateLastLogin(uuid: string): Promise<IUser | null> {
    return this.userRepository.updateLastLogin(uuid);
  }

  async authenticateUser(email: string, passwordHash: string): Promise<IUser | null> {
    const user = await this.userRepository.findByEmail(email);
    if (!user || !user.isActive) {
      return null;
    }

    // In a real implementation, you'd compare hashed passwords
    // For now, we'll assume passwordHash is already verified
    if (user.passwordHash === passwordHash) {
      await this.updateLastLogin(user.uuid);
      return user;
    }

    return null;
  }

  /**
   * Signup a new user with validation, password hashing, and JWT token generation
   */
  async signup(userData: SignupInput): Promise<{
    user: IUser;
    accessToken: string;
    refreshToken: string;
  }> {
    // Validate input data
    const validatedData = signupSchema.parse(userData);

    // Check if email already exists
    const existingUser = await this.userRepository.findByEmail(validatedData.email);
    if (existingUser) {
      throw new Error('Email already exists');
    }

    // Check if employeeId already exists (if provided)
    if (validatedData.employeeId) {
      const existingEmployee = await this.userRepository.findByEmployeeId(validatedData.employeeId);
      if (existingEmployee) {
        throw new Error('Employee ID already exists');
      }
    }

    // Hash the password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(validatedData.password, saltRounds);

    // Create user data
    const newUserData: Partial<IUser> = {
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      email: validatedData.email,
      employeeId: validatedData.employeeId,
      passwordHash,
      role: UserRole.USER, // Default role for new users
      isActive: true,
      tokenVersion: 1, // Initialize token version for refresh token rotation
    };

    // Create the user
    const user = await this.userRepository.create(newUserData);

    // Generate JWT tokens
    const tokens = JWTUtils.generateTokenPair({
      _id: user._id as mongoose.Types.ObjectId,
      email: user.email,
      role: user.role,
      tokenVersion: user.tokenVersion,
    });

    // Store refresh token hash in database
    const refreshTokenHash = await bcrypt.hash(tokens.refreshToken, saltRounds);
    await this.userRepository.updateRefreshToken((user._id as mongoose.Types.ObjectId).toString(), refreshTokenHash);

    return {
      user,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  /**
   * Login user with email and password, returning JWT tokens
   */
  async login(credentials: LoginInput): Promise<{
    user: {
      uuid: string;
      firstName: string;
      lastName: string;
      email: string;
      employeeId?: string;
      role: UserRole;
      isActive: boolean;
      lastLogin?: Date;
      createdAt: Date;
      updatedAt: Date;
    };
    accessToken: string;
    refreshToken: string;
  }> {
    // Validate input data
    const validatedData = loginSchema.parse(credentials);

    // Find user by email
    const user = await this.userRepository.findByEmail(validatedData.email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new Error('Account is deactivated');
    }

    // Compare password with bcrypt
    const isPasswordValid = await bcrypt.compare(validatedData.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Update last login
    await this.updateLastLogin(user.uuid);

    // Generate JWT tokens
    const tokens = JWTUtils.generateTokenPair({
      _id: user._id as mongoose.Types.ObjectId,
      email: user.email,
      role: user.role,
      tokenVersion: user.tokenVersion,
    });

    // Store refresh token hash in database
    const saltRounds = 12;
    const refreshTokenHash = await bcrypt.hash(tokens.refreshToken, saltRounds);
    await this.userRepository.updateRefreshToken((user._id as mongoose.Types.ObjectId).toString(), refreshTokenHash);

    // Return sanitized user data (exclude passwordHash and refreshToken)
    const sanitizedUser = {
      uuid: user.uuid,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      employeeId: user.employeeId,
      role: user.role,
      isActive: user.isActive,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return {
      user: sanitizedUser,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }
}