/**
 * @apt-labs/features/workspace — WorkspaceShellComponent
 *
 * Workspace shell parent. Delegates layout to ShellLayoutComponent which
 * defines the six functional regions (topbar, rail, sidebar, main,
 * inspector, dock) plus a separate persistent statusbar (charter B3).
 */
import { Component } from '@angular/core';
import { ShellLayoutComponent } from './shell-layout.component';

@Component({
  selector: 'app-workspace-shell',
  imports: [ShellLayoutComponent],
  template: `<app-shell-layout></app-shell-layout>`,
  styles: [],
})
export class WorkspaceShellComponent {}
