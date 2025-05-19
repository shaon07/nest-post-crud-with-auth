import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { User } from './entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, username } = registerDto;

    const isAlreadyRegistered = await this.userRepository.findOne({
      where: {
        email,
      },
    });

    if (isAlreadyRegistered) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await this.hashPassword(password);

    const user = this.userRepository.create({
      email,
      username,
      password: hashedPassword,
    });

    const savedUser = await this.userRepository.save(user);
    return {
      user: {
        id: savedUser.id,
        username: savedUser.username,
        email: savedUser.email,
        role: savedUser.role,
        createdAt: savedUser.createdAt,
        updatedAt: savedUser.updatedAt,
      },
      message: 'User registered successfully. Please login to access your account',
    }; // return the user without the password inf
  }

  async login(loginDto: LoginDto) {
    const { email } = loginDto;
    const user = await this.userRepository.findOne({
      where: {
        email,
      },
    });

    if (user === null) {
      throw new NotFoundException('User not found with this email');
    }

    const isValidPassword = await this.comparePassword(loginDto.password, user.password);

    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid password. Please try again');
    }

    const { accessToken, refreshToken } = this.generateToken(user);

    await this.userRepository.save({
      ...user,
      refreshToken,
    });

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      accessToken,
      refreshToken,
    };
  }

  async getUserByEmail(email: string) {
    const user = await this.userRepository.findOne({
      where: {
        email,
      },
    });

    if (!user) {
      return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, refreshToken, ...result } = user; // remove password from user object
    return result;
  }

  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  }

  private async comparePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  private generateToken(user: User) {
    const accessToken = this.accessToken(user);
    const refreshToken = this.refreshToken(user);
    return {
      accessToken,
      refreshToken,
    };
  }

  private accessToken(user: User) {
    const payload = {
      userId: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: 'accessToken',
      expiresIn: '30m',
    });

    return accessToken;
  }

  private refreshToken(user: User) {
    const payload = {
      userId: user.id,
    };

    const refreshToken = this.jwtService.sign(payload, {
      secret: 'refreshToken',
      expiresIn: '7d',
    });

    return refreshToken;
  }
}
