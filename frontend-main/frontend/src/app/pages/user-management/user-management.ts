import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-management.html',
  styleUrl: './user-management.css'
})
export class UserManagement implements OnInit {
  users: any[] = [];
  filteredUsers: any[] = [];
  loading = true;
  error = '';
  search = '';
  role = '';
  startDate = '';
  endDate = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchUsers();
  }

  fetchUsers() {
    this.loading = true;
    this.error = '';

    let params = new HttpParams();
    if (this.role) params = params.set('role', this.role);
    if (this.startDate) params = params.set('startDate', this.startDate);
    if (this.endDate) params = params.set('endDate', this.endDate);
    if (this.search) params = params.set('search', this.search);

    const token = localStorage.getItem('token');
    if (!token) {
      this.error = 'Unauthorized';
      this.loading = false;
      return;
    }

    this.http.get<any[]>('http://localhost:3000/user/all', {
      headers: { Authorization: `Bearer ${token}` },
      params
    }).subscribe({
      next: (res) => {
        this.users = res;
        this.filteredUsers = res;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error.message || 'Failed to fetch users.';
        this.loading = false;
      }
    });
  }

  onFilterChange() {
    this.fetchUsers();
  }

  clearFilters() {
    this.search = '';
    this.role = '';
    this.startDate = '';
    this.endDate = '';
    this.fetchUsers();
  }
}
