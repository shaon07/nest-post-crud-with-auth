import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { User } from '../entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'accessToken',
      ignoreExpiration: false,
    });
  }

  async validate(payload: User) {
    const user = await this.authService.getUserByEmail(payload.email);
    if (!user) {
      throw new Error('Invalid credentials');
    }
    return user;
  }
}
