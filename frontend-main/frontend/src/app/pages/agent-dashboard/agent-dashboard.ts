import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-agent-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './agent-dashboard.html',
  styleUrl: './agent-dashboard.css'
})
export class AgentDashboard {
  constructor(private router: Router) {}


  ngOnInit(): void {
    document.body.classList.add('agent-dashboard-page');
  }

  ngOnDestroy(): void {
    document.body.classList.remove('agent-dashboard-page');
  }


  goTo(path: string) {
    this.router.navigate([`/${path}`]);
  }
}
