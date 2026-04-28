import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useFade } from '../hooks/useFade';

describe('useFade', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it('active=true starts mounted and visible', () => {
    const { result } = renderHook(() => useFade(true));
    expect(result.current.mounted).toBe(true);
    expect(result.current.visible).toBe(true);
  });

  it('active=false starts unmounted', () => {
    const { result } = renderHook(() => useFade(false));
    expect(result.current.mounted).toBe(false);
    expect(result.current.visible).toBe(false);
  });

  it('going inactive hides immediately but keeps mounted', () => {
    const { result, rerender } = renderHook(
      ({ active }) => useFade(active, 1500),
      { initialProps: { active: true } },
    );
    act(() => { rerender({ active: false }); });
    expect(result.current.visible).toBe(false);
    expect(result.current.mounted).toBe(true);
  });

  it('unmounts once the delay expires', () => {
    const { result, rerender } = renderHook(
      ({ active }) => useFade(active, 1000),
      { initialProps: { active: true } },
    );
    act(() => { rerender({ active: false }); });
    act(() => { vi.advanceTimersByTime(1000); });
    expect(result.current.mounted).toBe(false);
  });

  it('still mounted mid-fade', () => {
    const { result, rerender } = renderHook(
      ({ active }) => useFade(active, 1000),
      { initialProps: { active: true } },
    );
    act(() => { rerender({ active: false }); });
    act(() => { vi.advanceTimersByTime(500); });
    expect(result.current.mounted).toBe(true);
  });

  it('custom delay works', () => {
    const { result, rerender } = renderHook(
      ({ active }) => useFade(active, 300),
      { initialProps: { active: true } },
    );
    act(() => { rerender({ active: false }); });
    act(() => { vi.advanceTimersByTime(300); });
    expect(result.current.mounted).toBe(false);
  });
});
