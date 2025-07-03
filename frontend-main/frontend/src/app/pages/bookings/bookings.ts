import { CommonModule } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bookings.html',
  styleUrl: './bookings.css'
})
export class Bookings implements OnInit {
  bookings: any[] = [];
  activeBookings: any[] = [];
  pastBookings: any[] = [];
  loading = true;
  error = '';
  role: string | null = null;

  // Filters
  status = '';
  startDate = '';
  endDate = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchBookings();
  }

  fetchBookings() {
    const token = localStorage.getItem('token');
    if (!token) {
      this.error = 'You must be logged in to view bookings.';
      this.loading = false;
      return;
      
    }

    const payload = this.parseJwt(token);
    this.role = payload?.role;
    const headers = { Authorization: `Bearer ${token}` };

    let endpoint = 'http://localhost:3000/booking/me';
    let params = new HttpParams();

    if (this.role === 'ADMIN' || this.role === 'AGENT') {
      endpoint = 'http://localhost:3000/booking';
      if (this.status) params = params.set('status', this.status);
      if (this.startDate && this.endDate) {
        params = params.set('startDate', this.startDate).set('endDate', this.endDate);
      }
    }

    this.http.get<any[]>(endpoint, { headers, params }).subscribe({
      next: (data) => {
        const now = new Date();
        this.bookings = data;
    
        this.activeBookings = data.filter(b =>
          new Date(b.endDate) >= now && b.status !== 'COMPLETED'
        );

        this.pastBookings = data.filter(b =>
           new Date(b.endDate) < now || b.status === 'COMPLETED'
        );

        this.loading = false;
      },
      error: (err) => {
        this.error = err.error.message || 'Failed to fetch bookings';
        this.loading = false;
      }
    });

  }

  parseJwt(token: string): any | null {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch {
      return null;
    }
  }

  applyFilter() {
    this.loading = true;
    this.fetchBookings();
  }

  updateBookingStatus(id: string, status: string) {
    const token = localStorage.getItem('token');
    this.http.patch(`http://localhost:3000/booking/${id}/status`, { status }, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: () => this.fetchBookings(),
      error: (err) => alert(err.error.message || 'Failed to update booking')
    });
  }

  cancelBooking(id: string) {
  const token = localStorage.getItem('token');
  if (!token) return;

  const confirmCancel = confirm('Are you sure you want to cancel this booking?');
  if (!confirmCancel) return;

  this.http.delete(`http://localhost:3000/booking/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  }).subscribe({
    next: () => {
      alert('Booking cancelled successfully.');
      this.fetchBookings();
    },
    error: (err) => {
      alert(err.error.message || 'Failed to cancel booking');
    }
  });
  }

}
