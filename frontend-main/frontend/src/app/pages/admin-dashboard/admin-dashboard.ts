import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css'
})
export class AdminDashboard {
  constructor(private router: Router) {}


  ngOnInit(): void {
    document.body.classList.add('admin-dashboard-page');
  }

  ngOnDestroy(): void {
    document.body.classList.remove('admin-dashboard-page');
  }

  
  goTo(path: string) {
    this.router.navigate([`/${path}`]);
  }
}
