import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './change-password.html',
  styleUrl: './change-password.css'
})
export class ChangePassword {
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  message = '';
  error = '';

  constructor(private http: HttpClient, private router: Router) {}

  onChangePassword() {
    this.error = '';
    this.message = '';

    if (this.newPassword !== this.confirmPassword) {
      this.error = 'New passwords do not match';
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      this.error = 'You must be logged in';
      return;
    }

    this.http.patch('http://localhost:3000/user/change-password', {
      currentPassword: this.currentPassword,
      newPassword: this.newPassword,
      confirmPassword: this.confirmPassword
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).subscribe({
      next: () => {
        this.message = 'Password updated successfully';
        this.currentPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
      },
      error: (err) => {
        this.error = err.error.message || 'Password change failed';
      }
    });
  }
}
