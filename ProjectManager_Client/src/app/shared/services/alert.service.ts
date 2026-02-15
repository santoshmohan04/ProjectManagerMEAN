import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable()
export class AlertService {
  constructor(private snackBar: MatSnackBar) {}

  success(message: string, title?: string, duration = 3000) {
    const displayMessage = title ? `${title}: ${message}` : message;
    this.snackBar.open(displayMessage, 'Close', {
      duration,
      panelClass: ['snackbar-success']
    });
  }

  error(message: string, title?: string, duration = 5000) {
    const displayMessage = title ? `${title}: ${message}` : message;
    this.snackBar.open(displayMessage, 'Close', {
      duration,
      panelClass: ['snackbar-error']
    });
  }

  info(message: string, title?: string, duration = 3000) {
    const displayMessage = title ? `${title}: ${message}` : message;
    this.snackBar.open(displayMessage, 'Close', {
      duration,
      panelClass: ['snackbar-info']
    });
  }

  warning(message: string, title?: string, duration = 4000) {
    const displayMessage = title ? `${title}: ${message}` : message;
    this.snackBar.open(displayMessage, 'Close', {
      duration,
      panelClass: ['snackbar-warning']
    });
  }
}