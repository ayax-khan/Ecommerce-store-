import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    const useRs = !!process.env.JWT_PUBLIC_KEY;
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: useRs ? process.env.JWT_PUBLIC_KEY?.replace(/\\n/g, '\n') : (process.env.JWT_SECRET || 'devsecret'),
      algorithms: useRs ? ['RS256'] : ['HS256'],
    });
  }

  async validate(payload: any) {
    return { userId: payload.sub, role: payload.role };
  }
}
