import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { PrismaClient } from '@prisma/client';
import { LoginUserDto, RegisterUserDto } from './dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload.interfaces';
import { envs } from 'src/config/envs';
import { TokenPayload } from './interfaces/token-payload.interfaces';

@Injectable()
export class AuthService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly jwtService: JwtService) {
    super();
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('MongoDB connected');
  }

  async signJWT(payload: JwtPayload) {
    const { id, email, name } = payload;
    return this.jwtService.signAsync({ id, email, name });
  }

  async registerUser(registerUserDto: RegisterUserDto) {
    try {
      const { name, email, password } = registerUserDto;
      // Check if the user already exists
      const existingUser = await this.user.findFirst({
        where: { email },
      });

      if (existingUser) {
        throw new RpcException({
          status: 400,
          message: 'User already exists',
        });
      }

      const user = await this.user.create({
        data: {
          name,
          email,
          password: await bcrypt.hash(password, 10),
        },
        omit: { password: true },
      });

      return { user, token: await this.signJWT(user) };
    } catch (error) {
      throw new RpcException({
        status: 400,
        message: error.message,
      });
    }
  }

  async loginUser(registerUserDto: LoginUserDto) {
    try {
      const { email, password } = registerUserDto;
      // Check if the user already exists
      const user = await this.user.findFirst({
        where: { email },
      });

      if (!user) {
        throw new RpcException({
          status: 400,
          message: 'User/Password not valid',
        });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        throw new RpcException({
          status: 400,
          message: 'User/Password not valid',
        });
      }

      const { password: __, ...rest } = user;

      return {
        user: rest,
        token: await this.signJWT(rest),
      };

      // return { user, token: 'ABC' };
    } catch (error) {
      throw new RpcException({
        status: 400,
        message: error.message,
      });
    }
  }

  async verifyUser(token: string) {
    try {
      const { id, email, name } = this.jwtService.verify<TokenPayload>(token, {
        secret: envs.jwtSecret,
      });

      const user = { id, email, name };

      return { user, token: await this.signJWT(user) };
    } catch {
      throw new RpcException({
        status: 401,
        message: 'Invalid token',
      });
    }
  }
}
