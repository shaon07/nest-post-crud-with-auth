import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty({ message: 'Please provide an email.' })
  @IsEmail({}, { message: 'Invalid email. Please provide a valid email address.' })
  email: string;

  @IsNotEmpty({ message: 'Please enter a password' })
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  @MaxLength(20, { message: 'Password must not be greater than 20 characters' })
  password: string;

  @IsNotEmpty({ message: 'Please enter a username' })
  @MinLength(3, { message: 'Username must be at least 3 characters' })
  @MaxLength(20, { message: 'Username must not be greater than 20 characters' })
  @IsString({ message: 'Invalid username' })
  username: string;
}
