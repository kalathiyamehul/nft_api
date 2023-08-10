import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserSchema } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { createParamDecorator } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

export const User = createParamDecorator((data, req) => {
  return req.user;
});

@Injectable()
export class MyAuthGuard extends AuthGuard('jwt') {

  handleRequest(err, user, info) {
    return user;
  }

}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(UserSchema) private userRepository: Repository<UserSchema>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'mysecret',
    });
  }

  async validate(payload: any) {
    return payload;
  }
}
