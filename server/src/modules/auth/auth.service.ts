import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../../db/client.js';
import { env } from '../../config/env.js';
import { LoginInput, RegisterInput } from './auth.schemas.js';

export class AuthService {
  /**
   * Registra um novo usuário
   */
  async register(input: RegisterInput) {
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw new Error('Email já em uso');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(input.password, salt);

    const user = await prisma.user.create({
      data: {
        email: input.email,
        passwordHash,
        role: 'user', // Default role for users
      },
    });

    // Gerar JWT (opcional logar automático, mas vamos retornar aqui)
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return {
      accessToken: token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }

  /**
   * Autentica usuário e retorna token JWT
   */
  async login(input: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (!user) {
      throw new Error('Credenciais inválidas');
    }

    const passwordValid = await bcrypt.compare(input.password, user.passwordHash);

    if (!passwordValid) {
      throw new Error('Credenciais inválidas');
    }

    // Gerar JWT
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return {
      accessToken: token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }

  /**
   * Busca informações do usuário autenticado
   */
  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    return user;
  }
}

export const authService = new AuthService();
