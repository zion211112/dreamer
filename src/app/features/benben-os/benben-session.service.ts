import { Injectable, computed, inject, signal } from '@angular/core';
import { BenbenApi, ApiError } from './benben-api.service';
import type { Me } from './benben.models';

/** One school session shared by the shell and every screen. */
@Injectable({ providedIn: 'root' })
export class BenbenSession {
  private readonly api = inject(BenbenApi);

  readonly me = signal<Me | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly needsSchool = signal(false);

  readonly role = computed(() => this.me()?.member.role ?? null);
  readonly capabilities = computed(() => this.me()?.capabilities ?? []);

  can(capability: string): boolean {
    return this.capabilities().includes(capability);
  }

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      this.me.set(await this.api.get<Me>('/me'));
      this.needsSchool.set(false);
    } catch (error) {
      if (error instanceof ApiError && error.code === 'no_school_membership') {
        this.needsSchool.set(true);
        this.me.set(null);
      } else {
        this.error.set(error instanceof ApiError ? error.code : 'network_error');
      }
    } finally {
      this.loading.set(false);
    }
  }

  async createSchool(payload: unknown): Promise<void> {
    await this.api.send('POST', '/schools', payload);
    await this.load();
  }
}
