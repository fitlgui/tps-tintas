export interface NormalizedCurrencyValue {
  formatted: string;
  numeric: number;
}

function getCurrencyDigits(value: string | number | null | undefined): string {
  if (value === null || value === undefined) {
    return '';
  }

  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      return '';
    }

    return Math.round(Math.max(value, 0) * 100).toString();
  }

  return value.replace(/\D/g, '');
}

export function roundCurrencyValue(value: number | null | undefined): number {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return 0;
  }

  return Number(Math.max(value, 0).toFixed(2));
}

export function normalizeCurrencyInput(value: string | number | null | undefined): NormalizedCurrencyValue {
  const digits = getCurrencyDigits(value);

  if (!digits) {
    return {
      formatted: '',
      numeric: 0
    };
  }

  const numeric = roundCurrencyValue(Number(digits) / 100);

  return {
    formatted: numeric.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }),
    numeric
  };
}

export function formatCurrencyInput(value: number | null | undefined): string {
  return normalizeCurrencyInput(value).formatted;
}