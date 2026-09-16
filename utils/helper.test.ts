import {
  findIdBName,
  addObjectAtEnd,
  arraysEqual,
  deriveHHmmss,
  getDeviceDetails,
  getErrorMessage,
} from './helper';

describe('utils/helper', () => {
  
  describe('findIdBName', () => {
    const mockData = [
      { id: 101, name: 'Alice' },
      { id: 102, name: 'Bob' }
    ];

    it('should return the correct id when name matches', () => {
      const result = findIdBName(mockData, 'name', 'id', 'Bob');
      expect(result).toBe(102);
    });

    it('should return undefined when name does not exist', () => {
      const result = findIdBName(mockData, 'name', 'id', 'Charlie');
      expect(result).toBeUndefined();
    });
  });

  describe('arraysEqual', () => {
    it('should return true for identical arrays', () => {
      expect(arraysEqual([1, 2, 3], [1, 2, 3])).toBe(true);
    });

    it('should return false for arrays of different lengths', () => {
      expect(arraysEqual([1, 2], [1, 2, 3])).toBe(false);
    });

    it('should return false for different arrays of same length', () => {
      expect(arraysEqual([1, 2, 3], [1, 2, 4])).toBe(false);
    });

    it('should handle empty arrays by default', () => {
        expect(arraysEqual()).toBe(true);
    });
  });

  describe('addObjectAtEnd', () => {
    it('should add a new object with incremented ID', () => {
      const input = [{ id: 1, name: 'First' }];
      const result = addObjectAtEnd(input);
      expect(result).toHaveLength(2);
      expect(result[1]).toEqual({ id: 2, name: 'Add New' });
    });

    it('should handle empty array correctly', () => {
        const input: any[] = [];
        const result = addObjectAtEnd(input);
        expect(result).toHaveLength(1);
        expect(result[0]).toEqual({ id: 1, name: 'Add New' });
    });
  });

  describe('deriveHHmmss', () => {
    it('should return the time if n.time exists', () => {
      expect(deriveHHmmss({ time: '12:30:00' })).toBe('12:30:00');
    });

    it('should parse ISO time format consistently', () => {
      const iso = '2024-03-21T10:15:00.000Z';
      const result = deriveHHmmss({ timeISO: iso });
      // We expect the format HH:mm:00
      expect(result).toMatch(/^\d{2}:\d{2}:00$/);
    });
  });

  describe('getErrorMessage', () => {
    it('should return string errors as-is', () => {
      expect(getErrorMessage('Network failed')).toBe('Network failed');
    });

    it('should return Error messages', () => {
      expect(getErrorMessage(new Error('Request failed'))).toBe('Request failed');
    });

    it('should return non-empty object message values', () => {
      expect(getErrorMessage({ message: 'Backend unavailable' })).toBe(
        'Backend unavailable'
      );
    });

    it('should return the fallback for unknown error shapes', () => {
      expect(getErrorMessage({ message: '   ' })).toBe(
        'Failed to load water data'
      );
      expect(getErrorMessage(null, 'Something went wrong')).toBe(
        'Something went wrong'
      );
    });
  });

  describe('getDeviceDetails', () => {
    it('should return standardized device details from mocks', async () => {
      const details = await getDeviceDetails();
      expect(details).toEqual({
        os: 'iOS 17.0',
        device: 'iPhone 15',
        appVersion: '1.0.0 (1)'
      });
    });
  });
});
