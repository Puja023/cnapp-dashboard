import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { DashboardStore } from './core/store/dashboard.store';
import { DashboardPage } from './features/dashboard/dashboard-page';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DashboardPage],
  template: `
    <header class="topbar">
      <nav aria-label="Breadcrumb">Home › <strong>Dashboard V2</strong></nav>
      <input type="search" placeholder="Search anything…" aria-label="Search widgets"
             [value]="store.searchTerm()" (input)="onSearch($event)" />
    </header>
    <main>
      <app-dashboard-page />
    </main>
  `,
  styles: `
    .topbar { background:#fff; padding:10px 24px; border-bottom:1px solid #e6e9f2; display:flex; justify-content:space-between; align-items:center; gap:16px; font-size:12px; color:#667; }
    .topbar input { width:min(320px,100%); padding:7px 10px; border:1px solid #d5d9e6; border-radius:6px; background:#f4f6fb; }
    main { padding:20px 24px; max-width:1400px; margin:0 auto; }
  `,
})
export class App implements OnInit {
  protected readonly store = inject(DashboardStore);

  ngOnInit(): void {
    this.store.init();
  }

  protected onSearch(event: Event): void {
    this.store.setSearch((event.target as HTMLInputElement).value);
  }
}