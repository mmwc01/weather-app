import { describe, it, expect } from 'vitest';
import { formatTemp, convertTemp } from '../utils/temperature';

describe('formatTemp', () => {
  it('rounds Celsius values', () => {
    expect(formatTemp(23.6, 'C')).toBe(24);
    expect(formatTemp(23.4, 'C')).toBe(23);
  });

  it('converts to Fahrenheit and rounds', () => {
    expect(formatTemp(0, 'F')).toBe(32);
    expect(formatTemp(100, 'F')).toBe(212);
    expect(formatTemp(-40, 'F')).toBe(-40);
  });

  it('returns integer', () => {
    expect(Number.isInteger(formatTemp(22.7, 'C'))).toBe(true);
    expect(Number.isInteger(formatTemp(22.7, 'F'))).toBe(true);
  });
});

describe('convertTemp', () => {
  it('returns Celsius unchanged', () => {
    expect(convertTemp(24.05, 'C')).toBe(24.05);
    expect(convertTemp(-1, 'C')).toBe(-1);
  });

  it('converts Fahrenheit with 2-decimal precision', () => {
    expect(convertTemp(0, 'F')).toBe(32);
    expect(convertTemp(100, 'F')).toBe(212);
    expect(convertTemp(37, 'F')).toBeCloseTo(98.6, 1);
  });
});
