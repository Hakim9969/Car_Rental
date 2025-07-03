import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './customer-dashboard.html',
  styleUrl: './customer-dashboard.css'
})
export class CustomerDashboard implements OnInit, OnDestroy {
  constructor(private router: Router) {}

  ngOnInit(): void {
    document.body.classList.add('customer-dashboard-page');
  }

  ngOnDestroy(): void {
    document.body.classList.remove('customer-dashboard-page');
  }

  goTo(path: string): void {
    this.router.navigate([`/${path}`]);
  }
}
