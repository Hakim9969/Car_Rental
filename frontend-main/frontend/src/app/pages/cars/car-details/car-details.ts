import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-car-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './car-details.html',
  styleUrl: './car-details.css'
})
export class CarDetails implements OnInit {
  car: Car | null = null;
  reviews: Review[] = [];
  loading = true;
  error = '';
  role: string | null = null;
  bookingLocation = '';


   // Booking
  startDate = '';
  endDate = '';
  bookingMessage = '';
  bookingError = '';

  // New: Review form state
  showReviewForm = false;
  rating = 5;
  comment = '';
  reviewMessage = '';

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit() {
    const carId = this.route.snapshot.paramMap.get('id');
    this.checkRole();

    if (carId) {
      this.http.get<Car>(`http://localhost:3000/vehicle/${carId}`).subscribe({
        next: (car) => {
          this.car = car;
          this.loading = false;
        },
        error: () => {
          this.error = 'Car not found';
          this.loading = false;
        }
      });

      this.http.get<Review[]>(`http://localhost:3000/reviews/vehicle/${carId}`).subscribe({
        next: (reviews) => (this.reviews = reviews),
        error: () => (this.reviews = [])
      });
    }
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

  submitReview() {
    const token = localStorage.getItem('token');
    if (!token || !this.car?.id) return;

    const body = {
      vehicleId: this.car.id,
      rating: this.rating,
      comment: this.comment
    };

    this.http.post('http://localhost:3000/reviews', body, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: () => {
        this.reviewMessage = 'Review submitted!';
        this.showReviewForm = false;
        this.rating = 5;
        this.comment = '';
        this.ngOnInit(); // Reload reviews
      },
      error: (err) => {
        this.reviewMessage = err.error.message || 'Failed to submit review.';
      }
    });
  }

  bookCar() {
    const token = localStorage.getItem('token');
    this.bookingMessage = '';
    this.bookingError = '';

    if (!token || this.role !== 'CUSTOMER') {
      this.bookingError = 'You must be logged in as a customer to book.';
      return;
    }

    if (!this.startDate || !this.endDate) {
      this.bookingError = 'Please select both start and end dates.';
      return;
    }

    this.http.post(
      'http://localhost:3000/booking',
      {
        vehicleId: this.car?.id,
        startDate: this.startDate,
        endDate: this.endDate,
        location: this.bookingLocation.trim() 
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    ).subscribe({
      next: () => {
        this.bookingMessage = 'Booking successful!';
        this.startDate = '';
        this.endDate = '';
         this.bookingLocation = '';
      },
      error: (err) => {
        this.bookingError = err.error.message || 'Booking failed.';
      }
    });
  }
}

