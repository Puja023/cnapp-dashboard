import { computed, effect, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { patchState, signalStore, withComputed, withHooks, withMethods, withState } from '@ngrx/signals';
import { Category, DashboardConfig, NewWidget } from '../models/dashboard.models';

const STORAGE_KEY = 'cnapp-dashboard:v1';

type Status = 'idle' | 'loading' | 'ready' | 'error';

interface DashboardState {
  categories: Category[];
  searchTerm: string;
  status: Status;
  drawerOpen: boolean;
  drawerCategoryId: string | null;
}

const initialState: DashboardState = {
  categories: [],
  searchTerm: '',
  status: 'idle',
  drawerOpen: false,
  drawerCategoryId: null,
};

function readSaved(): Category[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? (parsed as Category[]) : null;
  } catch {
    return null;
  }
}

function save(categories: Category[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
  } catch {
    /* storage full or blocked: the app still works without persistence */
  }
}

export const DashboardStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),

  withComputed(({ categories, searchTerm }) => ({
    /** Selected widgets only, filtered by the header search. */
    visibleCategories: computed(() => {
      const q = searchTerm().trim().toLowerCase();
      const mapped = categories().map(c => ({
        ...c,
        widgets: c.widgets.filter(
          w => w.selected && (!q || w.name.toLowerCase().includes(q) || w.text.toLowerCase().includes(q)),
        ),
      }));
      // While searching, hide categories without matches
      return q ? mapped.filter(c => c.widgets.length > 0) : mapped;
    }),
  })),

  withMethods((store, http = inject(HttpClient)) => {
    const fetchDefaults = () => {
      patchState(store, { status: 'loading' });
      http.get<DashboardConfig>('dashboard.json').subscribe({
        next: config => patchState(store, { categories: config.categories, status: 'ready' }),
        error: () => patchState(store, { status: 'error' }),
      });
    };

    return {
      init(): void {
        const saved = readSaved();
        if (saved) {
          patchState(store, { categories: saved, status: 'ready' });
        } else {
          fetchDefaults();
        }
      },

      reset(): void {
        localStorage.removeItem(STORAGE_KEY);
        fetchDefaults();
      },

      setSearch(searchTerm: string): void {
        patchState(store, { searchTerm });
      },

      openDrawer(categoryId: string | null = null): void {
        patchState(store, { drawerOpen: true, drawerCategoryId: categoryId });
      },

      closeDrawer(): void {
        patchState(store, { drawerOpen: false });
      },

      removeWidget(categoryId: string, widgetId: string): void {
        patchState(store, state => ({
          categories: state.categories.map(c =>
            c.id !== categoryId
              ? c
              : { ...c, widgets: c.widgets.map(w => (w.id === widgetId ? { ...w, selected: false } : w)) },
          ),
        }));
      },

      addWidget(categoryId: string, { name, text }: NewWidget): void {
        const widget = { id: crypto.randomUUID(), name, text, type: 'text' as const, selected: true };
        patchState(store, state => ({
          categories: state.categories.map(c =>
            c.id === categoryId ? { ...c, widgets: [...c.widgets, widget] } : c,
          ),
        }));
      },

      /** Applies the checkbox choices from the drawer: { widgetId: checked } */
      applySelection(choices: Record<string, boolean>): void {
        patchState(store, state => ({
          categories: state.categories.map(c => ({
            ...c,
            widgets: c.widgets.map(w => ({ ...w, selected: choices[w.id] ?? w.selected })),
          })),
        }));
      },
    };
  }),

  withHooks({
    onInit(store) {
      // Persist every change once the data is ready
      effect(() => {
        const categories = store.categories();
        if (store.status() === 'ready') {
          save(categories);
        }
      });
    },
  }),
);