import { Injectable } from '@angular/core';
import { authClient } from './auth-client';

@Injectable({ providedIn: 'root' })
export class AuthService {
  async getSession() {
    return authClient.getSession();
  }

  async signIn(email: string, password: string) {
    return authClient.signIn.email({ email, password });
  }

  async signUp(name: string, email: string, password: string) {
    return authClient.signUp.email({ name, email, password });
  }
}
