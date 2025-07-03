import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterModule,
  RouterOutlet,
  NavigationEnd
} from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [RouterOutlet, RouterModule, RouterLink, RouterLinkActive, FormsModule, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  // Form visibility
  showLogin = false;
  showRegister = false;

  // Form data
  name = '';
  email = '';
  phone = '';
  password = '';
  confirmPassword = '';
  error = '';

  loginEmail = '';
  loginPassword = '';
  loginError = '';

  // Auth state
  isAuthenticated = false;
  userRole: string | null = null;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
  this.router.events.subscribe((event) => {
    if (event instanceof NavigationEnd) {
      const url = event.urlAfterRedirects;

      // Set route-specific body class
      const body = document.body;
      body.className = ''; // Reset first

      if (url === '/') body.classList.add('home-page');
      else if (url.startsWith('/dashboard')) body.classList.add('dashboard-page');
      else if (url.startsWith('/cars')) body.classList.add('cars-page');
      else if (url.startsWith('/bookings')) body.classList.add('bookings-page');
    }

    // Handle modal visibility based on queryParams
    const currentUrl = new URL(window.location.href);
    this.showLogin = currentUrl.searchParams.get('login') === 'true';
    this.showRegister = currentUrl.searchParams.get('register') === 'true';
    this.checkAuth();
  });

  this.checkAuth();
}


  // ✅ Check token and extract role
  checkAuth() {
    const token = localStorage.getItem('token');
    if (token) {
      const role = this.getRoleFromToken(token);
      this.isAuthenticated = !!role;
      this.userRole = role;
    } else {
      this.isAuthenticated = false;
      this.userRole = null;
    }
  }

  // ✅ Parse role from JWT
  getRoleFromToken(token: string): string | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role || null;
    } catch {
      return null;
    }
  }

  // ✅ Toggle visibility of login/register on home page
  isHome(): boolean {
    return this.router.url === '/';
  }

  toggleLogin() {
    if (this.isHome()) {
      this.showLogin = !this.showLogin;
      if (this.showLogin) this.showRegister = false;
    } else {
      this.router.navigate(['/'], { queryParams: { login: 'true' } });
    }
  }

  toggleRegister() {
    if (this.isHome()) {
      this.showRegister = !this.showRegister;
      if (this.showRegister) this.showLogin = false;
    } else {
      this.router.navigate(['/'], { queryParams: { register: 'true' } });
    }
  }

  // ✅ Registration logic
  onRegister() {
    this.error = '';
    if (this.password !== this.confirmPassword) {
      this.error = 'Passwords do not match';
      return;
    }

    this.http.post('http://localhost:3000/auth/register', {
      name: this.name,
      email: this.email,
      phone: this.phone,
      password: this.password,
      confirmPassword: this.confirmPassword
    }).subscribe({
      next: () => {
        this.showRegister = false;
        this.router.navigate(['/'], { queryParams: { login: 'true' } });
      },
      error: (err) => {
        this.error = err.error.message || 'Registration failed';
      }
    });
  }

  // ✅ Login logic with role-based redirect
  onLogin() {
    this.loginError = '';

    this.http.post<{ access_token: string }>('http://localhost:3000/auth/login', {
      email: this.loginEmail,
      password: this.loginPassword
    }).subscribe({
      next: (res) => {
        localStorage.setItem('token', res.access_token);
        this.showLogin = false;
        this.checkAuth(); // Update role state

        // Refresh My Bookings page
        if (this.router.url.includes('bookings')) {
          this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
            this.router.navigate(['/bookings']);
          });
        }

        // Role-based redirect
        if (this.userRole === 'ADMIN') {
          this.router.navigate(['/dashboard/admin']);
        } else if (this.userRole === 'AGENT') {
          this.router.navigate(['/dashboard/agent']);
        } else {
          this.router.navigate(['/dashboard/customer']);
        }
      },
      error: (err) => {
        this.loginError = err.error.message || 'Login failed';
      }
    });
  }

  // ✅ Logout logic
  logout() {
  if (confirm('Are you sure you want to logout?')) {
    // Clear token and auth state
    localStorage.removeItem('token');
    this.isAuthenticated = false;
    this.userRole = null;

    // Navigate to home and reload to reset app state
    this.router.navigate(['/']).then(() => {
      window.location.reload();
    });
  }
}
  closeLogin() {
  this.showLogin = false;
  // Clear query params and reload home
  this.router.navigate(['/'], { queryParams: {} }).then(() => {
    window.location.reload();
  });
}

closeRegister() {
  this.showRegister = false;
  // Clear query params and reload home
  this.router.navigate(['/'], { queryParams: {} }).then(() => {
    window.location.reload();
  });
}

showLogoutConfirm = false;

confirmLogout() {
  this.showLogoutConfirm = true;
}

cancelLogout() {
  this.showLogoutConfirm = false;
}

logoutConfirmed() {
  localStorage.removeItem('token');
  this.isAuthenticated = false;
  this.userRole = null;

  this.router.navigate(['/']).then(() => {
    window.location.reload();
  });
}


}
