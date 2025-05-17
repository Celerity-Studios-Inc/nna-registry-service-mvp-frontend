# Comprehensive plan to implement the NNA Registry Service with the help of AI Agents

### April 10, 2025

### Version 1.2.0

###  Status: Final (Ready for Implementation)

# Project Overview

The NNA Registry Service is a crucial component of the NNA Framework for ReViz's AI-powered video remixing platform. It implements a dual addressing system (Human-Friendly Names and NNA Addresses) for digital assets across various layers (Songs, Stars, Looks, Moves, Worlds, etc.). It will be implemented using Nest.js for the backend, React for the frontend, MongoDB for metadata, and GCP Storage for files. The MVP will focus on G, S, L, M, W, P, B,T, R, C layers, with features for asset registration, retrieval, management, authentication, API documentation (Swagger), and error monitoring (Sentry).

## Key Features (MVP Scope)

1. **Asset Registration**: Register assets with proper taxonomy classification
1. **Asset Retrieval**: Look up assets by friendly name or NNA address
1. **Asset Management**: Update, delete, and search for assets
1. **Authentication**: Secure access with JWT-based authentication
1. **Google Drive Integration**: Store and retrieve asset files

# Step 1: Development Environment Setup

Let's start by setting up your development environment on your MacBook Pro:

## 1.1 Install Required Software

1. **Install Node.js and npm**:

```bash
# Open Terminal and run:
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
brew install node
```

1. **Install MongoDB**:

```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
#Verify MongoDB is running:
brew services list
```

1. **Install Google Cloud SDK**

```bash
brew install --cask google-cloud-sdk
#Initialize the SDK
gcloud init
```

1. **Set Up GCP Storage**:
- Create a GCP project in the Google Cloud Console.
- Enable the Cloud Storage API.
- Create a bucket named reviz-assets.
- Create a service account with "Storage Object Admin" permissions.
- Download the JSON key file and save it as google-credentials.json in the project root.

```bash
#Set the environment variable
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/nna-registry-service/google-credentials.json"
```

1. **Install Visual Studio Code**:
    - Download from [https://code.visualstudio.com/](https://code.visualstudio.com/)
    - Install useful extensions: ESLint, Prettier, TypeScript

## 1.2 Create GitHub Repository

1. **Create a new repository on GitHub**:
    - Go to [https://github.com/new](https://github.com/new)
    - Name it "nna-registry-service"
    - Make it private or public as preferred
    - Initialize with a README
1. **Clone the repository to your local machine**:

```bash
git clone https://github.com/yourusername/nna-registry-service.git
cd nna-registry-service
```

1. **Set up branches:**

```bash
git checkout -b dev
```

# Step 2: Project Setup

## 2.1 Initialize Nest.js Project

```bash
# Install Nest CLI globally
npm install -g @nestjs/cli

# Create a new Nest.js project
nest new nna-registry-service --package-manager npm
cd nna-registry-service
```

## 2.2 Install Dependencies

```bash
# Core dependencies
npm install @nestjs/mongoose mongoose @nestjs/config
npm install @nestjs/jwt passport passport-jwt
npm install class-validator class-transformer
npm install @google-cloud/storage
npm install multer @types/multer

# Swagger for API documentation
npm install @nestjs/swagger swagger-ui-express

# Sentry for error tracking
npm install @sentry/node @sentry/tracing

# Development tools
npm install -D eslint prettier
```

## 2.3 Create Project Structure

```
nna-registry-service/
├── src/
│   ├── config/
│   │   ├── swagger.config.ts
│   │   ├── sentry.config.ts
│   │   ├── mongodb.config.ts
│   │   ├── gcp.config.ts
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── dto/
│   │   │   │   ├── login.dto.ts
│   │   │   │   ├── register.dto.ts
│   │   │   ├── guards/
│   │   │   │   ├── jwt-auth.guard.ts
│   │   │   │   ├── roles.guard.ts
│   │   │   ├── strategies/
│   │   │   │   ├── jwt.strategy.ts
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   ├── assets/
│   │   │   ├── dto/
│   │   │   │   ├── create-asset.dto.ts
│   │   │   │   ├── update-asset.dto.ts
│   │   │   │   ├── search-asset.dto.ts
│   │   │   ├── assets.module.ts
│   │   │   ├── assets.controller.ts
│   │   │   ├── assets.service.ts
│   │   ├── storage/
│   │   │   ├── storage.module.ts
│   │   │   ├── storage.service.ts
│   │   ├── taxonomy/
│   │   │   ├── taxonomy.module.ts
│   │   │   ├── taxonomy.service.ts
│   ├── models/
│   │   ├── asset.schema.ts
│   │   ├── user.schema.ts
│   ├── common/
│   │   ├── filters/
│   │   │   ├── http-exception.filter.ts
│   │   ├── interceptors/
│   │   │   ├── logging.interceptor.ts
│   │   ├── utils/
│   │   │   ├── taxonomy.util.ts
│   ├── app.module.ts
│   ├── main.ts
├── taxonomy/
│   ├── enriched_nna_layer_taxonomy_v1.2.json
├── .env
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
```

## 2.4 Configure Environment Variables

1. **Create a `.env` file:**

```bash
touch .env
```

1. **Paste the following into .env:**

```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/nna-registry
JWT_SECRET=your_jwt_secret_key
GCP_PROJECT_ID=your_gcp_project_id
GCP_BUCKET_NAME=your_gcp_bucket_name
SENTRY_DSN=your_sentry_dsn
```

1. **Create a `.env.example` file:**

```bash
touch .env.example
```

1. **Paste the following into .env.example:**

```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/nna-registry
JWT_SECRET=your_jwt_secret_key
GCP_PROJECT_ID=your-project-id
GCP_BUCKET_NAME=reviz-assets
GOOGLE_APPLICATION_CREDENTIALS=/path/to/google-credentials.json
SENTRY_DSN=your_sentry_dsn
```

## 2.5 Configure Git Ignore

Create a `.gitignore` file:

```
# compiled output
/dist
/node_modules

# Logs
logs
*.log

# Environment variables
.env
.env.production

# Google Cloud credentials
google-credentials.json

# OS
.DS_Store

# Tests
/coverage
/.nyc_output

# IDEs and editors
/.idea
.vscode/*
```

# Step 3: Implement Core Models

## 3.1. Database Connection (src/config/db.ts)

1. **Create the file:**

```bash
touch src/config/mongodb.config.ts
```

1. **Paste:**

```typescript
import { MongooseModuleOptions } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';

export const mongooseConfig = (configService: ConfigService): MongooseModuleOptions => ({
  uri: configService.get<string>('MONGODB_URI'),
});
```

## 3.2. Asset Model (src/models/asset.schema.ts)

1. **Create the file:**

```bash
touch src/models/asset.schema.ts
```

1. **Paste:**

```typescript
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Asset extends Document {
  @Prop({ required: true })
  layer: string;

  @Prop({ required: true })
  category: string;

  @Prop({ required: true })
  subcategory: string;

  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true, unique: true })
  nna_address: string;

  @Prop({ required: true })
  gcpStorageUrl: string;

  @Prop({ required: true })
  source: string;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ required: true })
  description: string;

  @Prop({ type: Object })
  trainingData?: {
    prompts: string[];
    images: string[];
    videos: string[];
  };

  @Prop({ type: Object })
  rights?: {
    source: string;
    rights_split: string;
  };

  @Prop({ type: [String], default: [] })
  components?: string[];

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const AssetSchema = SchemaFactory.createForClass(Asset);

// Add text index for full-text search
AssetSchema.index({ name: 'text', description: 'text', 'tags': 'text' });
AssetSchema.index({ layer: 1, category: 1, subcategory: 1 });
```

## 3.3. User Model (src/models/User.ts)

1. **Create the file:**

```bash
touch src/models/user.schema.ts
```

1. **Paste:**

```typescript
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as bcrypt from 'bcryptjs';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, unique: true, match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/ })
  email: string;

  @Prop({ required: true, minlength: 6 })
  password: string;

  @Prop({ enum: ['user', 'admin'], default: 'user' })
  role: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  async comparePassword(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
  }
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre<User>('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});
```

# Step 4: Implement GCP Storage Service

## 4.1 Swagger Configuration (src/config/swagger.config.ts)

1. **Create the file:**

```bash
touch src/config/swagger.config.ts
```

1. **Paste**

```bash
import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('NNA Registry Service API')
  .setDescription('API for managing digital assets in the NNA Framework')
  .setVersion('1.0')
  .addBearerAuth()
  .build();
```

## 4.2 Sentry Configuration (src/config/sentry.config.ts)

1. **Create the file:**

```bash
touch src/config/sentry.config.ts
```

1. **Paste**

```bash
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';

@Injectable()
export class SentryService {
  constructor(private configService: ConfigService) {
    Sentry.init({
      dsn: this.configService.get<string>('SENTRY_DSN'),
      tracesSampleRate: 1.0,
      profilesSampleRate: 1.0,
      integrations: [new ProfilingIntegration()],
      environment: this.configService.get<string>('NODE_ENV') || 'development',
    });
  }

  captureException(exception: Error): void {
    Sentry.captureException(exception);
  }

  captureMessage(message: string, level: Sentry.SeverityLevel = 'info'): void {
    Sentry.captureMessage(message, level);
  }

  setUser(user: { id: string; email: string; role: string }): void {
    Sentry.setUser(user);
  }

  addBreadcrumb(breadcrumb: Sentry.Breadcrumb): void {
    Sentry.addBreadcrumb(breadcrumb);
  }
}
```

## 4.3 GCP Configuration (src/config/gcp.config.ts)

1. **Create the file:**

```bash
touch src/config/gcp.config.ts
```

1. **Paste**

```bash
import { ConfigService } from '@nestjs/config';
import { StorageOptions } from '@google-cloud/storage';

export const gcpConfig = (configService: ConfigService): StorageOptions => ({
  projectId: configService.get<string>('GCP_PROJECT_ID'),
  keyFilename: configService.get<string>('GOOGLE_APPLICATION_CREDENTIALS'),
});
```

# Step 5: Implement Storage Service

## 5.1 Storage Service (src/modules/storage/storage.service.ts)

1. **Create the file:**

```bash
touch src/modules/storage/storage.service.ts
```

1. **Paste**

```bash
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Storage } from '@google-cloud/storage';
import { Readable } from 'stream';

@Injectable()
export class StorageService {
  private storage: Storage;
  private bucket: string;

  constructor(private configService: ConfigService) {
    this.storage = new Storage({
      projectId: this.configService.get<string>('GCP_PROJECT_ID'),
      keyFilename: this.configService.get<string>('GOOGLE_APPLICATION_CREDENTIALS'),
    });
    this.bucket = this.configService.get<string>('GCP_BUCKET_NAME');
  }

  async uploadFile(
    fileBuffer: Buffer,
    mimeType: string,
    filename: string,
    layer: string,
    category: string,
    subcategory: string,
  ): Promise<string> {
    try {
      const filePath = `${layer}/${category}/${subcategory}/${filename}`;
      const bucketRef = this.storage.bucket(this.bucket);
      const file = bucketRef.file(filePath);

      const stream = file.createWriteStream({
        metadata: { contentType: mimeType },
        resumable: false,
      });

      return new Promise((resolve, reject) => {
        stream.on('error', (error) => {
          reject(new HttpException(`Failed to upload file: ${error.message}`, HttpStatus.BAD_GATEWAY));
        });

        stream.on('finish', async () => {
          await file.makePublic();
          const publicUrl = `https://storage.googleapis.com/${this.bucket}/${filePath}`;
          resolve(publicUrl);
        });

        const readable = new Readable();
        readable._read = () => {};
        readable.push(fileBuffer);
        readable.push(null);
        readable.pipe(stream);
      });
    } catch (error) {
      throw new HttpException(`Failed to upload file to GCP Bucket: ${error.message}`, HttpStatus.BAD_GATEWAY);
    }
  }

  async deleteFile(fileUrl: string): Promise<void> {
    try {
      const bucketUrlPrefix = `https://storage.googleapis.com/${this.bucket}/`;
      if (!fileUrl.startsWith(bucketUrlPrefix)) {
        throw new HttpException('Invalid file URL format', HttpStatus.BAD_REQUEST);
      }

      const filePath = fileUrl.substring(bucketUrlPrefix.length);
      await this.storage.bucket(this.bucket).file(filePath).delete();
    } catch (error) {
      throw new HttpException(`Failed to delete file: ${error.message}`, HttpStatus.BAD_GATEWAY);
    }
  }
}
```

## 5.2. Storage Module (src/modules/storage/storage.module.ts)

1. **Create the file:**

```bash
touch src/modules/storage/storage.module.ts
```

1. **Paste:**

```
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { StorageService } from './storage.service';

@Module({
  imports: [ConfigModule],
  providers: [StorageService],
  exports: [StorageService],
})
export class StorageModule {}
```

# Step 6: Implement Authentication Module

## 6.1 DTOs

1. **Login DTO** (`src/modules/auth/dto/login.dto.ts`):
1. **Create the file:**

```bash
touch src/modules/auth/dto/login.dto.ts
```

1. **Paste:**

```typescript
import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'user@celerity.studio' })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;
}
```

1. **Register DTO** (`src/modules/auth/dto/register.dto.ts`):
1. **Create the file:**

```bash
touch src/modules/auth/dto/register.dto.ts
```

1. **Paste:**

```typescript
import { IsEmail, IsString, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'user@celerity.studio' })
  @IsEmail({}, { message: 'Invalid email format' })
  @Matches(/@celerity\.studio$/, { message: 'Email must be from @celerity.studio domain' })
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;
}
```

## 6.2 Guards

1. **JWT Auth Guard** (`src/modules/auth/guards/jwt-auth.guard.ts`):
1. **Create the file:**

```bash
touch src/modules/auth/guards/jwt-auth.guard.ts
```

1. **Paste:**

```typescript
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

1. **Roles Guard** (`src/modules/auth/guards/roles.guard.ts`):
1. **Create the file:**

```bash
touch src/modules/auth/guards/roles.guard.ts
```

1. **Paste:**

```typescript
import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!roles) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !roles.includes(user.role)) {
      throw new HttpException('Admin access required', HttpStatus.FORBIDDEN);
    }

    return true;
  }
}
```

## 6.3 Strategies

1. **JWT Strategy** (`src/modules/auth/strategies/jwt.strategy.ts`):
1. **Create the file:**

```bash
touch src/modules/auth/strategies/jwt.strategy.ts
```

1. **Paste:**

```typescript
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    return { userId: payload.userId, email: payload.email, role: payload.role };
  }
}
```

## 6.4 Auth Service (`src/modules/auth/auth.service.ts`):

1. **Create the file:**

```bash
touch src/modules/auth/auth.service.ts
```

1. **Paste:**

```typescript
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { User } from '../../models/user.schema';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<{ token: string }> {
    const { email, password } = registerDto;

    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new HttpException('User already exists with this email', HttpStatus.BAD_REQUEST);
    }

    const user = new this.userModel({ email, password });
    await user.save();

    const payload = { userId: user._id, email: user.email, role: user.role };
    const token = this.jwtService.sign(payload);

    return { token };
  }

  async login(loginDto: LoginDto): Promise<{ token: string }> {
    const { email, password } = loginDto;

    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }

    const payload = { userId: user._id, email: user.email, role: user.role };
    const token = this.jwtService.sign(payload);

    return { token };
  }

  async makeAdmin(email: string): Promise<User> {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    user.role = 'admin';
    await user.save();
    return user;
  }

  async getProfile(userId: string): Promise<User> {
    const user = await this.userModel.findById(userId).select('-password');
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return user;
  }
}
```

## 6.5 Auth Controller (`src/modules/auth/auth.controller.ts`):

1. **Create the file:**

```bash
touch src/modules/auth/auth.controller.ts
```

1. **Paste:**

```typescript
import { Controller, Post, Body, Get, Request, UseGuards, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    const { token } = await this.authService.register(registerDto);
    return {
      success: true,
      data: { token },
      metadata: { timestamp: new Date().toISOString() },
    };
  }

  @ApiOperation({ summary: 'Login a user' })
  @ApiResponse({ status: 200, description: 'User logged in successfully' })
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const { token } = await this.authService.login(loginDto);
    return {
      success: true,
      data: { token },
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
```

## 6.6 Auth Module (src/modules/auth/auth.module.ts)

1. **Create the file:**

```bash
touch src/modules/auth/auth.module.ts
```

1. **Paste:**

```typescript
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User, UserSchema } from '../../models/user.schema';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RolesGuard } from './guards/roles.guard';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '24h' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, RolesGuard],
  exports: [AuthService, JwtStrategy, RolesGuard],
})
export class AuthModule {}
```

# Step 7: Implement Assets Module

## 7.1 DTOs

1. **Create Asset DTO** (`src/modules/assets/dto/create-asset.dto.ts`):

```bash
touch src/modules/assets/dto/create-asset.dto.ts
```

```typescript
import { IsString, IsArray, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TrainingDataDto {
  @ApiProperty({ example: ['prompt1', 'prompt2'] })
  @IsArray()
  prompts: string[];

  @ApiProperty({ example: ['image1.jpg', 'image2.jpg'] })
  @IsArray()
  images: string[];

  @ApiProperty({ example: ['video1.mp4', 'video2.mp4'] })
  @IsArray()
  videos: string[];
}

export class RightsDto {
  @ApiProperty({ example: 'ReViz' })
  @IsString()
  source: string;

  @ApiProperty({ example: '50/50' })
  @IsString()
  rights_split: string;
}

export class CreateAssetDto {
  @ApiProperty({ example: 'G' })
  @IsString()
  @IsNotEmpty()
  layer: string;

  @ApiProperty({ example: 'POP' })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({ example: 'TSW' })
  @IsString()
  @IsNotEmpty()
  subcategory: string;

  @ApiProperty({ example: 'ReViz' })
  @IsString()
  @IsNotEmpty()
  source: string;

  @ApiProperty({ example: ['pop', 'taylor swift'] })
  @IsArray()
  @IsOptional()
  tags: string[];

  @ApiProperty({ example: 'A pop song by Taylor Swift' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ type: TrainingDataDto, required: false })
  @IsOptional()
  trainingData?: TrainingDataDto;

  @ApiProperty({ type: RightsDto, required: false })
  @IsOptional()
  rights?: RightsDto;

  @ApiProperty({ example: ['asset_id_1', 'asset_id_2'], required: false })
  @IsArray()
  @IsOptional()
  components?: string[];
}
```

1. **7.2 Update Asset DTO (`src/modules/assets/dto/update-asset.dto.ts`):**

```bash
touch src/modules/assets/dto/update-asset.dto.ts
```

```typescript
import { IsString, IsArray, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TrainingDataDto, RightsDto } from './create-asset.dto';

export class UpdateAssetDto {
  @ApiProperty({ example: 'G', required: false })
  @IsString()
  @IsOptional()
  layer?: string;

  @ApiProperty({ example: 'ROCK', required: false })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiProperty({ example: 'CLASSIC_ROCK', required: false })
  @IsString()
  @IsOptional()
  subcategory?: string;

  @ApiProperty({ example: 'ReViz', required: false })
  @IsString()
  @IsOptional()
  source?: string;

  @ApiProperty({ example: ['rock', 'classic'], required: false })
  @IsArray()
  @IsOptional()
  tags?: string[];

  @ApiProperty({ example: 'A classic rock song', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ type: TrainingDataDto, required: false })
  @IsOptional()
  trainingData?: TrainingDataDto;

  @ApiProperty({ type: RightsDto, required: false })
  @IsOptional()
  rights?: RightsDto;

  @ApiProperty({ example: ['asset_id_1', 'asset_id_2'], required: false })
  @IsArray()
  @IsOptional()
  components?: string[];
}
```

1. **Search Asset DTO (src/modules/assets/dto/search-asset.dto.ts)** 

**Create:**

```bash
touch src/modules/assets/dto/search-asset.dto.ts
```

**Paste:**

```typescript
import { IsString, IsOptional, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class SearchAssetDto {
  @ApiProperty({ example: 'pop song', required: false })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiProperty({ example: 'G', required: false })
  @IsString()
  @IsOptional()
  layer?: string;

  @ApiProperty({ example: 'POP', required: false })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiProperty({ example: 'TSW', required: false })
  @IsString()
  @IsOptional()
  subcategory?: string;

  @ApiProperty({ example: 1, required: false })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  page?: number;

  @ApiProperty({ example: 10, required: false })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  limit?: number;
}
```

## 7.2 Assets Service (src/modules/assets/assets.service.ts)

- Create the file:

```bash
touch src/modules/assets/assets.service.ts
```

- Paste :

```typescript
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Asset } from '../../models/asset.schema';
import { StorageService } from '../storage/storage.service';
import { TaxonomyService } from '../taxonomy/taxonomy.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { SearchAssetDto } from './dto/search-asset.dto';

@Injectable()
export class AssetsService {
  constructor(
    @InjectModel(Asset.name) private assetModel: Model<Asset>,
    private storageService: StorageService,
    private taxonomyService: TaxonomyService,
  ) {}

  async createAsset(
    createAssetDto: CreateAssetDto,
    file: Express.Multer.File,
    userEmail: string,
  ): Promise<Asset> {
    const { layer, category, subcategory, source, tags, description, trainingData, rights, components } = createAssetDto;

    // Validate taxonomy
    await this.taxonomyService.validateTaxonomy(layer, category, subcategory);

    // Upload file to GCP Storage
    const gcpStorageUrl = await this.storageService.uploadFile(
      file.buffer,
      file.mimetype,
      file.originalname,
      layer,
      category,
      subcategory,
    );

    // Generate HFN and NNA (NNA is placeholder for MVP)
    const count = await this.assetModel.countDocuments({ layer, category, subcategory });
    const sequential = (count + 1).toString().padStart(3, '0');
    const name = `${layer}-${category}-${subcategory}-${sequential}`;
    const nna_address = `${layer}.${category}.${subcategory}.${sequential}`; // Placeholder

    // Create asset
    const asset = new this.assetModel({
      layer,
      category,
      subcategory,
      name,
      nna_address,
      gcpStorageUrl,
      source,
      tags: tags || [],
      description,
      trainingData,
      rights,
      components: components || [],
      registered_by: userEmail,
    });

    return asset.save();
  }

  async batchCreateAssets(
  csvData: any[],
  files: Express.Multer.File[],
  userEmail: string,
): Promise<Asset[]> {
  const assets: Asset[] = [];
  const fileMap = new Map(files.map(file => [file.originalname, file]));

  try {
    for (const row of csvData) {
      const { layer, category, subcategory, source, tags, description, filename } = row;

      if (!layer || !category || !subcategory || !source || !description || !filename) {
        throw new HttpException('Missing required fields in CSV', HttpStatus.BAD_REQUEST);
      }

      const file = fileMap.get(filename);
      if (!file) {
        throw new HttpException(`File ${filename} not found in uploaded files`, HttpStatus.BAD_REQUEST);
      }

      const asset = await this.createAsset(
        {
          layer,
          category,
          subcategory,
          source,
          tags: tags ? tags.split(',').map((tag: string) => tag.trim()) : [],
          description,
          trainingData: row.trainingData ? JSON.parse(row.trainingData) : undefined,
          rights: row.rights ? JSON.parse(row.rights) : undefined,
          components: row.components ? row.components.split(',').map((id: string) => id.trim()) : undefined,
        },
        file,
        userEmail,
      );

      assets.push(asset);
    }
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new HttpException('Invalid CSV data format', HttpStatus.BAD_REQUEST);
    }
    throw error;
  }

  return assets;
}

  async findByName(name: string): Promise<Asset> {
    const asset = await this.assetModel.findOne({ name });
    if (!asset) {
      throw new HttpException(`Asset not found: ${name}`, HttpStatus.NOT_FOUND);
    }
    return asset;
  }

  async searchAssets(searchAssetDto: SearchAssetDto): Promise<{
    assets: Asset[];
    totalAssets: number;
    totalPages: number;
    currentPage: number;
  }> {
    const { search, layer, category, subcategory, page = 1, limit = 10 } = searchAssetDto;

    const filter: any = {};
    if (layer) filter.layer = layer;
    if (category) filter.category = category;
    if (subcategory) filter.subcategory = subcategory;
    if (search) filter.$text = { $search: search };

    const totalAssets = await this.assetModel.countDocuments(filter);
    const assets = await this.assetModel
      .find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return {
      assets,
      totalAssets,
      totalPages: Math.ceil(totalAssets / limit),
      currentPage: page,
    };
  }

  async updateAsset(name: string, updateAssetDto: UpdateAssetDto): Promise<Asset> {
    const asset = await this.findByName(name);

    if (updateAssetDto.layer || updateAssetDto.category || updateAssetDto.subcategory) {
      const layer = updateAssetDto.layer || asset.layer;
      const category = updateAssetDto.category || asset.category;
      const subcategory = updateAssetDto.subcategory || asset.subcategory;

      await this.taxonomyService.validateTaxonomy(layer, category, subcategory);

      const count = await this.assetModel.countDocuments({ layer, category, subcategory });
      const sequential = count.toString().padStart(3, '0');
      asset.name = `${layer}-${category}-${subcategory}-${sequential}`;
      asset.nna_address = `${layer}.${category}.${subcategory}.${sequential}`; // Placeholder
    }

    Object.assign(asset, updateAssetDto);
    return asset.save();
  }

  async deleteAsset(name: string): Promise<void> {
    const asset = await this.findByName(name);
    await this.storageService.deleteFile(asset.gcpStorageUrl);
    await asset.deleteOne();
  }

  async curateAsset(name: string): Promise<Asset> {
    const asset = await this.findByName(name);
    // For MVP, curation is a simple validation of HFN, NNA, and description
    if (!asset.name || !asset.nna_address || !asset.description) {
      throw new HttpException('Asset missing required fields for curation', HttpStatus.BAD_REQUEST);
    }
    return asset;
  }
}
```

## 7.3 Assets Controller (src/modules/assets/assets.controller.ts)

- Create the file:

```bash
touch src/modules/assets/assets.controller.ts
```

- Paste:

```typescript
import { Controller, Post, Body, Get, Param, Query, Put, Delete, UseGuards, Request, UseInterceptors, UploadedFile, UploadedFiles } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { AssetsService } from './assets.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { SearchAssetDto } from './dto/search-asset.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';

@ApiTags('assets')
@Controller('assets')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AssetsController {
  constructor(private assetsService: AssetsService) {}

  @ApiOperation({ summary: 'Register a new asset' })
  @ApiResponse({ status: 201, description: 'Asset registered successfully' })
  @ApiConsumes('multipart/form-data')
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @Body() createAssetDto: CreateAssetDto,
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ) {
    const asset = await this.assetsService.createAsset(createAssetDto, file, req.user.email);
    return {
      success: true,
      data: asset,
      metadata: { timestamp: new Date().toISOString() },
    };
  }

  @ApiOperation({ summary: 'Batch register assets via CSV' })
  @ApiResponse({ status: 201, description: 'Assets registered successfully' })
  @ApiConsumes('multipart/form-data')
  @Post('batch')
  @UseInterceptors(FilesInterceptor('files'))
  async batchCreate(
    @Body('csvData') csvData: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Request() req,
  ) {
    const parsedCsvData = JSON.parse(csvData);
    const assets = await this.assetsService.batchCreateAssets(parsedCsvData, files, req.user.email);
    return {
      success: true,
      data: assets,
      metadata: { timestamp: new Date().toISOString() },
    };
  }

  @ApiOperation({ summary: 'Search assets' })
  @ApiResponse({ status: 200, description: 'Assets retrieved successfully' })
  @Get()
  async search(@Query() searchAssetDto: SearchAssetDto) {
    const result = await this.assetsService.searchAssets(searchAssetDto);
    return {
      success: true,
      data: result.assets,
      metadata: {
        timestamp: new Date().toISOString(),
        pagination: {
          totalAssets: result.totalAssets,
          totalPages: result.totalPages,
          currentPage: result.currentPage,
        },
      },
    };
  }

  @ApiOperation({ summary: 'Get asset by name' })
  @ApiResponse({ status: 200, description: 'Asset retrieved successfully' })
  @Get(':name')
  async findByName(@Param('name') name: string) {
    const asset = await this.assetsService.findByName(name);
    return {
      success: true,
      data: asset,
      metadata: { timestamp: new Date().toISOString() },
    };
  }

  @ApiOperation({ summary: 'Update an asset' })
  @ApiResponse({ status: 200, description: 'Asset updated successfully' })
  @Put(':name')
  async update(@Param('name') name: string, @Body() updateAssetDto: UpdateAssetDto) {
    const asset = await this.assetsService.updateAsset(name, updateAssetDto);
    return {
      success: true,
      data: asset,
      metadata: { timestamp: new Date().toISOString() },
    };
  }

  @ApiOperation({ summary: 'Delete an asset (admin only)' })
  @ApiResponse({ status: 200, description: 'Asset deleted successfully' })
  @UseGuards(RolesGuard)
  @Roles('admin')
  @Delete(':name')
  async delete(@Param('name') name: string) {
    await this.assetsService.deleteAsset(name);
    return {
      success: true,
      data: { message: `Asset ${name} deleted successfully` },
      metadata: { timestamp: new Date().toISOString() },
    };
  }

  @ApiOperation({ summary: 'Curate an asset (admin only)' })
  @ApiResponse({ status: 200, description: 'Asset curated successfully' })
  @UseGuards(RolesGuard)
  @Roles('admin')
  @Post('curate/:name')
  async curate(@Param('name') name: string) {
    const asset = await this.assetsService.curateAsset(name);
    return {
      success: true,
      data: asset,
      metadata: { timestamp: new Date().toISOString() },
    };
  }
}
```

## 7.4 Assets Module (src/modules/assets/assets.module.ts)

- Create the file:

```bash
touch src/modules/assets/assets.module.ts
```

- Paste:

```typescript
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AssetsService } from './assets.service';
import { AssetsController } from './assets.controller';
import { Asset, AssetSchema } from '../../models/asset.schema';
import { StorageModule } from '../storage/storage.module';
import { TaxonomyModule } from '../taxonomy/taxonomy.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Asset.name, schema: AssetSchema }]),
    StorageModule,
    TaxonomyModule,
  ],
  controllers: [AssetsController],
  providers: [AssetsService],
})
export class AssetsModule {}
```

---

# Step 8: Implement Taxonomy Module

## 8.1 Taxonomy Service (src/modules/taxonomy/taxonomy.service.ts)

- Create the file:

```bash
touch src/modules/taxonomy/taxonomy.service.ts
```

- Paste:

```typescript
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { getTaxonomyData } from '../../common/utils/taxonomy.util';

@Injectable()
export class TaxonomyService {
  private taxonomyData: any;

  constructor() {
    this.taxonomyData = getTaxonomyData();
  }

  async validateTaxonomy(layer: string, category: string, subcategory: string): Promise<void> {
  const normalizedLayer = layer.toUpperCase();
  const normalizedCategory = category.toUpperCase();
  const normalizedSubcategory = subcategory.toUpperCase();

  if (!this.taxonomyData[normalizedLayer]) {
    throw new HttpException(`Invalid layer: ${layer}`, HttpStatus.BAD_REQUEST);
  }

  const categoryEntry = Object.values(this.taxonomyData[normalizedLayer].categories as Record<string, any>).find(
    (cat: any) => cat.name.toUpperCase() === normalizedCategory,
  );
  if (!categoryEntry) {
    throw new HttpException(`Invalid category: ${category} for layer: ${layer}`, HttpStatus.BAD_REQUEST);
  }

  const subcategories = Object.values(categoryEntry.subcategories as Record<string, any>).map(
    (subcat: any) => subcat.name.toUpperCase(),
  );
  const aliases = this.taxonomyData.scalability_features?.category_mappings?.aliases || {};
  Object.keys(aliases).forEach((aliasKey: string) => {
    const [aliasLayer, aliasCategory, aliasSubcategory] = aliasKey.split('.');
    const mappedValue = aliases[aliasKey];
    const [_, __, mappedSubcategory] = mappedValue.split('.');

    if (
      aliasLayer === normalizedLayer &&
      aliasCategory.toUpperCase() === normalizedCategory &&
      !subcategories.includes(aliasSubcategory)
    ) {
      subcategories.push(aliasSubcategory);
    }
    if (
      aliasLayer === normalizedLayer &&
      aliasCategory.toUpperCase() === normalizedCategory &&
      !subcategories.includes(mappedSubcategory)
    ) {
      subcategories.push(mappedSubcategory);
    }
  });

  if (!subcategories.includes(normalizedSubcategory)) {
    throw new HttpException(
      `Invalid subcategory: ${subcategory} for layer: ${layer}, category: ${category}`,
      HttpStatus.BAD_REQUEST,
    );
  }
}

  getLayerNames(): Record<string, string> {
    const mvpLayers = ['G', 'M', 'P', 'T', 'R', 'C'];
    const layerNames: Record<string, string> = {};

    for (const layer of mvpLayers) {
      if (this.taxonomyData[layer]) {
        layerNames[layer] = this.taxonomyData[layer].name || layer;
      }
    }

    return layerNames;
  }
}
```

## 8.2 Taxonomy Module (src/modules/taxonomy/taxonomy.module.ts)

- Create the file:

```bash
touch src/modules/taxonomy/taxonomy.module.ts
```

- Paste:

```typescript
import { Module } from '@nestjs/common';
import { TaxonomyService } from './taxonomy.service';

@Module({
  providers: [TaxonomyService],
  exports: [TaxonomyService],
})
export class TaxonomyModule {}
```

## 8.3 Taxonomy Utility (src/common/utils/taxonomy.util.ts)

- Create the file:

```bash
touch src/common/utils/taxonomy.util.ts
```

- Paste:

```typescript
import * as fs from 'fs';
import * as path from 'path';

export const getTaxonomyData = () => {
  const taxonomyPath = path.join(__dirname, '../../../taxonomy/enriched_nna_layer_taxonomy_v1.2.json');
  try {
    const taxonomyData = JSON.parse(fs.readFileSync(taxonomyPath, 'utf8'));
    return taxonomyData;
  } catch (error) {
    console.error('Error loading taxonomy data:', error);
    throw new Error('Failed to load taxonomy data');
  }
};
```

---

# Step 9: Implement Common Utilities

## 9.1 HTTP Exception Filter (src/common/filters/http-exception.filter.ts)

- Create the file:

```bash
touch src/common/filters/http-exception.filter.ts
```

- Paste:

```typescript
import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';
import { SentryService } from '../../config/sentry.config';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private sentryService: SentryService) {}

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    this.sentryService.captureException(exception);

    response.status(status).json({
      success: false,
      error: {
        code: exception.name,
        message: exception.message,
        details: exception.getResponse(),
      },
      metadata: {
        timestamp: new Date().toISOString(),
        path: request.url,
      },
    });
  }
}
```

## 9.2 Logging Interceptor (src/common/interceptors/logging.interceptor.ts)

- Create the file:

```bash
touch src/common/interceptors/logging.interceptor.ts
```

- Paste:

```typescript
import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const url = request.url;
    const now = Date.now();

    this.logger.log(`[${method}] ${url} - Request received`);

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - now;
        this.logger.log(`[${method}] ${url} - Completed in ${duration}ms`);
      }),
    );
  }
}
```

## 9.3 Roles Decorator (src/common/decorators/roles.decorator.ts)

- Create the file:

```bash
touch src/common/decorators/roles.decorator.ts
```

- Paste:

```typescript
import { SetMetadata } from '@nestjs/common';

export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
```

---

# Step 10: Implement Application Entry Point

## 10.1 Main Application (src/main.ts)

- Open the existing `src/main.ts` file and replace its content with:

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule } from '@nestjs/swagger';
import { swaggerConfig } from './config/swagger.config';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { SentryService } from './config/sentry.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global filters and interceptors
  app.useGlobalFilters(new HttpExceptionFilter(app.get(SentryService)));
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Swagger setup
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT || 3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
  console.log(`Swagger documentation available at: ${await app.getUrl()}/api/docs`);
}
bootstrap();
```

## 10.2 App Module (src/app.module.ts)

- Open the existing `src/app.module.ts` file and replace its content with:

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './modules/auth/auth.module';
import { AssetsModule } from './modules/assets/assets.module';
import { StorageModule } from './modules/storage/storage.module';
import { TaxonomyModule } from './modules/taxonomy/taxonomy.module';
import { mongooseConfig } from './config/mongodb.config';
import { SentryService } from './config/sentry.config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: mongooseConfig,
      inject: [ConfigService],
    }),
    AuthModule,
    AssetsModule,
    StorageModule,
    TaxonomyModule,
  ],
  providers: [SentryService],
})
export class AppModule {}
```

---

# Step 11: Update Package.json Scripts

- Open `package.json` and update the `scripts` section:

```json
"scripts": {
  "start": "nest start",
  "start:dev": "nest start --watch",
  "start:debug": "nest start --debug --watch",
  "start:prod": "node dist/main",
  "build": "nest build",
  "test": "jest",
  "test:watch": "jest --watch",
  "test:cov": "jest --coverage"
}
```

---

# Step 12: Testing Setup

## 12.1 Install Testing Dependencies

- Run:

```bash
npm install -D jest @nestjs/testing @types/jest supertest @types/supertest
```

## 12.2 Unit Test for Assets Service (src/modules/assets/assets.service.spec.ts)

- Create the file:

```bash
touch src/modules/assets/assets.service.spec.ts
```

- Paste:

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { AssetsService } from './assets.service';
import { StorageService } from '../storage/storage.service';
import { TaxonomyService } from '../taxonomy/taxonomy.service';
import { Asset } from '../../models/asset.schema';

describe('AssetsService', () => {
  let service: AssetsService;
  let assetModel: any;
  let storageService: any;
  let taxonomyService: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssetsService,
        {
          provide: getModelToken(Asset.name),
          useValue: {
            countDocuments: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
            save: jest.fn(),
            deleteOne: jest.fn(),
          },
        },
        {
          provide: StorageService,
          useValue: {
            uploadFile: jest.fn(),
            deleteFile: jest.fn(),
          },
        },
        {
          provide: TaxonomyService,
          useValue: {
            validateTaxonomy: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AssetsService>(AssetsService);
    assetModel = module.get(getModelToken(Asset.name));
    storageService = module.get<StorageService>(StorageService);
    taxonomyService = module.get<TaxonomyService>(TaxonomyService);
  });

  it('should create an asset', async () => {
    const createAssetDto = {
      layer: 'G',
      category: 'POP',
      subcategory: 'TSW',
      source: 'ReViz',
      tags: ['pop', 'taylor swift'],
      description: 'A pop song',
    };
    const file = { buffer: Buffer.from('test'), mimetype: 'audio/mp3', originalname: 'test.mp3' };
    const userEmail = 'user@celerity.studio';

    taxonomyService.validateTaxonomy.mockResolvedValue(undefined);
    assetModel.countDocuments.mockResolvedValue(0);
    storageService.uploadFile.mockResolvedValue('https://storage.googleapis.com/reviz-assets/G/POP/TSW/test.mp3');
    assetModel.prototype.save = jest.fn().mockResolvedValue({
      ...createAssetDto,
      name: 'G-POP-TSW-001',
      nna_address: 'G.POP.TSW.001',
      gcpStorageUrl: 'https://storage.googleapis.com/reviz-assets/G/POP/TSW/test.mp3',
      registered_by: userEmail,
    });

    const result = await service.createAsset(createAssetDto, file, userEmail);
    expect(result.name).toBe('G-POP-TSW-001');
    expect(taxonomyService.validateTaxonomy).toHaveBeenCalledWith('G', 'POP', 'TSW');
  });
});
it('should search assets with full-text search', async () => {
  const searchAssetDto = { search: 'pop song', page: 1, limit: 10 };
  const mockAssets = [
    {
      layer: 'G',
      category: 'POP',
      subcategory: 'TSW',
      name: 'G-POP-TSW-001',
      nna_address: 'G.POP.TSW.001',
      gcpStorageUrl: 'https://storage.googleapis.com/reviz-assets/G/POP/TSW/test.mp3',
      source: 'ReViz',
      tags: ['pop', 'taylor swift'],
      description: 'A pop song by Taylor Swift',
    },
  ];

  assetModel.countDocuments.mockResolvedValue(1);
  assetModel.find.mockReturnValue({
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockResolvedValue(mockAssets),
  });

  const result = await service.searchAssets(searchAssetDto);
  expect(result.assets).toEqual(mockAssets);
  expect(assetModel.find).toHaveBeenCalledWith({ $text: { $search: 'pop song' } });
});
```

## 12.3 API Test for Assets Controller (src/modules/assets/assets.controller.spec.ts)

- Create the file:

```bash
touch src/modules/assets/assets.controller.spec.ts
```

- Paste:

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { AssetsController } from './assets.controller';
import { AssetsService } from './assets.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

describe('AssetsController', () => {
  let controller: AssetsController;
  let service: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AssetsController],
      providers: [
        {
          provide: AssetsService,
          useValue: {
            createAsset: jest.fn(),
            searchAssets: jest.fn(),
            findByName: jest.fn(),
            updateAsset: jest.fn(),
            deleteAsset: jest.fn(),
            curateAsset: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AssetsController>(AssetsController);
    service = module.get<AssetsService>(AssetsService);
  });

  it('should create an asset', async () => {
    const createAssetDto = {
      layer: 'G',
      category: 'POP',
      subcategory: 'TSW',
      source: 'ReViz',
      tags: ['pop', 'taylor swift'],
      description: 'A pop song',
    };
    const file = { buffer: Buffer.from('test'), mimetype: 'audio/mp3', originalname: 'test.mp3' };
    const req = { user: { email: 'user@celerity.studio' } };

    service.createAsset.mockResolvedValue({ name: 'G-POP-TSW-001' });

    const result = await controller.create(createAssetDto, file, req);
    expect(result.data.name).toBe('G-POP-TSW-001');
    expect(service.createAsset).toHaveBeenCalled();
  });
});
it('should batch create assets', async () => {
  const csvData = [
    {
      layer: 'G',
      category: 'POP',
      subcategory: 'TSW',
      source: 'ReViz',
      tags: 'pop,taylor swift',
      description: 'A pop song by Taylor Swift',
      filename: 'test-file.mp3',
    },
  ];
  const files = [{ buffer: Buffer.from('test'), mimetype: 'audio/mp3', originalname: 'test-file.mp3' }];
  const req = { user: { email: 'user@celerity.studio' } };

  service.batchCreateAssets.mockResolvedValue([{ name: 'G-POP-TSW-001' }]);

  const result = await controller.batchCreate(JSON.stringify(csvData), files, req);
  expect(result.data[0].name).toBe('G-POP-TSW-001');
  expect(service.batchCreateAssets).toHaveBeenCalled();
});
```

---

# Step 13: Basic Documentation

## 13.1 Update README.md

- Create or update `README.md`:

```bash
touch README.md
```

- Paste:

```markdown
# NNA Registry Service

A service for managing the Naming, Numbering, and Addressing (NNA) Framework for ReViz's AI-powered video remixing platform.

## Features

- Asset registration with taxonomy classification
- Batch upload for registering multiple assets
- Asset retrieval with filtering, pagination, and full-text search
- Asset management (update, delete, curate)
- Authentication and authorization
- GCP Storage integration for file storage
- API documentation with Swagger
- Error monitoring with Sentry

## Prerequisites

- Node.js 18+
- MongoDB
- Google Cloud Platform account with Storage API enabled
- Sentry account for error monitoring

## Getting Started

1. Clone the repository
```bash
git clone https://github.com/yourusername/nna-registry-service.git
cd nna-registry-service
```

    1. Install dependencies

```bash
npm install
```

    1. Copy the example env file and update variables

```bash
cp .env.example .env
# Update the variables in .env
```

    1. Start the development server

```bash
npm run start:dev
```

    1. Access the API documentation
    - Open `http://localhost:3000/api/docs` in your browser to view the Swagger documentation.

## API Endpoints

### Authentication

    - `POST /auth/register` - Register a new user
    - `POST /auth/login` - Login and get a JWT token
    - `POST /auth/make-admin` - Make a user an admin (admin only)
    - `GET /auth/profile` - Get user profile

### Assets

    - `POST /assets` - Register a new asset
    - `POST /assets/batch` - Batch register assets via CSV
    - `GET /assets` - Search assets with filtering
    - `GET /assets/:name` - Get asset by name
    - `PUT /assets/:name` - Update an asset
    - `DELETE /assets/:name` - Delete an asset (admin only)
    - `POST /assets/curate/:name` - Curate an asset (admin only)

## Testing

- Run tests with:

```bash
npm run test
```

## Troubleshooting

    - **MongoDB Connection Failed**: Check if MongoDB is running (`brew services list`) and ensure the `MONGODB_URI` in `.env` is correct.
    - **GCP Storage Upload Failed**: Verify the `GOOGLE_APPLICATION_CREDENTIALS` path and ensure the service account has access to the bucket.
    - **Sentry Not Capturing Errors**: Ensure the `SENTRY_DSN` in `.env` is correct and the Sentry service is initialized.

## License

- MIT

---

# Step 14: Run and Test the Application

## 14.1 Start the Application

- Run:

```bash
npm run start:dev
```

- You should see:

```
Application is running on: http://localhost:3000
Swagger documentation available at: http://localhost:3000/api/docs
```

## 14.2 Test the Endpoints

1. **Register a User**:
    - Use a tool like Postman or curl:

```bash
curl -X POST http://localhost:3000/auth/register \
-H "Content-Type: application/json" \
-d '{"email":"user@celerity.studio","password":"password123"}'
```

    - Copy the `token` from the response.
1. **Login**:
    - Run:

```bash
curl -X POST http://localhost:3000/auth/login \
-H "Content-Type: application/json" \
-d '{"email":"user@celerity.studio","password":"password123"}'
```

    - Copy the `token`.
1. **Register an Asset**:
    - Run:

```bash
curl -X POST http://localhost:3000/assets \
-H "Authorization: Bearer your_token" \
-F "file=@/path/to/test-file.mp3" \
-F "layer=G" \
-F "category=POP" \
-F "subcategory=TSW" \
-F "source=ReViz" \
-F "tags=pop,taylor swift" \
-F "description=A pop song by Taylor Swift"
```

    - Expected response:

```json
{
  "success": true,
  "data": {
    "layer": "G",
    "category": "POP",
    "subcategory": "TSW",
    "name": "G-POP-TSW-001",
    "nna_address": "G.POP.TSW.001",
    "gcpStorageUrl": "https://storage.googleapis.com/reviz-assets/G/POP/TSW/test-file.mp3",
    "source": "ReViz",
    "tags": ["pop", "taylor swift"],
    "description": "A pop song by Taylor Swift",
    "_id": "...",
    "createdAt": "...",
    "updatedAt": "...",
    "__v": 0
  },
  "metadata": { "timestamp": "..." }
}
```

1. **Search Assets**:
    - Run:

```bash
curl "http://localhost:3000/assets?search=pop&page=1&limit=10" \
-H "Authorization: Bearer your_token"
```

    - Expected response:

```json
{
  "success": true,
  "data": [
    {
      "layer": "G",
      "category": "POP",
      "subcategory": "TSW",
      "name": "G-POP-TSW-001",
      "nna_address": "G.POP.TSW.001",
      "gcpStorageUrl": "https://storage.googleapis.com/reviz-assets/G/POP/TSW/test-file.mp3",
      "source": "ReViz",
      "tags": ["pop", "taylor swift"],
      "description": "A pop song by Taylor Swift",
      "_id": "...",
      "createdAt": "...",
      "updatedAt": "...",
      "__v": 0
    }
  ],
  "metadata": {
    "timestamp": "...",
    "pagination": {
      "totalAssets": 1,
      "totalPages": 1,
      "currentPage": 1
    }
  }
}

```

1. **Test Full-Text Search**:
- Run:

```bash
curl "http://localhost:3000/assets?search=pop%20song"
-H "Authorization: Bearer your_token"
```

- Expected response:

```json
{
  "success": true,
  "data": [
    {
      "layer": "G",
      "category": "POP",
      "subcategory": "TSW",
      "name": "G-POP-TSW-001",
      "nna_address": "G.POP.TSW.001",
      "gcpStorageUrl": "https://storage.googleapis.com/reviz-assets/G/POP/TSW/test-file.mp3",
      "source": "ReViz",
      "tags": ["pop", "taylor swift"],
      "description": "A pop song by Taylor Swift",
      "_id": "...",
      "createdAt": "...",
      "updatedAt": "...",
      "__v": 0
    }
  ],
  "metadata": {
    "timestamp": "...",
    "pagination": {
      "totalAssets": 1,
      "totalPages": 1,
      "currentPage": 1
    }
  }
}
```

1. **Batch Upload Test:**
- Create a CSV file `assets.csv` with the following content:

```
layer,category,subcategory,source,tags,description,filename G,POP,TSW,ReViz,"pop,taylor swift",A pop song by Taylor Swift,test-file.mp3 M,HIP,TOP,ReViz,"hip-hop,top rock",A hip-hop dance move,test-dance.mp4
```

Run:

```bash
curl -X POST http://localhost:3000/assets/batch
-H "Authorization: Bearer your_token"
-F 'csvData=[{"layer":"G","category":"POP","subcategory":"TSW","source":"ReViz","tags":"pop,taylor swift","description":"A pop song by Taylor Swift","filename":"test-file.mp3"},{"layer":"M","category":"HIP","subcategory":"TOP","source":"ReViz","tags":"hip-hop,top rock","description":"A hip-hop dance move","filename":"test-dance.mp4"}]'
-F "files=@/path/to/test-file.mp3"
-F "files=@/path/to/test-dance.mp4"
```

- Expected response:

```json
{ "success": true, "data": [ { "layer": "G", "category": "POP", "subcategory": "TSW", "name": "G-POP-TSW-002", "nna_address": "G.POP.TSW.002", "gcpStorageUrl": "https://storage.googleapis.com/reviz-assets/G/POP/TSW/test-file.mp3", "source": "ReViz", "tags": ["pop", "taylor swift"], "description": "A pop song by Taylor Swift", "_id": "...", "createdAt": "...", "updatedAt": "...", "__v": 0 }, { "layer": "M", "category": "HIP", "subcategory": "TOP", "name": "M-HIP-TOP-001", "nna_address": "M.HIP.TOP.001", "gcpStorageUrl": "https://storage.googleapis.com/reviz-assets/M/HIP/TOP/test-dance.mp4", "source": "ReViz", "tags": ["hip-hop", "top rock"], "description": "A hip-hop dance move", "_id": "...", "createdAt": "...", "updatedAt": "...", "__v": 0 } ], "metadata": { "timestamp": "..." } }
```

1. **Test Curation (Admin Only)**

**First, make the user an admin:**

```bash
curl -X POST http://localhost:3000/auth/make-admin \
  -H "Authorization: Bearer your_token" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@celerity.studio"}'
```

**Then, run the curation request:**

```bash
curl -X POST http://localhost:3000/assets/curate/G-POP-TSW-001 \
  -H "Authorization: Bearer your_token"
```

**Expected response:**

```json
{
  "success": true,
  "data": {
    "layer": "G",
    "category": "POP",
    "subcategory": "TSW",
    "name": "G-POP-TSW-001",
    "nna_address": "G.POP.TSW.001",
    "gcpStorageUrl": "https://storage.googleapis.com/reviz-assets/G/POP/TSW/test-file.mp3",
    "source": "ReViz",
    "tags": ["pop", "taylor swift"],
    "description": "A pop song by Taylor Swift",
    "_id": "...",
    "createdAt": "...",
    "updatedAt": "...",
    "__v": 0
  },
  "metadata": {
    "timestamp": "..."
  }
}
```

---

# Step 15: Next Steps After MVP

- **Frontend Development**: Build the React frontend with the UI mockups provided in the requirements.
- **Add More Layers**: Include `S`, `L`, `W`, `B`.
- **Implement NNA Addresses**: Add numeric addressing with proper mappings.
- **Enhance Metadata**: Add fields like `popularity_score`.
- **Integrate with AlgoRhythm/Clearity**: Add API integration.
- **Advanced Features**: Versioning, advanced search.

---

### Troubleshooting

- **MongoDB Connection Failed**: Check if MongoDB is running (`brew services list`) and ensure the `MONGODB_URI` in `.env` is correct.
- **GCP Storage Upload Failed**: Verify the `GOOGLE_APPLICATION_CREDENTIALS` path and ensure the service account has access to the bucket.
- **Sentry Not Capturing Errors**: Ensure the `SENTRY_DSN` in `.env` is correct.
- **Swagger Not Accessible**: Check if the `/api/docs` endpoint is accessible and ensure the Swagger setup is correct in `main.ts`.

---
