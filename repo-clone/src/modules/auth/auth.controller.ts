import {
  Controller,
  Post,
  Body,
  Get,
  Request,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    const { token, user } = await this.authService.register(registerDto);
    return {
      success: true,
      data: { token, user },
      metadata: { timestamp: new Date().toISOString() },
    };
  }

  @ApiOperation({ summary: 'Login a user' })
  @ApiResponse({ status: 200, description: 'User logged in successfully' })
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const { token, user } = await this.authService.login(loginDto);
    return {
      success: true,
      data: { token, user },
      metadata: { timestamp: new Date().toISOString() },
    };
  }

  @ApiOperation({ summary: 'Make a user an admin (admin only)' })
  @ApiResponse({ status: 200, description: 'User role updated to admin' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('make-admin')
  async makeAdmin(@Body('email') email: string) {
    const user = await this.authService.makeAdmin(email);
    return {
      success: true,
      data: user,
      metadata: { timestamp: new Date().toISOString() },
    };
  }

  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    const user = await this.authService.getProfile(req.user.userId);
    return {
      success: true,
      data: user,
      metadata: { timestamp: new Date().toISOString() },
    };
  }
}
