import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cars',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cars.html',
  styleUrl: './cars.css'
})

export class Cars implements OnInit {
  cars: any[] = [];
  search = '';
  selectedCarId: string | null = null;
  startDate = '';
  endDate = '';
  bookingMessage = '';
  role: string | null = null;
  showModal = false;
  selectedCarDetails: any = null;
  selectedCarReviews: any[] = [];
  bookingLocation = '';



  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.checkRole();
    this.fetchCars();
  }

  checkRole() {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.role = payload.role;
      } catch {
        this.role = null;
      }
    }
  }

  fetchCars() {
    const query = this.search ? `?search=${this.search}` : '';
    this.http.get<any[]>(`http://localhost:3000/vehicle${query}`).subscribe({
      next: (res) => {
        this.cars = res;
      },
      error: (err) => {
        console.error('Error fetching vehicles:', err);
      }
    });
  }

  onSearchChange() {
    this.fetchCars();
  }

  onCarClick(carId: string) {
    // Only allow booking form toggle for CUSTOMERS
    if (this.role !== 'CUSTOMER') return;

    this.selectedCarId = this.selectedCarId === carId ? null : carId;
    this.bookingMessage = '';
    this.startDate = '';
    this.endDate = '';
    this.bookingLocation = '';
  }

  bookCar(carId: string) {
    const token = localStorage.getItem('token');
    if (!token) {
      this.bookingMessage = 'You must be logged in to book.';
      return;
    }

    if (!this.startDate || !this.endDate) {
      this.bookingMessage = 'Please select both start and end dates.';
      return;
    }

    this.http.post(`http://localhost:3000/booking`, {
      vehicleId: carId,
      startDate: this.startDate,
      endDate: this.endDate,
      location: this.bookingLocation.trim()
    }, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: () => {
        this.bookingMessage = 'Booking successful!';
        this.selectedCarId = null;
        this.fetchCars();
      },
      error: (err) => {
        this.bookingMessage = err.error.message || 'Booking failed.';
      }
    });
  }

  viewDetails(carId: string) {
  this.router.navigate(['/cars', carId]);
  }


}
