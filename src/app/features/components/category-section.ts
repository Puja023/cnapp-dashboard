import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Category } from '../../core/models/dashboard.models';
import { WidgetCard } from './widget-card';

@Component({
  selector: 'app-category-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [WidgetCard],
  template: `
    <section [attr.aria-labelledby]="'cat-' + category().id">
      <h2 [id]="'cat-' + category().id">{{ category().name }}</h2>
      <div class="grid">
        @for (w of category().widgets; track w.id) {
          <app-widget-card [widget]="w" (remove)="removeWidget.emit(w.id)" />
        }
        <button type="button" class="add" (click)="addWidget.emit()">+ Add Widget</button>
      </div>
    </section>
  `,
  styles: `
    section { margin-bottom: 28px; }
    h2 { font-size: 14px; font-weight: 600; margin: 0 0 10px; color: #1b1f3b; }
    .grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(300px, 1fr)); gap:14px; }
    .add { min-height:170px; border:1px dashed #cfd4e2; background:#fafbfd; border-radius:12px; cursor:pointer; color:#667; font-size:13px; }
    .add:hover, .add:focus-visible { background:#eef1f9; }
  `,
})
export class CategorySection {
  category = input.required<Category>();
  removeWidget = output<string>();
  addWidget = output<void>();
}