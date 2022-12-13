import { RunStateResult } from '../src/RunStateResult';

describe('RunStateResult', () => {
  test('should be able to compare', () => {
    const r1 = new RunStateResult("Target", {}, 'Task', 'NextState', false);
    const r2 = new RunStateResult("Target", {}, 'Task', 'NextState', false);
    expect(r1).toEqual(r2);
  });

  describe('when the nextState is null and isTerminalState = false', () => {
    test('should throw error', () => {
      expect(() => new RunStateResult("Target", {}, 'Task', null, false)).toThrowError(
        Error
      );
    });
  });
});
