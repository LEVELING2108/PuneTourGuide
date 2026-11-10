import { describe, expect, it, vi } from 'vitest';
import { createShakeDetector } from './shake';
import { namesText } from './live';

describe('shake to SOS', () => {
  it('fires on a deliberate shake: three jolts within 1.5 s', () => {
    const fire = vi.fn();
    const feed = createShakeDetector(fire);
    feed(22, 0);
    feed(24, 300);
    expect(fire).not.toHaveBeenCalled();
    feed(21, 600);
    expect(fire).toHaveBeenCalledTimes(1);
  });

  it('ignores one hard jolt (a pothole, a dropped phone) and normal movement', () => {
    const fire = vi.fn();
    const feed = createShakeDetector(fire);
    feed(40, 0); // one big bump
    for (let t = 100; t < 5000; t += 100) feed(11, t); // walking: ~1.1 g
    expect(fire).not.toHaveBeenCalled();
  });

  it('needs the jolts close together, counts one jolt once, and cools down', () => {
    const fire = vi.fn();
    const feed = createShakeDetector(fire);
    feed(20, 0);
    feed(20, 1000);
    feed(20, 2600); // first jolt has expired
    expect(fire).not.toHaveBeenCalled();
    // Samples 50 ms apart are the same jolt
    const g = createShakeDetector(fire);
    g(20, 0);
    g(20, 50);
    g(20, 90);
    expect(fire).not.toHaveBeenCalled();
    g(20, 300);
    g(20, 600);
    expect(fire).toHaveBeenCalledTimes(1);
    g(20, 700);
    g(20, 900);
    g(20, 1100);
    expect(fire).toHaveBeenCalledTimes(1); // within the 1 s cooldown
  });
});

describe('namesText', () => {
  it('reads naturally', () => {
    expect(namesText(['Aai'])).toBe('Aai');
    expect(namesText(['Aai', 'Aman'])).toBe('Aai and Aman');
    expect(namesText(['Aai', 'Aman', 'Didi', 'Baba'])).toBe('Aai, Aman and 2 more');
  });
});
