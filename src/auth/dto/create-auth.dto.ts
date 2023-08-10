import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsDefined, IsNotEmpty, IsString } from "class-validator";
import { CreateUserDto } from "src/users/dto/create-user.dto";

export class RegisterDto extends CreateUserDto { }
export class createAccountUsingPhoneNo {
  @IsDefined()
  @ApiProperty()
  @IsNotEmpty()
  phone: string;

  @IsDefined()
  @ApiProperty()
  @IsNotEmpty()
  country_code: string;

  @IsDefined()
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  password: string

  @ApiPropertyOptional()
  latitude: string;

  @ApiPropertyOptional()
  longitude: string;

  @ApiPropertyOptional()
  referral_token: string

  @ApiPropertyOptional()
  fcm_token: string

  @ApiPropertyOptional()
  device_token: string
}

export class createAccountUsingEmail {
  @IsDefined()
  @ApiProperty()
  @IsNotEmpty()
  email: string;

  @IsDefined()
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  password: string

  @IsDefined()
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  username: string

  @ApiPropertyOptional()
  name: string;

  @ApiPropertyOptional()
  bio: string;

  @ApiPropertyOptional()
  firebaseUID: string;
}
export class loginVarification {
  email: string;
}
export class checkOtp {
  @IsDefined()
  @ApiProperty()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  otp: number

  @ApiProperty()
  request_type: string

  @ApiPropertyOptional()
  latitude: string;

  @ApiPropertyOptional()
  longitude: string;

  @ApiPropertyOptional()
  fcm_token: string

  @ApiPropertyOptional()
  device_token: string
}
export class createAccountUsingWalletAddress {
  @IsDefined()
  @ApiProperty()
  @IsNotEmpty()
  walletAddress: string;

  @ApiPropertyOptional()
  latitude: string;

  @ApiPropertyOptional()
  longitude: string;

}
export class CheckAccountUsingPhoneNo {
  @IsDefined()
  @ApiProperty()
  @IsNotEmpty()
  phone: string;

  @IsDefined()
  @ApiProperty()
  @IsNotEmpty()
  country_code: string;

}

export class LoginDto {
  email: string;
  password: string;
}
export class LoginWithWallet {
  walletAddress: string;
}

export class LoginWithMobileDto {
  phone: string;
  password: string;
  fcm_token: string;
  device_token: string;
}
export class ChangePasswordDto {
  oldPassword: string;
  newPassword: string;
  isForgotPassword: boolean;
}
export class ForgetPasswordDto {
  email: string;
}
export class VerifyForgetPasswordDto {
  email: string;
  otp: string;
  password: string;
}
export class ResetPasswordDto {
  email: string;
  password: string;
}

export class AuthResponse {
  token: string;
  permissions: string[];
}

export class EmailOtpDto {
  otp: string;
}
