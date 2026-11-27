import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, NavigationEnd } from '@angular/router';
 import { Auth } from '../services/auth';
 import { filter, map } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  private router = inject(Router);
private authService = inject(Auth);
  private url = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map(e => e.urlAfterRedirects)
    ),
    { initialValue: this.router.url }
  );

  // Hide the bar on the auth pages
  visible = computed(() => !['/login', '/register'].some(p => this.url().startsWith(p)));

  async logout() {
    await this.authService.logout();
    this.router.navigate(['/login']);
  }
}