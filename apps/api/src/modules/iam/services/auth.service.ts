import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '@workspace/database';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    // 1. Extract email domain (e.g. "student@iiitnr.edu.in" -> "iiitnr.edu.in")
    const domain = dto.email.split('@')[1]?.toLowerCase();
    if (!domain) {
      throw new BadRequestException('Invalid email format');
    }

    // 2. Validate University Tenant exists for this domain
    const university = await this.prisma.university.findUnique({
      where: { emailDomain: domain },
    });

    if (!university) {
      throw new BadRequestException(
        `Your institution domain (@${domain}) is not registered yet. Contact admin to add your campus.`,
      );
    }

    // 3. Check for duplicate email or username
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: dto.email.toLowerCase() }, { username: dto.username.toLowerCase() }],
      },
    });

    if (existingUser) {
      throw new ConflictException('Email or username is already taken');
    }

    // 4. Hash password with bcrypt
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(dto.password, saltRounds);

    // 5. Create User linked to the University
    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        passwordHash,
        username: dto.username.toLowerCase(),
        fullName: dto.fullName,
        branch: dto.branch,
        universityId: university.id,
      },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        role: true,
        universityId: true,
      },
    });

    // 6. Sign JWT Access Token
    const accessToken = await this.generateToken(user.id, user.email, user.role, user.universityId);

    return {
      message: 'Registration successful',
      accessToken,
      user,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const accessToken = await this.generateToken(user.id, user.email, user.role, user.universityId);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        universityId: user.universityId,
      },
    };
  }

  private async generateToken(userId: string, email: string, role: string, universityId: string) {
    return this.jwtService.signAsync({
      sub: userId,
      email,
      role,
      universityId,
    });
  }
}