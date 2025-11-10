import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { generateSecurePassword, PWOptions } from './secure-generator';


@Component({
  selector: 'app-root',
  standalone: true,          // <-- il est standalone
  imports: [FormsModule, CommonModule], // <-- obligatoire pour ngModel et *ngIf
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  length = 24;
  useLower = true;
  useUpper = true;
  useNumbers = true;
  useSymbols = true;
  excludeAmbiguous = true;
  pronounceable = false;

  password = '';
  showCopied = false;

  generate() {
    const opts: PWOptions = {
      length: this.length,
      useLower: this.useLower,
      useUpper: this.useUpper,
      useNumbers: this.useNumbers,
      useSymbols: this.useSymbols,
      excludeAmbiguous: this.excludeAmbiguous,
      pronounceable: this.pronounceable
    };
    this.password = generateSecurePassword(opts);
    this.showCopied = false;
  }

  async copy() {
    if (!this.password) return;
    try {
      await navigator.clipboard.writeText(this.password);
      this.showCopied = true;
      setTimeout(() => this.showCopied = false, 1800);
    } catch (e) {
      // fallback: select text
      console.warn('Clipboard failed, user must copy manually', e);
    }
  }

  clear() {
    this.password = '';
  }
}
