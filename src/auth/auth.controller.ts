import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import {
  ChangePasswordDto,
  CheckAccountUsingPhoneNo,
  createAccountUsingPhoneNo,
  createAccountUsingEmail,
  createAccountUsingWalletAddress,
  ForgetPasswordDto,
  LoginDto,
  LoginWithMobileDto,
  LoginWithWallet,
  RegisterDto,
  ResetPasswordDto,
  VerifyForgetPasswordDto,
  checkOtp,
  loginVarification,
} from './dto/create-auth.dto';
import { MyAuthGuard, User } from './jwt.strategy';

@Controller("auth")
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  createAccount(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('register_phone')
  createAccountUsingPhoneNo(@Body() registerDto: createAccountUsingPhoneNo) {
    return this.authService.registerUsingMobile(registerDto);
  }

  @Post('register_email')
  createAccountUsingEmail(@Body() registerDto: createAccountUsingEmail) {
    return this.authService.registerUsingEmail(registerDto);
  }

  @Post('login_varification')
  loginVarification(@Body() loginVarificationDto: loginVarification) {
    return this.authService.loginVarification(loginVarificationDto);
  }

  @Post('check_otp')
  checkOtp(@Body() checkOtpDto: checkOtp) {
    return this.authService.checkOTP(checkOtpDto);
  }

  @Post('register_wallet')
  registerUsingWalletAddress(@Body() registerDto: createAccountUsingWalletAddress) {
    return this.authService.registerUsingWalletAddress(registerDto);
  }

  @Post('check_mobile_login')
  check_mobile_login(@Body() registerDto: CheckAccountUsingPhoneNo) {
    return this.authService.check_mobile_login(registerDto);
  }

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('loginwithmobile')
  loginWithMobile(@Body() loginDto: LoginWithMobileDto) {
    return this.authService.loginWithMobile(loginDto);
  }

  @Post('loginUsingWallet')
  loginUsingWalletAddress(@Body() loginDto: LoginWithWallet) {
    return this.authService.loginUsingWalletAddress(loginDto);
  }

  @Post('change-password')
  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  changePassword(@Body() changePasswordDto: ChangePasswordDto, @Req() req) {
    return this.authService.changePassword(
      changePasswordDto,
      req?.user?.payload?.id,
    );
  }
  @Get('me')
  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  me(@Req() req) {
    const id = req?.user?.payload?.id || 1;
    return this.authService.me(id);
  }
  @Post('forget-password-email-send')
  forgetPassword(@Body() forgetPasswordDto: ForgetPasswordDto) {
    return this.authService.forgetPassword(forgetPasswordDto);
  }
  @Post('verify-forget-password-otp')
  verifyForgetPassword(
    @Body() verifyForgetPasswordDto: VerifyForgetPasswordDto,
  ) {
    return this.authService.verifyForgetPasswordToken(verifyForgetPasswordDto);
  }
  // @Post('forget-password')
  // resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
  //   return this.authService.resetPassword(resetPasswordDto);
  // }
}
