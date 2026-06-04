import { describe, expect, it } from 'vitest';
import { resolvePostTagStyleKey } from './postTagDisplay';

describe('resolvePostTagStyleKey', () => {
  it('maps content-type tags', () => {
    expect(resolvePostTagStyleKey('#同路')).toBe('carpool');
    expect(resolvePostTagStyleKey('#转票')).toBe('ticket');
    expect(resolvePostTagStyleKey('#组队')).toBe('team');
  });

  it('maps status and location tags', () => {
    expect(resolvePostTagStyleKey('#已满')).toBe('status-full');
    expect(resolvePostTagStyleKey('组队完成')).toBe('status-done');
    expect(resolvePostTagStyleKey('#广州出发')).toBe('location');
    expect(resolvePostTagStyleKey('#B区')).toBe('zone');
  });

  it('maps gender tags', () => {
    expect(resolvePostTagStyleKey('#女生优先')).toBe('gender-f');
    expect(resolvePostTagStyleKey('#男生')).toBe('gender-m');
  });
});
