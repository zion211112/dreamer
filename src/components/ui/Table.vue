<script setup lang="ts">
/**
 * Table — Structural Emergence
 * Data display with purpose. Sortable, striped, responsive.
 * No decorative zebra stripes without meaning, no arbitrary hover effects.
 */
import { computed, ref } from 'vue';

interface Column<T = any> {
  key: string;
  label: string;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  width?: string;
  render?: (row: T, value: any) => any;
  class?: string;
}

interface TableProps<T = any> {
  columns: Column<T>[];
  rows: T[];
  keyField: string;
  striped?: boolean;
  hoverable?: boolean;
  bordered?: boolean;
  compact?: boolean;
  emptyText?: string;
  loading?: boolean;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  class?: string;
}

interface TableEmits {
  sort: [key: string, dir: 'asc' | 'desc'];
  rowClick: [row: any, event: MouseEvent];
}

const props = defineProps<TableProps>();
const emit = defineEmits<TableEmits>();

const sortBy = ref(props.sortBy ?? '');
const sortDir = ref<'asc' | 'desc'>(props.sortDir ?? 'asc');

const sortedRows = computed(() => {
  if (!sortBy.value) return props.rows;
  const col = props.columns.find(c => c.key === sortBy.value);
  if (!col || !col.sortable) return props.rows;

  return [...props.rows].sort((a, b) => {
    const aVal = a[col.key];
    const bVal = b[col.key];
    if (aVal === bVal) return 0;
    if (aVal === null || aVal === undefined) return 1;
    if (bVal === null || bVal === undefined) return -1;
    const dir = sortDir.value === 'asc' ? 1 : -1;
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return aVal.localeCompare(bVal) * dir;
    }
    return (aVal > bVal ? 1 : -1) * dir;
  });
});

function handleSort(key: string) {
  const col = props.columns.find(c => c.key === key);
  if (!col?.sortable) return;
  if (sortBy.value === key) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortBy.value = key;
    sortDir.value = 'asc';
  }
  emit('sort', sortBy.value, sortDir.value);
}

function handleRowClick(row: any, event: MouseEvent) {
  emit('rowClick', row, event);
}

function getSortIcon(key: string) {
  if (sortBy.value !== key) return null;
  return sortDir.value === 'asc' ? 'asc' : 'desc';
}

const tableClasses = computed(() => [
  'apt-table',
  props.compact ? 'apt-table--compact' : '',
  props.bordered ? 'apt-table--bordered' : '',
  props.class,
].filter(Boolean));

const clickable = computed(() => {
  // Check if there's a rowClick listener or if any column has a clickable render
  return true; // Always allow, emit will handle
});
</script>

<template>
  <div class="apt-table-wrapper" :class="{ 'apt-table-wrapper--loading': loading }">
    <div class="apt-table-container" role="region" aria-label="Data table" tabindex="0">
      <table class="apt-table" :class="tableClasses">
        <thead>
          <tr>
            <th
              v-for="col in columns"
              :key="col.key"
              :scope="col"
              :style="{ width: col.width, textAlign: col.align || 'left' }"
              :class="['apt-th', col.sortable ? 'apt-th--sortable' : '', col.class]"
              @click="col.sortable && handleSort(col.key)"
            >
              <div class="apt-th-content">
                <span>{{ col.label }}</span>
                <span v-if="col.sortable" class="apt-th-sort" :aria-sort="getSortIcon(col.key) || 'none'">
                  <svg v-if="getSortIcon(col.key) === 'asc'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M18 15l-6-6-6 6" /></svg>
                  <svg v-else-if="getSortIcon(col.key) === 'desc'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
                  <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M18 15l-6-6-6 6M6 9l6 6 6-6" stroke-opacity="0.3" /></svg>
                </span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="rows.length === 0 && !loading" class="apt-tr--empty">
            <td :colspan="columns.length" class="apt-td--empty">
              {{ emptyText || 'No data' }}
            </td>
          </tr>
          <tr
            v-else
            v-for="(row, index) in sortedRows"
            :key="row[keyField]"
            :class="['apt-tr', hoverable ? 'apt-tr--hoverable' : '', clickable ? 'apt-tr--clickable' : '', striped && index % 2 === 1 ? 'apt-tr--striped' : '']"
            @click="clickable && handleRowClick(row, $event)"
          >
            <td
              v-for="col in columns"
              :key="col.key"
              :style="{ textAlign: col.align || 'left' }"
              :class="['apt-td', col.class]"
            >
              <slot :name="col.key" :row="row" :value="row[col.key]" :col="col">
                <span v-if="col.render" :data-rendered="true">
                  {{ col.render(row, row[col.key]) }}
                </span>
                <span v-else>{{ row[col.key] }}</span>
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="loading" class="apt-table-loading" aria-live="polite" aria-busy="true">
      <div class="apt-table-spinner" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <circle cx="12" cy="12" r="10" stroke-opacity="0.25" />
          <path d="M12 2a10 10 0 0 1 10 10" stroke-opacity="1">
            <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite" />
          </path>
        </svg>
      </div>
      <p class="apt-table-loading-text">Loading…</p>
    </div>
  </div>
</template>

<style scoped>
.apt-table-wrapper {
  width: 100%;
  font-family: var(--apt-font-sans);
  overflow: hidden;
  border-radius: var(--apt-table-radius);
  background: var(--apt-surface-page);
  border: 1px solid var(--apt-border);
}

.apt-table-container {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.apt-table-container:focus {
  outline: none;
}

.apt-table-container:focus-visible {
  outline: 2px solid var(--apt-focus-ring);
  outline-offset: -2px;
}

.apt-table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--apt-table-font-size);
  color: var(--apt-text-body);
  line-height: var(--apt-line-height-normal);
}

.apt-table--compact .apt-th,
.apt-table--compact .apt-td {
  padding: var(--apt-table-cell-padding-sm);
}

.apt-th {
  padding: var(--apt-table-cell-padding);
  font-weight: var(--apt-table-head-font-weight);
  color: var(--apt-table-head-text);
  text-align: left;
  white-space: nowrap;
  background: var(--apt-table-head-bg);
  border-bottom: 1px solid var(--apt-table-border);
  user-select: none;
}

.apt-th--sortable {
  cursor: pointer;
}

.apt-th--sortable:hover {
  color: var(--apt-text-body);
}

.apt-th-content {
  display: flex;
  align-items: center;
  gap: var(--apt-spacing-s2);
}

.apt-th-sort {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  color: var(--apt-text-dim);
  transition: color var(--apt-animation-fast);
}

.apt-th--sortable:hover .apt-th-sort,
.apt-th-sort[aria-sort="asc"],
.apt-th-sort[aria-sort="desc"] {
  color: var(--apt-text-body);
}

.apt-th-sort svg {
  width: 14px;
  height: 14px;
}

.apt-td {
  padding: var(--apt-table-cell-padding);
  border-bottom: 1px solid var(--apt-table-border);
  vertical-align: top;
}

.apt-table--bordered .apt-td {
  border-right: 1px solid var(--apt-table-border);
}

.apt-table--bordered .apt-th {
  border-right: 1px solid var(--apt-table-border);
}

.apt-table--bordered .apt-th:last-child,
.apt-table--bordered .apt-td:last-child {
  border-right: none;
}

.apt-tr--striped {
  background: var(--apt-table-row-stripe-bg);
}

.apt-tr--hoverable:hover {
  background: var(--apt-table-row-hover-bg);
}

.apt-tr--clickable {
  cursor: pointer;
}

.apt-tr--clickable:focus-visible {
  outline: 2px solid var(--apt-focus-ring);
  outline-offset: -2px;
}

.apt-tr--empty {
  background: var(--apt-surface-page);
}

.apt-td--empty {
  padding: var(--apt-spacing-s12) var(--apt-spacing-s8);
  text-align: center;
  color: var(--apt-text-muted);
  font-size: var(--apt-font-size-body-md);
}

/* Loading state */
.apt-table-wrapper--loading {
  position: relative;
}

.apt-table-wrapper--loading .apt-table-container {
  opacity: 0.5;
  pointer-events: none;
}

.apt-table-loading {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--apt-spacing-s4);
  background: var(--apt-surface-page);
  z-index: 1;
}

.apt-table-spinner {
  width: 32px;
  height: 32px;
  color: var(--apt-module-accent, var(--apt-action-primary));
  animation: apt-spin 1s linear infinite;
}

.apt-table-loading-text {
  margin: 0;
  font-size: var(--apt-font-size-body-md);
  color: var(--apt-text-muted);
}

@keyframes apt-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 640px) {
  .apt-th,
  .apt-td {
    padding: var(--apt-table-cell-padding-sm);
    font-size: var(--apt-font-size-body-sm);
  }
}
</style>