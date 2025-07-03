import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// Define interface for better type safety
interface Vehicle {
  id: string;
  title: string;
  brand: string;
  location: string;
  model: string;
  pricePerDay: number;
  imageUrl?: string;
  available: boolean;
}

interface SearchFilters {
  location: string;
  startDate: string;
  endDate: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
  showRegister = false;
  showLogin = false; 
  name = '';
  email = '';
  phone = '';
  password = '';
  confirmPassword = '';
  error = '';

  locations: string[] = [];
  vehicles: Vehicle[] = [];
  searchAttempted = false;
  isLoading = false;

  filters: SearchFilters = {
    location: '',
    startDate: '',
    endDate: ''
  };

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.fetchLocations();
    this.fetchAvailableVehicles();
  }

  fetchLocations() {
    this.http.get<string[]>('http://localhost:3000/vehicle/locations').subscribe({
      next: (res) => {
        this.locations = res;
        console.log('Locations fetched:', this.locations);
      },
      error: (err) => {
        console.error('Error fetching locations:', err);
        this.locations = [];
      }
    });
  }

  fetchAvailableVehicles() {
    this.isLoading = true;
    this.http.get<Vehicle[]>('http://localhost:3000/vehicle?available=true').subscribe({
      next: (res) => {
        // Ensure each vehicle has a model property, provide fallback if missing
        this.vehicles = res.slice(0, 4).map(vehicle => ({
          ...vehicle,
          model: vehicle.model || 'Unknown Model'
        }));
        this.searchAttempted = false;
        this.isLoading = false;
        console.log('Vehicles fetched:', this.vehicles);
      },
      error: (err) => {
        console.error('Error fetching vehicles:', err);
        this.vehicles = [];
        this.isLoading = false;
      }
    });
  }

  filterVehicles() {
    const { location, startDate, endDate } = this.filters;
    
    // Validate required fields
    if (!location || !startDate || !endDate) {
      this.error = 'Please fill in all search fields';
      return;
    }

    // Validate date range
    if (new Date(startDate) >= new Date(endDate)) {
      this.error = 'End date must be after start date';
      return;
    }

    this.error = '';
    this.isLoading = true;

    const params = new URLSearchParams({
      location,
      startDate,
      endDate,
      available: 'true'
    });

    this.http.get<Vehicle[]>(`http://localhost:3000/vehicle/available?${params.toString()}`).subscribe({
      next: (res) => {
        // Ensure each vehicle has a model property with fallback
        this.vehicles = res.map(vehicle => ({
          ...vehicle,
          model: vehicle.model || 'Unknown Model'
        }));
        this.searchAttempted = true;
        this.isLoading = false;
        console.log('Filtered vehicles:', this.vehicles);
      },
      error: (err) => {
        console.error('Error filtering vehicles:', err);
        this.vehicles = [];
        this.searchAttempted = true;
        this.isLoading = false;
        this.error = 'Failed to search vehicles. Please try again.';
      }
    });
  }

  onRegister() {
    this.error = '';

    // Validate required fields
    if (!this.name || !this.email || !this.phone || !this.password) {
      this.error = 'Please fill in all fields';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.error = 'Passwords do not match';
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.error = 'Please enter a valid email address';
      return;
    }

    this.http.post('http://localhost:3000/auth/register', {
      name: this.name,
      email: this.email,
      phone: this.phone,
      password: this.password,
      confirmPassword: this.confirmPassword,
      role: 'CUSTOMER'
    }).subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.error = err.error?.message || 'Registration failed';
      }
    });
  }

  onCarClick(carId: string) {
    const token = localStorage.getItem('token');

    if (token) {
      this.router.navigate(['/cars', carId]);
    } else {
      this.router.navigate(['/'], { queryParams: { login: 'true' } });
    }
  }

  // Helper method to format car model for display
  formatCarModel(model: string): string {
    if (!model || model === 'Unknown Model') return model;
    
    // Capitalize first letter of each word
    return model.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  // Helper method to get default image if none provided
  getCarImageUrl(vehicle: Vehicle): string {
    return vehicle.imageUrl || 'https://via.placeholder.com/300x200/e0e0e0/666666?text=Car+Image';
  }

  // Method to clear search filters
  clearFilters() {
    this.filters = {
      location: '',
      startDate: '',
      endDate: ''
    };
    this.error = '';
    this.fetchAvailableVehicles();
  }

  // Method to set minimum date (today) for date inputs
  get minDate(): string {
    return new Date().toISOString().split('T')[0];
  }
}