import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { DashboardStore } from './dashboard.store';
import { DashboardConfig } from '../models/dashboard.models';

const mock: DashboardConfig = {
  categories: [
    {
      id: 'a', name: 'Category A', shortName: 'A',
      widgets: [
        { id: '1', name: 'One', text: 'first', type: 'text', selected: true },
        { id: '2', name: 'Two', text: 'second', type: 'text', selected: true },
      ],
    },
  ],
};

describe('DashboardStore', () => {
  let store: InstanceType<typeof DashboardStore>;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    store = TestBed.inject(DashboardStore);
    store.init();
    TestBed.inject(HttpTestingController).expectOne('dashboard.json').flush(mock);
  });

  it('loads categories from JSON', () => {
    expect(store.status()).toBe('ready');
    expect(store.visibleCategories()[0].widgets.length).toBe(2);
  });

  it('removes a widget from the visible list', () => {
    store.removeWidget('a', '1');
    expect(store.visibleCategories()[0].widgets.map(w => w.id)).toEqual(['2']);
  });

  it('adds a new widget to a category', () => {
    store.addWidget('a', { name: 'Three', text: 'third' });
    expect(store.visibleCategories()[0].widgets.length).toBe(3);
  });

  it('filters widgets by search term', () => {
    store.setSearch('two');
    expect(store.visibleCategories()[0].widgets.map(w => w.id)).toEqual(['2']);
  });

  it('applies checkbox selection', () => {
    store.applySelection({ '1': false });
    expect(store.visibleCategories()[0].widgets.map(w => w.id)).toEqual(['2']);
  });
});