import { FakeStateMachine } from '../src/FakeStateMachine';
import { RunStateResult } from '../src/RunStateResult';
import { addNumbers, increment } from './fixtures/resources';

describe('FakeStateMachine#run()', () => {
  describe('when StartAt field does not exist', () => {
    test('should throw an Error', () => {
      const definition = require('./fixtures/definitions/startat-field-does-not-exist.json');
      const fakeStateMachine = new FakeStateMachine(definition, {});
      return expect(fakeStateMachine.run({})).rejects.toThrow(
        'StartAt does not exist'
      );
    });
  });

  test('should pass the input to fakeResource and fill the result to ResultPath', async () => {
    const definition = require('./fixtures/definitions/add.json');
    const fakeResources = {
      'arn:aws:lambda:us-east-1:123456789012:function:Add': addNumbers,
    };
    const fakeStateMachine = new FakeStateMachine(definition, fakeResources);

    expect(
      await fakeStateMachine.run({
        title: 'Numbers to add',
        numbers: { val1: 3, val2: 4 },
      })
    ).toEqual(
      new RunStateResult(
        "Add",
        {
          title: 'Numbers to add',
          numbers: { val1: 3, val2: 4 },
          sum: 7,
        },
        'Task',
        null,
        true
      )
    );
  });

  describe('when there is invalid Type String', () => {
    test('should throw an Error', () => {
      const definition = require('./fixtures/definitions/unknown-type.json');
      const fakeStateMachine = new FakeStateMachine(definition, {});

      return expect(fakeStateMachine.run({})).rejects.toThrow(
        'Invalid Type: UnknownType'
      );
    });
  });

  describe('when the state machine has two states', () => {
    test('should return the result successfully', async () => {
      const definition = require('./fixtures/definitions/two-states.json');
      const fakeResources = {
        'arn:aws:lambda:us-east-1:123456789012:function:Add': addNumbers,
      };
      const fakeStateMachine = new FakeStateMachine(definition, fakeResources);

      expect(
        await fakeStateMachine.run({
          title: 'Numbers to add',
          numbers: { val1: 3, val2: 4 },
        })
      ).toEqual(
        new RunStateResult(
          "Add2",
          {
            title: 'Numbers to add',
            numbers: { val1: 3, val2: 4 },
            sum1: 7,
            sum2: 7,
          },
          'Task',
          null,
          true
        )
      );
    });
  });

  describe('when state machine contains a loop with break', () => {
    test('should return the result successfully', async () => {
      const definition = require('./fixtures/definitions/loop.json');
      const fakeResources = {
        'arn:aws:lambda:us-east-1:123456789012:function:Increment': increment,
      };
      const fakeStateMachine = new FakeStateMachine(definition, fakeResources);
      expect(
        await fakeStateMachine.run({
          i: 0,
        })
      ).toEqual(
        new RunStateResult(
          "Done",
          {
            i: 3,
          },
          'Succeed',
          null,
          true
        )
      );
    });
  });

  describe('when the state updates a copied field', () => {
    test('should not affect the original field', async () => {
      const definition = require('./fixtures/definitions/copy-object.json');
      const fakeStateMachine = new FakeStateMachine(definition, {});
      expect(
        await fakeStateMachine.run({
          a1: { b: 1 },
        })
      ).toEqual(
        new RunStateResult(
          "Done",
          {
            a1: { b: 1 },
            a2: { b: 2 },
          },
          'Succeed',
          null,
          true
        )
      );


    });
  });

  describe('when Pass state has undefined ResultPath', () => {
    test('should not throw an Error', async () => {
      const definition = require('./fixtures/definitions/pass-state-undefined-resultpath.json');
      const fakeStateMachine = new FakeStateMachine(definition, {});
      const exitStateResult = await fakeStateMachine.run({
        changed: "TBD",
        unchanged: "unchanged"
      });

      expect(exitStateResult).toEqual(
        new RunStateResult(
          "Done",
          {
            changed: "changed by pass 0",
            unchanged: "unchanged"
          },
          'Succeed',
          null,
          true
        )
      );

      expect(fakeStateMachine.executedStates).toEqual([
        "Pass0",
        "Plaholder Pass State",
        "Done"
      ])
    });
  });
});
