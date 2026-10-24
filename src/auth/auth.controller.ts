import { Controller, Post, Get, Delete, Body, UseGuards, Request, Param, ParseIntPipe, Patch, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { RegisterDto } from './dto/register.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ActivateUserDto } from './dto/activate-user.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { SetPrimaryCurrencyDto } from './dto/set-primary-currency.dto';
import { CheckEmailDto } from './dto/check-email.dto';
import { CheckNicknameDto } from './dto/check-nickname.dto';
import {
  ActivateUserResponseDto,
  AdminUserListItemDto,
  AvailabilityResponseDto,
  CreateUserResponseDto,
  CurrentUserDto,
  LoginResponseDto,
  MessageResponseDto,
  RegisterResponseDto,
  SetPrimaryCurrencyResponseDto,
} from './auth.swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Iniciar sesión' })
  @ApiResponse({ status: 201, description: 'Login exitoso con estado de acceso del usuario', type: LoginResponseDto })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('check-email')
  @ApiOperation({ summary: 'Comprobar si un email ya está registrado' })
  @ApiQuery({ name: 'email', required: true, example: 'usuario@email.com' })
  @ApiResponse({ status: 200, description: 'Disponibilidad del email', type: AvailabilityResponseDto })
  @ApiResponse({ status: 400, description: 'Email inválido o ausente' })
  async checkEmail(@Query() query: CheckEmailDto) {
    return this.authService.checkEmailExists(query.email);
  }

  @Get('check-nickname')
  @ApiOperation({ summary: 'Comprobar si un nickname ya está en uso' })
  @ApiQuery({ name: 'nickname', required: true, example: 'Juanito' })
  @ApiResponse({ status: 200, description: 'Disponibilidad del nickname', type: AvailabilityResponseDto })
  @ApiResponse({ status: 400, description: 'Nickname inválido o ausente' })
  async checkNickname(@Query() query: CheckNicknameDto) {
    return this.authService.checkNicknameExists(query.nickname);
  }

  @Post('register')
  @ApiOperation({ summary: 'Registrarse' })
  @ApiResponse({ status: 201, description: 'Registro exitoso. Email de verificación enviado.', type: RegisterResponseDto })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 409, description: 'El correo electrónico ya está registrado' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Solicitar restablecimiento de contraseña' })
  @ApiResponse({ status: 200, description: 'Solicitud procesada', type: MessageResponseDto })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Restablecer contraseña con token' })
  @ApiResponse({ status: 200, description: 'Contraseña restablecida correctamente', type: MessageResponseDto })
  @ApiResponse({ status: 400, description: 'Token inválido o expirado' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Post('verify-email')
  @ApiOperation({ summary: 'Verificar email' })
  @ApiResponse({ status: 200, description: 'Email verificado correctamente', type: MessageResponseDto })
  @ApiResponse({ status: 400, description: 'Token inválido, ya verificado o expirado' })
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    return this.authService.verifyEmail(verifyEmailDto.token);
  }

  @Post('resend-verification')
  @ApiOperation({ summary: 'Re-enviar email de verificación' })
  @ApiResponse({ status: 200, description: 'Email de verificación re-enviado', type: MessageResponseDto })
  @ApiResponse({ status: 400, description: 'Error en la solicitud' })
  @ApiResponse({ status: 403, description: 'Cooldown activo, esperar antes de re-enviar' })
  async resendVerification(@Body() resendVerificationDto: ResendVerificationDto) {
    return this.authService.resendVerification(resendVerificationDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener usuario actual' })
  @ApiResponse({ status: 200, description: 'Usuario encontrado con estado de acceso', type: CurrentUserDto })
  async getCurrentUser(@Request() req: any) {
    return this.authService.getCurrentUser(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cambiar contraseña' })
  @ApiResponse({ status: 200, description: 'Contraseña actualizada', type: MessageResponseDto })
  async changePassword(
    @Request() req: any,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(req.user.id, changePasswordDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me/primary-currency')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Establecer moneda principal' })
  @ApiResponse({ status: 200, description: 'Moneda principal actualizada', type: SetPrimaryCurrencyResponseDto })
  @ApiResponse({ status: 404, description: 'Moneda no encontrada' })
  async setPrimaryCurrency(
    @Request() req: any,
    @Body() dto: SetPrimaryCurrencyDto,
  ) {
    return this.authService.setPrimaryCurrency(req.user.id, dto.primaryCurrencyId);
  }

  // Admin only endpoints
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post('users')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear nuevo usuario (Solo Admin)' })
  @ApiResponse({ status: 201, description: 'Usuario creado', type: CreateUserResponseDto })
  @ApiResponse({ status: 403, description: 'No autorizado' })
  @ApiResponse({ status: 409, description: 'Email ya registrado' })
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.authService.createUser(createUserDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('users')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar todos los usuarios (Solo Admin)' })
  @ApiResponse({ status: 200, description: 'Lista de usuarios', type: AdminUserListItemDto, isArray: true })
  @ApiResponse({ status: 403, description: 'No autorizado' })
  async getAllUsers() {
    return this.authService.getAllUsers();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete('users/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar usuario (Solo Admin)' })
  @ApiResponse({ status: 200, description: 'Usuario eliminado', type: MessageResponseDto })
  @ApiResponse({ status: 403, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async deleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.authService.deleteUser(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch('users/:id/activate')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Activar/Desactivar usuario (Solo Admin)' })
  @ApiResponse({ status: 200, description: 'Usuario actualizado', type: ActivateUserResponseDto })
  @ApiResponse({ status: 403, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async activateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() activateUserDto: ActivateUserDto,
  ) {
    return this.authService.activateUser(id, activateUserDto);
  }
}
