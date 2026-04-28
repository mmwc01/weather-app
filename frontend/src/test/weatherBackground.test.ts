import { describe, it, expect } from 'vitest';
import {
  resolveKind,
  resolveCondition,
  CLOUD_TYPES,
  DENSE_NIGHT,
  NIGHT_STARS_OK,
} from '../utils/weatherBackground';

describe('resolveKind', () => {
  it('passes rain, drizzle, and snow through as-is', () => {
    expect(resolveKind('rain')).toBe('rain');
    expect(resolveKind('drizzle')).toBe('drizzle');
    expect(resolveKind('snow')).toBe('snow');
  });

  it('shortens thunderstorm to thunder', () => {
    expect(resolveKind('thunderstorm')).toBe('thunder');
  });

  it('falls back to cloud for clear, clouds, and unknowns', () => {
    expect(resolveKind('clear')).toBe('cloud');
    expect(resolveKind('clouds')).toBe('cloud');
    expect(resolveKind('anything')).toBe('cloud');
  });
});

describe('resolveCondition', () => {
  it('passes known OWM conditions through unchanged', () => {
    expect(resolveCondition('clear')).toBe('clear');
    expect(resolveCondition('clouds')).toBe('clouds');
    expect(resolveCondition('rain')).toBe('rain');
    expect(resolveCondition('drizzle')).toBe('drizzle');
    expect(resolveCondition('snow')).toBe('snow');
    expect(resolveCondition('thunderstorm')).toBe('thunderstorm');
  });

  it('is case-insensitive', () => {
    expect(resolveCondition('Clear')).toBe('clear');
    expect(resolveCondition('RAIN')).toBe('rain');
  });

  it('groups all visibility conditions under fog', () => {
    expect(resolveCondition('fog')).toBe('fog');
    expect(resolveCondition('haze')).toBe('fog');
    expect(resolveCondition('dust')).toBe('fog');
    expect(resolveCondition('tornado')).toBe('fog');
  });

  it('returns default for unrecognised conditions', () => {
    expect(resolveCondition('unknown')).toBe('default');
  });
});

describe('CLOUD_TYPES', () => {
  it('contains all weather types that show clouds', () => {
    expect(CLOUD_TYPES.has('clouds')).toBe(true);
    expect(CLOUD_TYPES.has('rain')).toBe(true);
    expect(CLOUD_TYPES.has('drizzle')).toBe(true);
    expect(CLOUD_TYPES.has('snow')).toBe(true);
    expect(CLOUD_TYPES.has('thunderstorm')).toBe(true);
  });

  it('excludes clear and fog', () => {
    expect(CLOUD_TYPES.has('clear')).toBe(false);
    expect(CLOUD_TYPES.has('fog')).toBe(false);
  });
});

describe('DENSE_NIGHT', () => {
  it('marks rain and thunderstorm as dense', () => {
    expect(DENSE_NIGHT.has('rain')).toBe(true);
    expect(DENSE_NIGHT.has('thunderstorm')).toBe(true);
  });

  it('does not mark clouds or snow as dense', () => {
    expect(DENSE_NIGHT.has('clouds')).toBe(false);
    expect(DENSE_NIGHT.has('snow')).toBe(false);
  });
});

describe('NIGHT_STARS_OK', () => {
  it('allows stars for clear, rain, and default', () => {
    expect(NIGHT_STARS_OK.has('clear')).toBe(true);
    expect(NIGHT_STARS_OK.has('rain')).toBe(true);
    expect(NIGHT_STARS_OK.has('default')).toBe(true);
  });

  it('blocks stars for clouds and thunderstorm', () => {
    expect(NIGHT_STARS_OK.has('clouds')).toBe(false);
    expect(NIGHT_STARS_OK.has('thunderstorm')).toBe(false);
  });
});
