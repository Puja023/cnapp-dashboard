import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Widget } from '../../core/models/dashboard.models';
import { DonutChart } from '../../shared/ui/donut-chart';
import { StackedBar } from '../../shared/ui/stacked-bar';

@Component({
  selector: 'app-widget-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DonutChart, StackedBar],
  template: `
    <article class="card">
      <header>
        <h3>{{ widget().name }}</h3>
        <button type="button" class="x" (click)="remove.emit()" [attr.aria-label]="'Remove ' + widget().name">✕</button>
      </header>

      @switch (widget().type) {
        @case ('donut') { <app-donut-chart [segments]="widget().segments ?? []" /> }
        @case ('bar') { <app-stacked-bar [segments]="widget().segments ?? []" /> }
        @case ('empty') { <div class="empty" aria-hidden="true">📊</div> }
      }
      <p [class.center]="widget().type === 'empty'">{{ widget().text }}</p>
    </article>
  `,
  styles: `
    .card { background:#fff; border-radius:12px; padding:14px 16px; min-height:170px; box-shadow:0 1px 3px #0001; height:100%; box-sizing:border-box; }
    header { display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; }
    h3 { margin:0; font-size:13px; font-weight:600; }
    .x { border:none; background:none; cursor:pointer; color:#999; font-size:14px; }
    .x:hover, .x:focus-visible { color:#c0201f; }
    p { margin:10px 0 0; font-size:12px; color:#666; }
    .center { text-align:center; }
    .empty { text-align:center; font-size:28px; opacity:.35; margin-top:20px; }
  `,
})
export class WidgetCard {
  widget = input.required<Widget>();
  remove = output<void>();
}