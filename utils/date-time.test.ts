import {
  toApiDate,
  toApiTime,
  fromApiDate,
  toFriendlyDate,
  toFriendlyTime,
  toISODate,
  isValidDate,
  pad,
  durationFromRange,
  fmtDuration,
  toHHmm,
  formatReminderTime
} from './date-time';

describe('utils/date-time', () => {
  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(new Date('2026-03-21T12:00:00Z'));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('pad should add leading zero', () => {
    expect(pad(5)).toBe('05');
    expect(pad(10)).toBe('10');
  });

  it('isValidDate should validate Date objects', () => {
    expect(isValidDate(new Date())).toBe(true);
    expect(isValidDate('not a date')).toBe(false);
    expect(isValidDate(new Date('invalid'))).toBe(false);
  });

  describe('API Transformations', () => {
    it('toApiDate converts Date to yyyy-MM-dd', () => {
      const d = new Date('2026-05-15T10:00:00');
      expect(toApiDate(d)).toBe('2026-05-15');
    });

    it('toISODate matches the shared API date format', () => {
      const d = new Date('2026-05-15T10:00:00');
      expect(toISODate(d)).toBe('2026-05-15');
    });

    it('toApiTime converts Date to HH:mm:ss', () => {
      const d = new Date('2026-05-15T14:30:05');
      expect(toApiTime(d)).toBe('14:30:05');
    });

    it('fromApiDate parses strings into Dates', () => {
      const date = fromApiDate('2026-12-25');
      expect(date.getFullYear()).toBe(2026);
      expect(date.getMonth()).toBe(11); // Dec is 11
      expect(date.getDate()).toBe(25);
    });
  });

  describe('UI Display Helpers', () => {
    it('toFriendlyDate returns "Today", "Yesterday", "Tomorrow"', () => {
      const today = new Date();
      const yesterday = new Date(); yesterday.setDate(today.getDate() - 1);
      const tomorrow = new Date(); tomorrow.setDate(today.getDate() + 1);
      const other = new Date('2026-01-01');

      expect(toFriendlyDate(today)).toBe('Today');
      expect(toFriendlyDate(yesterday)).toBe('Yesterday');
      expect(toFriendlyDate(tomorrow)).toBe('Tomorrow');
      expect(toFriendlyDate(other)).toBe('Thu, Jan 1');
    });

    it('toFriendlyTime returns h:mm a format', () => {
      expect(toFriendlyTime('14:30:00')).toBe('2:30 PM');
      expect(toFriendlyTime('09:05:00')).toBe('9:05 AM');
    });
  });

  describe('Duration Logic', () => {
    it('durationFromRange calculates minutes correctly', () => {
      const start = new Date(); start.setHours(9, 0);
      const end = new Date(); end.setHours(10, 30);
      expect(durationFromRange(start, end)).toBe(90);
    });

    it('fmtDuration formats minutes to human readable', () => {
      expect(fmtDuration(90)).toBe('1h 30m');
      expect(fmtDuration(60)).toBe('1h');
    });

    it('toHHmm formats Date to 24h string', () => {
      const d = new Date(); d.setHours(13, 5);
      expect(toHHmm(d)).toBe('13:05');
    });
  });

  describe('formatReminderTime', () => {
    it('handles HH:mm strings', () => {
        expect(formatReminderTime('14:00')).toBe('02:00 PM');
    });
    it('handles HH:mm:ss strings', () => {
        expect(formatReminderTime('09:30:00')).toBe('09:30 AM');
    });
    it('handles numeric timestamps', () => {
        const d = new Date('2026-01-01T10:00:00').getTime();
        expect(formatReminderTime(d)).toBe('10:00 AM');
    });
  });
});
