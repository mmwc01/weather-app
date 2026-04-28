import { describe, it, expect } from 'vitest';
import { resolveCardBg, hasScene } from '../utils/cardScene';

describe('resolveCardBg', () => {
  it('returns day sun color for clear', () => {
    expect(resolveCardBg('Clear', false)).toBe('#ccccff');
    expect(resolveCardBg('clear', false)).toBe('#ccccff');
  });

  it('returns night sun color for clear at night', () => {
    expect(resolveCardBg('Clear', true)).toBe('#2d3460');
  });

  it('returns thunder color for thunderstorm', () => {
    expect(resolveCardBg('Thunderstorm', false)).toBe('#6E7380');
    expect(resolveCardBg('Thunderstorm', true)).toBe('#1e2448');
  });

  it('returns rain color for rain', () => {
    expect(resolveCardBg('Rain', false)).toBe('#B8BCC4');
    expect(resolveCardBg('Rain', true)).toBe('#252f52');
  });

  it('returns drizzle color', () => {
    expect(resolveCardBg('Drizzle', false)).toBe('#E4EAF4');
  });

  it('returns snow color', () => {
    expect(resolveCardBg('Snow', false)).toBe('#DAE3FD');
  });

  it('returns cloud color for unknown conditions', () => {
    expect(resolveCardBg('Clouds', false)).toBe('#DAE3FD');
    expect(resolveCardBg('Fog', false)).toBe('#DAE3FD');
  });

  it('returns default color when condition is null', () => {
    expect(resolveCardBg(null, false)).toBe('#DAE3FD');
    expect(resolveCardBg(null, true)).toBe('#2d3460');
  });
});

describe('hasScene', () => {
  it('returns true for known scene conditions', () => {
    expect(hasScene('Clear')).toBe(true);
    expect(hasScene('Clouds')).toBe(true);
    expect(hasScene('Rain')).toBe(true);
    expect(hasScene('Drizzle')).toBe(true);
    expect(hasScene('Snow')).toBe(true);
    expect(hasScene('Thunderstorm')).toBe(true);
  });

  it('returns false for fog and other conditions', () => {
    expect(hasScene('Fog')).toBe(false);
    expect(hasScene('Mist')).toBe(false);
    expect(hasScene('Haze')).toBe(false);
  });

  it('returns false for null', () => {
    expect(hasScene(null)).toBe(false);
  });

  it('is case-insensitive', () => {
    expect(hasScene('clear')).toBe(true);
    expect(hasScene('RAIN')).toBe(true);
  });
});
