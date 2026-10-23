import { Injectable, Inject, ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { IUserRepository, UserEntity } from '../../infrastructure/repositories/interfaces/user-repository.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async findAll(): Promise<Omit<UserEntity, 'passwordHash' | 'refreshTokenHash'>[]> {
    const users = await this.userRepository.findAll();
    return users.map(({ passwordHash, refreshTokenHash, ...safe }) => safe);
  }

  async findById(id: string): Promise<Omit<UserEntity, 'passwordHash' | 'refreshTokenHash'>> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with id '${id}' not found`);
    }
    const { passwordHash, refreshTokenHash, ...safe } = user;
    return safe;
  }

  async create(dto: CreateUserDto): Promise<Omit<UserEntity, 'passwordHash' | 'refreshTokenHash'>> {
    const existing = await this.userRepository.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException(`User with email '${dto.email}' already exists`);
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const newUser = await this.userRepository.create({
      email: dto.email,
      passwordHash,
      firstName: dto.firstName,
      lastName: dto.lastName,
      role: dto.role,
      schoolId: dto.schoolId,
      isActive: true,
    });

    const { passwordHash: _, refreshTokenHash: __, ...safe } = newUser;
    return safe;
  }

  async update(id: string, dto: UpdateUserDto): Promise<Omit<UserEntity, 'passwordHash' | 'refreshTokenHash'>> {
    await this.findById(id);
    const updated = await this.userRepository.update(id, dto);
    const { passwordHash, refreshTokenHash, ...safe } = updated;
    return safe;
  }
}
