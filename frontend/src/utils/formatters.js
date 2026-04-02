export function formatCurrency(value, options = {}) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
    ...options,
  }).format(Number(value || 0));
}

export function formatCompactNumber(value) {
  return new Intl.NumberFormat('en-IN', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(Number(value || 0));
}

export function formatNumber(value, options = {}) {
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 1,
    ...options,
  }).format(Number(value || 0));
}

export function formatDateTime(value) {
  if (!value) {
    return 'Not available';
  }

  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function formatDate(value) {
  if (!value) {
    return 'Not available';
  }

  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
  }).format(new Date(value));
}

export function formatPercent(value, digits = 0) {
  return `${Number(value || 0).toFixed(digits)}%`;
}

export function formatCountdown(dateLike) {
  if (!dateLike) {
    return 'TBD';
  }

  const target = new Date(dateLike);
  const diff = target.getTime() - Date.now();

  if (diff <= 0) {
    return 'Due now';
  }

  const totalMinutes = Math.round(diff / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

export function groupByPeriod(entries, getDate, getValue, period = '30d') {
  const dayCount = Number.parseInt(period, 10) || 30;
  const start = new Date();
  start.setDate(start.getDate() - dayCount + 1);
  start.setHours(0, 0, 0, 0);

  const grouped = new Map();

  entries.forEach((entry) => {
    const rawDate = getDate(entry);
    if (!rawDate) {
      return;
    }

    const date = new Date(rawDate);
    if (date < start) {
      return;
    }

    const key = date.toISOString().slice(0, 10);
    grouped.set(key, (grouped.get(key) || 0) + getValue(entry));
  });

  const result = [];

  for (let index = 0; index < dayCount; index += 1) {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    const key = date.toISOString().slice(0, 10);

    result.push({
      key,
      label: new Intl.DateTimeFormat('en-IN', {
        month: 'short',
        day: 'numeric',
      }).format(date),
      value: grouped.get(key) || 0,
    });
  }

  return result;
}
