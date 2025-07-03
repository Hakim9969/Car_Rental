import { Routes } from '@angular/router';
import { Bookings } from './pages/bookings/bookings';
import { Cars } from './pages/cars/cars';
import { Home } from './pages/home/home';
import { AdminDashboard } from './pages/admin-dashboard/admin-dashboard';
import { AgentDashboard } from './pages/agent-dashboard/agent-dashboard';
import { CustomerDashboard } from './pages/customer-dashboard/customer-dashboard';
import { ChangePassword } from './pages/change-password/change-password';
import { VehicleManagementComponent } from './pages/vehicle-management/vehicle-management';
import { SystemStats } from './pages/system-stats/system-stats';
import { UserManagement } from './pages/user-management/user-management';
import { CarDetails } from './pages/cars/car-details/car-details';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'cars', component: Cars },
  { path: 'bookings', component: Bookings },
  { path: 'dashboard/admin', component: AdminDashboard },
  { path: 'dashboard/agent', component: AgentDashboard },
  { path: 'dashboard/customer', component: CustomerDashboard },
  { path: 'change-password', component: ChangePassword },
  { path: 'manage-vehicles', component: VehicleManagementComponent },
  { path: 'users', component: UserManagement },
  { path: 'stats', component: SystemStats },
  { path: 'cars/:id', component: CarDetails }

  
];
