import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DashboardStore } from '../../core/store/dashboard.store';

@Component({
  selector: 'app-add-widget-drawer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  host: { '(document:keydown.escape)': 'store.closeDrawer()' },
  template: `
    <div class="backdrop" (click)="store.closeDrawer()"></div>
    <aside class="drawer" role="dialog" aria-modal="true" aria-labelledby="drawer-title">
      <header>
        <h2 id="drawer-title">Add Widget</h2>
        <button type="button" (click)="store.closeDrawer()" aria-label="Close">✕</button>
      </header>

      <div class="body">
        <p class="hint">Personalise your dashboard by adding the following widget</p>

        <input type="search" class="search" placeholder="Search all widgets…" aria-label="Search all widgets"
               [value]="search()" (input)="onSearch($event)" />

        <div class="tabs" role="tablist">
          @for (c of store.categories(); track c.id) {
            <button type="button" role="tab" [attr.aria-selected]="c.id === activeTab()"
                    [class.active]="c.id === activeTab()" (click)="activeTab.set(c.id)">
              {{ c.shortName }}
            </button>
          }
        </div>

        @for (item of list(); track item.widget.id) {
          <label class="row">
            <input type="checkbox"
                   [checked]="isChecked(item.widget.id, item.widget.selected)"
                   (change)="toggle(item.widget.id, $event)" />
            <span>{{ item.widget.name }}</span>
            @if (search()) { <small>{{ item.categoryName }}</small> }
          </label>
        } @empty {
          <p class="muted">No widgets found.</p>
        }

        @if (!search()) {
          <form class="new" [formGroup]="form" (ngSubmit)="create()">
            <h3>Create a new widget</h3>
            <label for="w-name">Widget name</label>
            <input id="w-name" formControlName="name" placeholder="e.g. Failed Logins" />
            @if (form.controls.name.touched && form.controls.name.invalid) {
              <small class="err">Name is required (max 40 characters).</small>
            }
            <label for="w-text">Widget text</label>
            <input id="w-text" formControlName="text" placeholder="Any text" />
            @if (form.controls.text.touched && form.controls.text.invalid) {
              <small class="err">Text is required (max 200 characters).</small>
            }
            <button type="submit" class="btn" [disabled]="form.invalid">Add to selected category</button>
          </form>
        }
      </div>

      <footer>
        <button type="button" class="btn" (click)="store.closeDrawer()">Cancel</button>
        <button type="button" class="btn primary" (click)="confirm()">Confirm</button>
      </footer>
    </aside>
  `,
  styles: `
    .backdrop { position:fixed; inset:0; background:#0007; z-index:10; }
    .drawer { position:fixed; top:0; right:0; bottom:0; width:min(480px,100%); background:#fff; z-index:11; display:flex; flex-direction:column; }
    header { background:#0b1068; color:#fff; padding:14px 16px; display:flex; justify-content:space-between; align-items:center; }
    header h2 { margin:0; font-size:14px; font-weight:600; }
    header button { background:none; border:none; color:#fff; cursor:pointer; font-size:16px; }
    .body { flex:1; overflow:auto; padding:16px; }
    .hint { margin:0 0 12px; font-size:13px; color:#444; }
    .search { width:100%; box-sizing:border-box; padding:8px; border:1px solid #d5d9e6; border-radius:6px; }
    .tabs { display:flex; gap:4px; margin:14px 0; border-bottom:1px solid #e6e9f2; }
    .tabs button { border:none; background:none; padding:8px 12px; cursor:pointer; color:#666; font-size:13px; }
    .tabs .active { color:#0b1068; font-weight:600; border-bottom:2px solid #0b1068; }
    .row { display:flex; gap:10px; align-items:center; border:1px solid #e1e4ee; padding:10px; border-radius:6px; margin-bottom:8px; font-size:13px; cursor:pointer; }
    .row small { margin-left:auto; color:#888; }
    .muted { color:#999; font-size:13px; }
    .new { margin-top:20px; padding-top:14px; border-top:1px solid #eee; display:grid; gap:6px; }
    .new h3 { margin:0 0 4px; font-size:13px; }
    .new label { font-size:12px; color:#555; }
    .new input { padding:8px; border:1px solid #d5d9e6; border-radius:6px; }
    .err { color:#c0201f; font-size:12px; }
    footer { padding:12px 16px; display:flex; justify-content:flex-end; gap:8px; border-top:1px solid #eee; }
    .btn { padding:8px 16px; border-radius:6px; border:1px solid #0b1068; background:#fff; color:#0b1068; cursor:pointer; font-size:13px; }
    .btn:disabled { opacity:.5; cursor:not-allowed; }
    .btn.primary { background:#0b1068; color:#fff; }
  `,
})
export class AddWidgetDrawer {
  protected readonly store = inject(DashboardStore);
  private readonly fb = inject(FormBuilder);

  protected readonly activeTab = signal(this.store.drawerCategoryId() ?? this.store.categories()[0]?.id ?? '');
  protected readonly search = signal('');
  /** Unsaved checkbox choices. Cancel simply discards them. */
  private readonly draft = signal<Record<string, boolean>>({});

  protected readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(40)]],
    text: ['', [Validators.required, Validators.maxLength(200)]],
  });

  /** All categories while searching, otherwise only the active tab. */
  protected readonly list = computed(() => {
    const q = this.search().trim().toLowerCase();
    const cats = this.store.categories();
    const source = q ? cats : cats.filter(c => c.id === this.activeTab());
    return source
      .flatMap(c => c.widgets.map(widget => ({ widget, categoryName: c.shortName })))
      .filter(i => !q || i.widget.name.toLowerCase().includes(q) || i.widget.text.toLowerCase().includes(q));
  });

  protected onSearch(event: Event): void {
    this.search.set((event.target as HTMLInputElement).value);
  }

  protected isChecked(id: string, saved: boolean): boolean {
    return this.draft()[id] ?? saved;
  }

  protected toggle(id: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.draft.update(d => ({ ...d, [id]: checked }));
  }

  protected create(): void {
    if (this.form.invalid) return;
    const { name, text } = this.form.getRawValue();
    this.store.addWidget(this.activeTab(), { name: name.trim(), text: text.trim() });
    this.form.reset();
  }

  protected confirm(): void {
    this.store.applySelection(this.draft());
    this.store.closeDrawer();
  }
}