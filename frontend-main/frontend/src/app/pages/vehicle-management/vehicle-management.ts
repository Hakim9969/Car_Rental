import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-vehicle-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './vehicle-management.html',
  styleUrl: './vehicle-management.css'
})
export class VehicleManagementComponent implements OnInit {
  vehicles: any[] = [];
  error = '';
  success = '';
  uploadingImage = false;

  // Form state
  isFormVisible = false;
  editingVehicle: any = null;

  // Form fields
  vehicleForm = {
    title: '',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    category: '',
    pricePerDay: 0,
    transmission: '',
    fuelType: '',
    features: '', // Store as comma-separated string
    imageUrl: '',
    description: '',
    available: true,  
    location: ''
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchVehicles();
  }

  fetchVehicles() {
    this.http.get<any[]>('http://localhost:3000/vehicle').subscribe({
      next: (res) => {
        this.vehicles = res;
      },
      error: () => {
        this.error = 'Failed to fetch vehicles';
      }
    });
  }

  openAddForm() {
    this.resetForm();
    this.isFormVisible = true;
  }

  openEditForm(vehicle: any) {
    this.vehicleForm = {
      ...vehicle,
      features: (vehicle.features || []).join(', ') // 🔥 HIGHLIGHT: convert array to comma string
    };
    this.editingVehicle = vehicle;
    this.isFormVisible = true;
  }

  cancelForm() {
    this.resetForm();
    this.isFormVisible = false;
  }

  resetForm() {
    this.vehicleForm = {
      title: '',
      brand: '',
      model: '',
      year: new Date().getFullYear(),
      category: '',
      pricePerDay: 0,
      transmission: '',
      fuelType: '',
      available: true,
      features: '',
      imageUrl: '',
      description: '',
      location: ''
    };
    this.editingVehicle = null;
    this.error = '';
    this.success = '';
  }

  submitForm() {
    const token = localStorage.getItem('token');
    if (!token) return;

    const headers = { Authorization: `Bearer ${token}` };

    // 🔥 HIGHLIGHT: Convert comma string to array
    const payload = {
      ...this.vehicleForm,
      features: this.vehicleForm.features
        .split(',')
        .map(f => f.trim())
        .filter(f => f !== '')
    };

    if (this.editingVehicle) {
      // 🔥 HIGHLIGHT: Use payload for PATCH
      this.http.patch(`http://localhost:3000/vehicle/${this.editingVehicle.id}`, payload, { headers }).subscribe({
        next: () => {
          this.success = 'Vehicle updated successfully';
          this.cancelForm();
          this.fetchVehicles();
        },
        error: (err) => {
          this.error = err.error.message || 'Update failed';
        }
      });
    } else {
      // 🔥 HIGHLIGHT: Use payload for POST
      this.http.post('http://localhost:3000/vehicle', payload, { headers }).subscribe({
        next: () => {
          this.success = 'Vehicle added successfully';
          this.cancelForm();
          this.fetchVehicles();
        },
        error: (err) => {
          this.error = err.error.message || 'Add failed';
        }
      });
    }
  }

  deleteVehicle(id: string) {
    if (!confirm('Are you sure you want to delete this vehicle?')) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    this.http.delete(`http://localhost:3000/vehicle/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: () => {
        this.success = 'Vehicle deleted';
        this.fetchVehicles();
      },
      error: () => {
        this.error = 'Delete failed';
      }
    });
  }

  onImageSelected(event: Event) {
  const input = event.target as HTMLInputElement;
  if (!input.files || input.files.length === 0) return;

  const file = input.files[0];
  const formData = new FormData();
  formData.append('file', file);

  this.uploadingImage = true;

  this.http.post<{ imageUrl: string }>('http://localhost:3000/vehicle/upload-image', formData).subscribe({
    next: (res) => {
      this.vehicleForm.imageUrl = res.imageUrl;
      this.uploadingImage = false;
    },
    error: (err) => {
      this.error = 'Image upload failed';
      this.uploadingImage = false;
    }
  });
  }

}
