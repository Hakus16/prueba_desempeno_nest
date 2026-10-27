import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { UsersRepository } from '../users/repositories/users.repository';

/**
 * Capa de Lógica de Negocio / Servicio para Autenticación.
 * Gestiona el registro con hashing y la validación de inicio de sesión con JWT.
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existing = await this.usersRepository.findByEmail(registerDto.email);
    if (existing) {
      throw new ConflictException(`El correo ${registerDto.email} ya está registrado`);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(registerDto.password, salt);

    const newUser = this.usersRepository.create({
      email: registerDto.email,
      password: hashedPassword,
      role: registerDto.role,
      isActive: true,
    });

    const saved = await this.usersRepository.save(newUser);
    const { password, ...result } = saved;
    return result;
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersRepository.findByEmail(loginDto.email, true);

    if (!user) {
      throw new UnauthorizedException('Credenciales incorrectas: correo o contraseña inválidos');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('La cuenta de usuario se encuentra inactiva');
    }

    const isMatch = await bcrypt.compare(loginDto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Credenciales incorrectas: correo o contraseña inválidos');
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }
}
