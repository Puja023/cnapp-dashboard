import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DashboardStore } from '../../core/store/dashboard.store';
import { CategorySection } from '../components/category-section';
import { AddWidgetDrawer } from '../components/add-widget-drawer';

@Component({
  selector: 'app-dashboard-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CategorySection, AddWidgetDrawer],
  template: `
    <div class="toolbar">
      <h1>CNAPP Dashboard</h1>
      <div class="actions">
        <button type="button" class="btn" (click)="store.openDrawer()">Add Widget +</button>
        <button type="button" class="btn" (click)="store.reset()" title="Reset to default widgets">⟳ Reset</button>
      </div>
    </div>

    @switch (store.status()) {
      @case ('loading') { <p class="state" role="status">Loading dashboard…</p> }
      @case ('error') {
        <div class="state error" role="alert">
          Could not load the dashboard.
          <button type="button" class="btn" (click)="store.init()">Retry</button>
        </div>
      }
      @default {
        @for (cat of store.visibleCategories(); track cat.id) {
          <app-category-section
            [category]="cat"
            (removeWidget)="store.removeWidget(cat.id, $event)"
            (addWidget)="store.openDrawer(cat.id)" />
        } @empty {
          <p class="state">No widgets match your search.</p>
        }
      }
    }

    @if (store.drawerOpen()) {
      <app-add-widget-drawer />
    }
  `,
  styles: `
    .toolbar { display:flex; justify-content:space-between; align-items:center; margin-bottom:18px; }
    h1 { font-size:16px; margin:0; color:#1b1f3b; }
    .actions { display:flex; gap:8px; }
    .state { color:#667; font-size:14px; padding:24px 0; }
    .error { color:#c0201f; }
  `,
})
export class DashboardPage {
  protected readonly store = inject(DashboardStore);
}