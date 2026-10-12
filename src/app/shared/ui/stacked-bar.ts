import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ChartSegment } from '../../core/models/dashboard.models';

@Component({
  selector: 'app-stacked-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p class="total"><strong>{{ total() }}</strong> Total</p>
    <div class="bar" role="img" [attr.aria-label]="total() + ' total'">
      @for (s of items(); track s.label) {
        <span [style.width.%]="s.pct" [style.background]="s.color"></span>
      }
    </div>
    <ul class="legend">
      @for (s of segments(); track s.label) {
        <li><i [style.background]="s.color"></i>{{ s.label }} ({{ s.value }})</li>
      }
    </ul>
  `,
  styles: `
    .total { margin:0 0 8px; font-size:12px; color:#555; }
    .total strong { font-size:16px; color:#111; }
    .bar { display:flex; height:10px; border-radius:6px; overflow:hidden; background:#eee; }
    .legend { list-style:none; margin:10px 0 0; padding:0; display:grid; grid-template-columns:1fr 1fr; gap:6px; font-size:12px; color:#444; }
    i { display:inline-block; width:9px; height:9px; border-radius:50%; margin-right:6px; }
  `,
})
export class StackedBar {
  segments = input.required<ChartSegment[]>();

  total = computed(() => this.segments().reduce((sum, s) => sum + s.value, 0));
  items = computed(() => {
    const total = this.total();
    return this.segments().map(s => ({ ...s, pct: total ? (s.value / total) * 100 : 0 }));
  });
}