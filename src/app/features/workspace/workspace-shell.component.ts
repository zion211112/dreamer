/**
 * @apt-labs/features/workspace — WorkspaceShellComponent
 *
 * Workspace shell parent. Delegates layout to ShellLayoutComponent, which
 * owns the topbar, primary navigation, contextual sidebar, work surface and
 * status footer (charter B3).
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
