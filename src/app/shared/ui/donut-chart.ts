import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ChartSegment } from '../../core/models/dashboard.models';

const RADIUS = 40;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

@Component({
  selector: 'app-donut-chart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="wrap">
      <svg viewBox="0 0 100 100" width="120" height="120" role="img" [attr.aria-label]="total() + ' total'">
        <circle cx="50" cy="50" [attr.r]="radius" fill="none" stroke="#eef0f6" stroke-width="14" />
        @for (arc of arcs(); track arc.label) {
          <circle
            cx="50" cy="50" [attr.r]="radius" fill="none" stroke-width="14"
            transform="rotate(-90 50 50)"
            [attr.stroke]="arc.color"
            [attr.stroke-dasharray]="arc.dash"
            [attr.stroke-dashoffset]="arc.offset" />
        }
        <text x="50" y="48" text-anchor="middle" class="num">{{ total() }}</text>
        <text x="50" y="60" text-anchor="middle" class="lbl">Total</text>
      </svg>
      <ul class="legend">
        @for (s of segments(); track s.label) {
          <li><i [style.background]="s.color"></i>{{ s.label }} ({{ s.value }})</li>
        }
      </ul>
    </div>
  `,
  styles: `
    .wrap { display:flex; align-items:center; gap:20px; }
    .num { font-size:14px; font-weight:700; fill:#111; }
    .lbl { font-size:7px; fill:#777; }
    .legend { list-style:none; margin:0; padding:0; font-size:12px; color:#444; display:grid; gap:6px; }
    i { display:inline-block; width:9px; height:9px; border-radius:50%; margin-right:6px; }
  `,
})
export class DonutChart {
  segments = input.required<ChartSegment[]>();
  readonly radius = RADIUS;

  total = computed(() => this.segments().reduce((sum, s) => sum + s.value, 0));

  arcs = computed(() => {
    const total = this.total();
    let offset = 0;
    return this.segments().map(s => {
      const length = total ? (s.value / total) * CIRCUMFERENCE : 0;
      const arc = { ...s, dash: `${length} ${CIRCUMFERENCE - length}`, offset: -offset };
      offset += length;
      return arc;
    });
  });
}