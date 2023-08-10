import {
  BadRequestException,
  CACHE_MANAGER,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Cache } from 'cache-manager';
import { MailTrigger } from './mail-service/mail-trigger';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import {
  ChangePasswordDto,
  CheckAccountUsingPhoneNo,
  checkOtp,
  createAccountUsingEmail,
  createAccountUsingPhoneNo,
  createAccountUsingWalletAddress,
  ForgetPasswordDto,
  LoginDto,
  loginVarification,
  LoginWithMobileDto,
  LoginWithWallet,
  RegisterDto,
  ResetPasswordDto,
  VerifyForgetPasswordDto,
} from './dto/create-auth.dto';
import { JwtService } from '@nestjs/jwt';
import { RegisterUserSchema, UserSchema } from 'src/users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { getManager, getRepository, Repository } from 'typeorm';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
const referralCodes = require('referral-codes')
var nodemailer = require('nodemailer');

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserSchema) private userRepository: Repository<UserSchema>,
    private jwtService: JwtService,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
    private userService: UsersService,
  ) { }
  queryManager = getManager()
  registerUserRepository = getRepository(RegisterUserSchema);

  async register(createUserInput: RegisterDto) {
    if (createUserInput?.password)
      createUserInput.password = await bcrypt.hash(createUserInput.password, 10);
    try {

      createUserInput.email = createUserInput?.email?.toLowerCase();
      createUserInput.username = createUserInput?.username?.toLowerCase();

      // const token = referralCodes.generate({
      //   prefix: user?.phone,
      //   postfix: '2022',
      // });
      var query = `select * from users where 
      email='${createUserInput?.email}' limit 1`
      var userIfemail = await this.queryManager.query(query);

      query = `select * from users where 
      username='${createUserInput?.username}' limit 1`
      var userIfUsername = await this.queryManager.query(query);

      if (userIfemail[0]) {
        throw new BadRequestException({
          statusCode: 400,
          message: 'email already exist.',
          token: '',
          user: '',
        }).getResponse();
      }
      if (userIfUsername[0]) {
        throw new BadRequestException({
          statusCode: 400,
          message: 'username is already in use.',
          token: '',
          user: '',
        }).getResponse();
      }
      const user = await this.userService.create(createUserInput);
      const payload = { id: user.id };
      const accessToken = this.jwtService.sign({ payload });
      return {
        statusCode: 200,
        token: accessToken,
        user: user,
        message: 'Signup Successfully',
      };
    } catch (error) {
      return error;
    }
  }
  async registerUsingMobile(createUserInput: createAccountUsingPhoneNo) {
    if (createUserInput?.password)
      createUserInput.password = await bcrypt.hash(createUserInput.password, 10);
    try {

      createUserInput.phone = createUserInput?.phone?.toLowerCase();
      createUserInput.country_code = createUserInput?.country_code?.toLowerCase();

      var query = `select * from users where 
      phone='${createUserInput?.phone}' AND status = true limit 1`
      var userIfemail = await this.queryManager.query(query);

      if (userIfemail[0]) {
        throw new BadRequestException({
          statusCode: 400,
          message: 'Phone already in Use.',
          token: '',
          user: '',
        }).getResponse();
      }
      const user = await this.userService.createUsingPhone(createUserInput);
      const payload = { id: user.id };
      const accessToken = this.jwtService.sign({ payload });
      return {
        statusCode: 200,
        token: accessToken,
        user: user,
        message: 'Signup Successfully',
      };
    } catch (error) {
      return error;
    }
  }
  async registerUsingEmail(createUserInput: createAccountUsingEmail) {
    if (createUserInput?.password)
      createUserInput.password = await bcrypt.hash(createUserInput.password, 10);
    try {
      createUserInput.email = createUserInput?.email?.toLowerCase();
      var query = `select * from users where 
      email='${createUserInput?.email}' AND status = true limit 1`
      var userIfemail = await this.queryManager.query(query);

      if (userIfemail[0]) {
        throw new BadRequestException({
          statusCode: 400,
          message: 'Email already in Use.',
          token: '',
          user: '',
        }).getResponse();
      }
      const user = await this.createUsingEmail(createUserInput);
      return {
        statusCode: 200,
        user: user,
        message: 'Signup Successfully',
      };
    } catch (error) {
      return error;
    }
  }

  async createUsingEmail(createUserDto: createAccountUsingEmail) {
    const otp = Math.floor(100000 + Math.random() * 900000);
    const user = new RegisterUserSchema();
    user.email = createUserDto.email;
    user.password = createUserDto.password;
    user.username = createUserDto.username;
    user.full_name = createUserDto.name;
    user.firebaseUID = createUserDto.firebaseUID;
    user.professional_summery = "";
    user.otp = otp;
    this.sendEmail('REGISTRATION', createUserDto.email, otp, createUserDto.name);
    var query = `select * from public."registerUsers" where email='${createUserDto.email}' limit 1`
    var userIfemail = await this.queryManager.query(query);
    if (userIfemail.length > 0) {
      const finaluser = await this.registerUserRepository.update(
        userIfemail[0]?.id,
        { firebaseUID: createUserDto.firebaseUID, otp: otp },
      );
      delete user.otp;
      return user;
    }
    else {
      const finaluser = await this.registerUserRepository.save(user).catch((err) => {
        console.log(err);
        return err;
      });
      return user;
    }
  }

  async sendEmail(emailType, receiverEmail, otp, name) {
    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env?.OTP_GMAIL_ACCOUNT,
        pass: process.env?.OTP_GMAIL_ACCOUNT_PASSWORD
      }
    });

    var mailOptions = {
      from: process.env?.OTP_GMAIL_ACCOUNT,
      to: receiverEmail,
      subject: 'Account Varification',
      html: `<div style="font-family: Helvetica,Arial,sans-serif;overflow:auto;line-height:2">
        <div style="margin:50px auto;width:70%;padding:20px 0">
          <div style="border-bottom:1px solid #eee">
            <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Horizon</a>
          </div>
          <p style="font-size:1.1em">Hi ${name},</p>
          <p>Thank you for choosing <b>Horizon</b>. Use the following OTP to complete your ${emailType === 'REGISTRATION' ? 'Sign Up' : 'LogIn'} procedures. OTP is valid for 2 minutes</p>
          <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${otp}</h2>
          <p style="font-size:0.9em;">Regards,<br />Horizon</p>
          <hr style="border:none;border-top:1px solid #eee" />
          <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
            <p>Horizon Inc</p>
          </div>
        </div>
      </div>`
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
  }

  async loginVarification(loginVarificationDto: loginVarification) {
    const otp = Math.floor(100000 + Math.random() * 900000);
    const { email } = loginVarificationDto;

    const user = await this.userRepository.findOne({ email: email });
    if (user) {
      this.sendEmail('LOGIN', email, otp, user?.first_name);
      await this.userRepository.update(
        { id: user?.id },
        { otp: otp },
      );
      return {
        statusCode: 200,
        user: user,
        message: 'OTP sent Successfully',
      };
    }
    else {
      throw new BadRequestException({
        statusCode: 400,
        message: 'No user found!',
      }).getResponse();
    }
  }
  async checkOTP(checkOtpDto: checkOtp) {
    const user = new UserSchema();
    const { request_type, email, otp, latitude, longitude, fcm_token, device_token } = checkOtpDto;

    if (request_type === 'REGISTRATION') {
      var query = `select * from public."registerUsers" where email='${email}' limit 1`
      var userIfemail = await this.queryManager.query(query);
      if (userIfemail.length > 0) {
        const regUser = userIfemail[0];
        if (regUser.otp === otp) {
          user.email = email;
          user.password = regUser.password;
          user.username = regUser.username;
          user.first_name = regUser.full_name;
          user.professional_summery = regUser.bio;
          user.firebaseUID = regUser.firebaseUID;
          user.fcm_token = fcm_token;
          user.device_token = device_token;
          user.status = true;
          const token = referralCodes.generate({
            prefix: email,
            postfix: '2022',
          });
          user.referral_token = token[0];
          if (latitude) {
            user.latitude = latitude;
          }
          if (longitude) {
            user.longitude = longitude;
          }
          const finaluser = await this.userRepository.save(user).catch((err) => {
            console.log(err);
            return err;
          });
          const payload = { id: finaluser.id };
          const accessToken = this.jwtService.sign({ payload });
          return {
            statusCode: 200,
            token: accessToken,
            user: finaluser,
            message: 'Signup Successfully',
          };
        }
        else {
          throw new BadRequestException({
            statusCode: 400,
            message: 'Invalid OTP!',
          }).getResponse();
        }
      }
      else {
        throw new BadRequestException({
          statusCode: 400,
          message: 'No user found!',
        }).getResponse();
      }
    }
    // Login Varification
    else {
      const regUser = await this.userRepository.findOne({ email: email });
      if (regUser) {
        if (regUser.otp === otp) {
          const token = referralCodes.generate({
            prefix: email,
            postfix: '2022',
          });
          regUser.referral_token = token[0];
          if (latitude) {
            regUser.latitude = latitude;
          }
          if (longitude) {
            regUser.longitude = longitude;
          }
          if (fcm_token) {
            regUser.fcm_token = fcm_token;
          }
          if (device_token) {
            regUser.device_token = device_token;
          }
          await this.userRepository.update(
            { id: regUser?.id },
            { ...regUser, otp: 0 },
          );
          const payload = { id: regUser?.id };
          const accessToken = this.jwtService.sign({ payload });
          return {
            statusCode: 200,
            token: accessToken,
            user: regUser,
            message: 'Signup Successfully',
          };
        }
        else {
          throw new BadRequestException({
            statusCode: 400,
            message: 'Invalid OTP!',
          }).getResponse();
        }
      }
      else {
        throw new BadRequestException({
          statusCode: 400,
          message: 'No user found!',
        }).getResponse();
      }
    }
  }
  async registerUsingWalletAddress(createUserInput: createAccountUsingWalletAddress) {
    try {

      createUserInput.walletAddress = createUserInput?.walletAddress?.toLowerCase();
      var query = `select * from users where 
      "walletAddress"='${createUserInput?.walletAddress}' limit 1`
      var userIfwalletAddress = await this.queryManager.query(query);

      if (userIfwalletAddress[0]) {
        const user = await this.userRepository
          .createQueryBuilder("users")
          .leftJoin('users.nfts', 'nfts')
          .addSelect(['nfts.id', "nfts.name", "nfts.image_url", "nfts.auction_iscreated", "nfts.nft_is_minted"])
          .leftJoin('users.collections', 'collections')
          .addSelect(['collections.id', "collections.collection_name",
            "collections.collection_logo_image"])
          .where(`users.walletAddress=:walletAddress`, {
            walletAddress: createUserInput?.walletAddress,
          })
          .getOne();
        if (user) {
          const { id } = user;
          const payload = { id };
          const accessToken = this.jwtService.sign({ payload });
          if (user.status) {
            return {
              statusCode: 200,
              user: user,
              token: accessToken,
              message: 'LoggedIn Successfully New',
            };
          } else {
            throw new BadRequestException({
              statusCode: 401,
              message: 'User is not active.',
            }).getResponse();
          }
        }
      } else {
        const user = await this.userService.createUsingWalletAddress(createUserInput);
        const payload = { id: user.id };
        const accessToken = this.jwtService.sign({ payload });
        return {
          statusCode: 200,
          token: accessToken,
          user: user,
          message: 'Signup Successfully',
        };
      }

    } catch (error) {
      return error;
    }
  }
  async loginUsingWalletAddress(loginInput: LoginWithWallet) {
    const user = await this.userRepository
      .createQueryBuilder("users")
      .leftJoin('users.nfts', 'nfts')
      .addSelect(['nfts.id', "nfts.name", "nfts.image_url", "nfts.auction_iscreated", "nfts.nft_is_minted"])
      .leftJoin('users.collections', 'collections')
      .addSelect(['collections.id', "collections.collection_name",
        "collections.collection_logo_image"])
      .where(`users.walletAddress=:walletAddress`, {
        walletAddress: loginInput?.walletAddress,
      })
      .getOne();

    if (user) {
      const { id } = user;
      const payload = { id };
      const accessToken = this.jwtService.sign({ payload });
      if (user.status) {
        return {
          statusCode: 200,
          user: user,
          token: accessToken,
          message: 'LoggedIn Successfully',
        };
      } else {
        throw new BadRequestException({
          statusCode: 401,
          message: 'User is not active.',
        }).getResponse();
      }
    }
    else {
      throw new NotFoundException({
        statusCode: 404,
        message: 'User Not found.',
      }).getResponse();
    }
  }
  async check_mobile_login(createUserInput: CheckAccountUsingPhoneNo) {
    try {
      var query = `select * from users where 
      phone='${createUserInput?.phone}' AND status = true limit 1`
      var userIfemail = await this.queryManager.query(query);
      if (userIfemail[0]) {
        const payload = { id: userIfemail[0].id };
        const accessToken = this.jwtService.sign({ payload });
        throw new BadRequestException({
          statusCode: 400,
          message: 'Phone already in Use.',
          data: true,
          token: accessToken,
          user: userIfemail[0]
        }).getResponse();
      }
      {
        return {
          statusCode: 200,
          data: false,
          message: 'Phone is not registered.',
        };
      }
    } catch (error) {
      return error;
    }
  }
  async loginWithMobile(loginInput: LoginWithMobileDto) {
    const user = await this.userRepository
      .createQueryBuilder("users")
      // .leftJoin('users.nfts', 'nfts')
      // .addSelect(['nfts.id', "nfts.name", "nfts.image_url", "nfts.auction_iscreated", "nfts.nft_is_minted"])
      // .leftJoin('users.reels', 'reels')
      // .addSelect(['reels.id', "reels.title", "reels.video_url", "reels.thumbnail_url"])
      // .leftJoin('users.collections', 'collections')
      // .addSelect(['collections.id', "collections.collection_name",
      //   "collections.collection_logo_image"])

      // .leftJoin('users.stories', 'stories')
      // .addSelect(['stories.id', "stories.latitude",
      //   "stories.longitude", "stories.image_url", "stories.caption"])

      // .leftJoin('users.illustrations', 'illustrations')
      // .addSelect(['illustrations.id', "illustrations.latitude",
      //   "illustrations.longitude", "illustrations.actual_latitude", "illustrations.actual_longitude"])


      // .leftJoin('users.futurevisites', 'futurevisites')
      // .addSelect(['futurevisites.id', "futurevisites.latitude",
      //   "futurevisites.priority", "futurevisites.expected_date"])
      .where(`users.phone=:phone`, {
        phone: loginInput?.phone,
      })
      .andWhere(`users.status=:status`, {
        status: true
      })
      .getOne();

    if (user) {
      const { id } = user;
      const payload = { id };
      const accessToken = this.jwtService.sign({ payload });

      if (user.status) {
        if (await bcrypt.compare(loginInput.password, user.password)) {

          if (loginInput?.fcm_token) {
            user.fcm_token = loginInput?.fcm_token;
            await this.userRepository.save(user);
          }
          if (loginInput?.device_token) {
            user.device_token = loginInput?.device_token;
            await this.userRepository.save(user);
          }
          return {
            statusCode: 200,
            user: user,
            token: accessToken,
            message: 'LoggedIn Successfully',
          };
        } else {
          throw new UnauthorizedException({
            statusCode: 401,
            message: 'Enter Valid Username/Password.',
          }).getResponse();
        }
      } else {
        throw new BadRequestException({
          statusCode: 401,
          message: 'User is not active.',
        }).getResponse();
      }
    } else {
      throw new NotFoundException({
        statusCode: 404,
        message: 'User Not found.',
      }).getResponse();
    }
  }
  async login(loginInput: LoginDto) {
    const user = await this.userRepository
      .createQueryBuilder("users")
      // .leftJoin('users.nfts', 'nfts')
      // .addSelect(['nfts.id', "nfts.name", "nfts.image_url", "nfts.auction_iscreated", "nfts.nft_is_minted"])
      // .leftJoin('users.reels', 'reels')
      // .addSelect(['reels.id', "reels.title", "reels.video_url", "reels.thumbnail_url"])
      // .leftJoin('users.collections', 'collections')
      // .addSelect(['collections.id', "collections.collection_name",
      //   "collections.collection_logo_image"])

      // .leftJoin('users.stories', 'stories')
      // .addSelect(['stories.id', "stories.latitude",
      //   "stories.longitude", "stories.image_url", "stories.caption"])

      // .leftJoin('users.illustrations', 'illustrations')
      // .addSelect(['illustrations.id', "illustrations.latitude",
      //   "illustrations.longitude", "illustrations.actual_latitude", "illustrations.actual_longitude"])


      // .leftJoin('users.futurevisites', 'futurevisites')
      // .addSelect(['futurevisites.id', "futurevisites.latitude",
      //   "futurevisites.priority", "futurevisites.expected_date"])
      .where(`users.email=:userId`, {
        userId: loginInput?.email,
      })
      .getOne();

    if (user) {
      const { id } = user;
      const payload = { id };
      const accessToken = this.jwtService.sign({ payload });

      if (user.status) {
        if (await bcrypt.compare(loginInput.password, user.password)) {
          return {
            statusCode: 200,
            user: user,
            token: accessToken,
            message: 'LoggedIn Successfully',
          };
        } else {
          throw new UnauthorizedException({
            statusCode: 401,
            message: 'Enter Valid Username/Password.',
          }).getResponse();
        }
      } else {
        throw new BadRequestException({
          statusCode: 401,
          message: 'User is not active.',
        }).getResponse();
      }
    } else {
      throw new NotFoundException({
        statusCode: 404,
        message: 'User Not found.',
      }).getResponse();
    }
  }

  async changePassword(changePasswordInput: ChangePasswordDto, id: number) {
    if (changePasswordInput?.isForgotPassword != true && changePasswordInput.newPassword == changePasswordInput.oldPassword) {
      throw new BadRequestException({
        statusCode: 400,
        message: 'Please Enter Diffrent Password',
      }).getResponse();
    }
    if (id) {
      const user = await this.userRepository.findOne({ id });
      if (user) {
        if (changePasswordInput?.isForgotPassword == true || await bcrypt.compare(changePasswordInput.oldPassword, user.password)) {
          const passwordnew = await bcrypt.hash(changePasswordInput.newPassword, 10);
          user.password = passwordnew;
          await this.userRepository.save(user);
          return {
            statusCode: 200,
            message: 'Password change successful',
          };
        } else {
          throw new UnauthorizedException({
            statusCode: 401,
            message: 'Enter Valid Old Password.',
          }).getResponse();
        }
      } else {
        throw new NotFoundException({
          statusCode: 404,
          message: 'User Not found',
        }).getResponse();
      }
    }
  }
  async forgetPassword(forgetPasswordInput: ForgetPasswordDto) {
    const user = await this.userRepository.findOne({
      email: forgetPasswordInput.email,
    });
    if (user) {
      await this.changePasswordGenerateOTP(forgetPasswordInput); //send email
      return {
        statusCode: 200,
        message: 'Mail Send Successfully',
      };
    } else {
      return {
        statusCode: 404,
        message: 'User not found',
      };
    }
  }
  async verifyForgetPasswordToken(
    verifyForgetPasswordTokenInput: VerifyForgetPasswordDto,
  ) {
    const user = await this.userRepository.findOne({
      email: verifyForgetPasswordTokenInput.email,
    });
    if (user) {
      return this.changePasswordCompareOTP(
        verifyForgetPasswordTokenInput,
        user,
      );
    } else {
      return {
        statusCode: 404,
        message: 'User not found',
      };
    }
  }
  async resetPassword(resetPasswordInput: ResetPasswordDto) {
    const user = await this.userRepository.findOne({
      email: resetPasswordInput.email,
    });
    if (user) {
      const passwordnew = await bcrypt.hash(resetPasswordInput.password, 10);
      user.password = passwordnew;
      await this.userRepository.save(user);
      return {
        statusCode: 200,
        message: 'Password change successful',
      };
    } else {
      throw new NotFoundException({
        statusCode: 404,
        message: 'User not found',
      }).getResponse();
    }
  }

  async me(id: number) {
    const user = await this.userRepository
      .createQueryBuilder("users")
      .loadRelationCountAndMap('users.postCount', 'users.posts')
      .loadRelationCountAndMap('users.nftCount', 'users.nfts')
      .loadRelationCountAndMap('users.reelCount', 'users.reels')
      .loadRelationCountAndMap('users.collectionCount', 'users.collections')
      // .leftJoin('users.nfts', 'nfts')
      // .addSelect(['nfts.id',
      //   "nfts.name",
      //   "nfts.image_url",
      //   "nfts.auction_iscreated",
      //   "nfts.nft_is_minted"])

      // .leftJoin('users.reels', 'reels')
      // .addSelect(['reels.id', "reels.title", "reels.video_url", "reels.thumbnail_url"])

      // .leftJoin('users.collections', 'collections')
      // .addSelect(['collections.id', "collections.collection_name",
      //   "collections.collection_logo_image"])

      .leftJoin('users.stories', 'stories')
      .addSelect(['stories.id', "stories.latitude",
        "stories.longitude", "stories.image_url", "stories.caption", "stories.status"])

      .where(`users.id = :id`, {
        id: id
      })
      .cache(true)
      .getOne();
    return user;
  }

  private async getCache(id: string): Promise<any> {
    return this.cacheManager.get(id);
  }

  private async setCache(id: string, value: any): Promise<void> {
    await this.cacheManager.set(id, value, { ttl: 300 });
  }

  private generateOTP(): number {
    return Math.floor(Math.random() * 1000000);
  }
  async changePasswordGenerateOTP(forgetPasswordInput: ForgetPasswordDto) {
    const { email } = forgetPasswordInput;
    const user = await this.userRepository.findOne({
      email: email,
    });
    if (!user) {
      throw new NotFoundException({
        statusCode: 404,
        message: 'User not found',
      }).getResponse();
    }
    const otp: number = this.generateOTP();
    const mailTrigger = new MailTrigger({
      name: "User",
      email: user.email,
      otp: otp,
    });
    const info: SMTPTransport.SentMessageInfo = await mailTrigger.sendMail();
    await this.setCache(user.email, otp);
  }
  async changePasswordCompareOTP(otpDto: VerifyForgetPasswordDto, user) {
    const { otp } = otpDto;
    const cacheValue: any = await this.getCache(user.email);
    if (!cacheValue) {
      throw new NotFoundException({
        statusCode: 400,
        message: 'OTP Expired',
      }).getResponse();
    } else if (+cacheValue !== +otp) {
      throw new NotFoundException({
        statusCode: 400,
        message: "OTP doesn't match.",
      }).getResponse();
    } else {
      if (user) {
        const passwordnew = await bcrypt.hash(otpDto.password, 10);
        user.password = passwordnew;
        await this.userRepository.save(user);
        return {
          statusCode: 200,
          message: 'Password change successful',
        };
      } else {
        throw new NotFoundException({
          statusCode: 404,
          message: 'User not found',
        }).getResponse();
      }
    }
  }
}
