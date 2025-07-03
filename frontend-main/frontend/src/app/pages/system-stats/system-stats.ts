import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-system-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './system-stats.html',
  styleUrl: './system-stats.css'
})
export class SystemStats implements OnInit {
  totalUsers = 0;
  totalVehicles = 0;
  totalBookings = 0;
  loading = true;
  error = '';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.fetchStats();
  }

  fetchStats() {
    const token = localStorage.getItem('token');
    if (!token) {
      this.error = 'Unauthorized';
      this.loading = false;
      return;
    }

    this.http.get<any>('http://localhost:3000/user/stats', {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (res) => {
        this.totalUsers = res.totalUsers;
        this.totalVehicles = res.totalVehicles;
        this.totalBookings = res.totalBookings;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error.message || 'Failed to load system stats.';
        this.loading = false;
      }
    });
  }

  goTo(path: string) {
    this.router.navigate([`/${path}`]);
  }
}
