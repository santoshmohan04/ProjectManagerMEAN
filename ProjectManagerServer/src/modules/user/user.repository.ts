import { User, IUser, UserRole } from '../../models/user.model.js';

export class UserRepository {
  async findAll(searchKey?: string, sortKey?: string, activeOnly: boolean = false): Promise<IUser[]> {
    const query = activeOnly ? User.findActive() : User.find();

    if (searchKey) {
      query.or([
        { firstName: { $regex: searchKey, $options: 'i' } },
        { lastName: { $regex: searchKey, $options: 'i' } },
        { email: { $regex: searchKey, $options: 'i' } },
      ]);
    }

    if (sortKey) {
      query.sort([[sortKey, 1]]);
    }

    return query.exec();
  }

  async findAllPaginated(options: {
    page: number;
    limit: number;
    sort: string;
    search?: string;
    filter: any;
  }): Promise<IUser[]> {
    const { page, limit, sort, search, filter } = options;
    const skip = (page - 1) * limit;

    let query = User.find(filter);

    if (search) {
      query = query.or([
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ]);
    }

    query = query.sort([[sort, 1]]).skip(skip).limit(limit);

    return query.exec();
  }

  async countUsers(filter: any = {}, search?: string): Promise<number> {
    let query = User.find(filter);

    if (search) {
      query = query.or([
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ]);
    }

    return query.countDocuments().exec();
  }

  async findByUuid(uuid: string): Promise<IUser | null> {
    return User.findOne({ uuid }).exec();
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email }).exec();
  }

  async findActiveUsers(): Promise<IUser[]> {
    return User.findActive().exec();
  }

  async create(userData: Partial<IUser>): Promise<IUser> {
    const user = new User(userData);
    return user.save();
  }

  async updateByUuid(uuid: string, userData: Partial<IUser>): Promise<IUser | null> {
    return User.findOneAndUpdate({ uuid }, userData, { new: true }).exec();
  }

  async deleteByUuid(uuid: string): Promise<boolean> {
    const result = await User.deleteOne({ uuid }).exec();
    return result.deletedCount > 0;
  }

  async softDeleteByUuid(uuid: string): Promise<IUser | null> {
    return User.findOneAndUpdate({ uuid }, { isActive: false }, { new: true }).exec();
  }

  async updateLastLogin(uuid: string): Promise<IUser | null> {
    const user = await User.findOne({ uuid }).exec();
    if (user) {
      return user.updateLastLogin();
    }
    return null;
  }

  async findByRole(role: UserRole): Promise<IUser[]> {
    return User.find({ role, isActive: true }).exec();
  }

  async findByEmployeeId(employeeId: string): Promise<IUser | null> {
    return User.findOne({ employeeId }).exec();
  }

  async updateRefreshTokenByUuid(uuid: string, refreshTokenHash: string): Promise<IUser | null> {
    return User.findOneAndUpdate({ uuid }, { refreshToken: refreshTokenHash }, { new: true }).exec();
  }
}