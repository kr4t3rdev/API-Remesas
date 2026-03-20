import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

export interface VerificationTokenResult {
  token: string;
  expiresAt: Date;
}

@Injectable()
export class VerificationTokenService {
  private readonly TOKEN_EXPIRATION_HOURS = 24;
  private readonly PASSWORD_RESET_EXPIRATION_HOURS = 1;

  /**
   * Generate a new verification token with expiration
   */
  generateToken(): VerificationTokenResult {
    const token = randomUUID();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + this.TOKEN_EXPIRATION_HOURS);

    return { token, expiresAt };
  }

  /**
   * Check if a token is expired
   */
  isTokenExpired(expiresAt: Date | null): boolean {
    if (!expiresAt) {
      return true;
    }
    return new Date() > expiresAt;
  }

  /**
   * Get expiration date for a new token
   */
  getExpirationDate(): Date {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + this.TOKEN_EXPIRATION_HOURS);
    return expiresAt;
  }

  generatePasswordResetToken(): VerificationTokenResult {
    const token = randomUUID();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + this.PASSWORD_RESET_EXPIRATION_HOURS);

    return { token, expiresAt };
  }
}
