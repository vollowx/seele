import { LitElement } from 'lit';

export const internals = Symbol('internals');
const privateInternals = Symbol('privateInternals');

export const updateInternals = Symbol('updateInternals');
export const replaceStates = Symbol('replaceStates');

export declare class InternalsAttachedInterface {
  [internals]: ElementInternals;
  [updateInternals]?(): void;
  [replaceStates](del: Array<string>, add: Array<string | null>): void;
}

export const InternalsAttached = <T extends Constructor<LitElement>>(
  superClass: T
) => {
  class InternalsAttachedElement extends superClass {
    get [internals]() {
      if (!this[privateInternals]) {
        this[privateInternals] = this.attachInternals();
      }
      return this[privateInternals]!;
    }
    declare [privateInternals]?: ElementInternals;

    [replaceStates](del: Array<string>, add: Array<string | null>): void {
      del.forEach((state) => this[internals].states.delete(state));
      add.forEach((state) => {
        if (state) this[internals].states.add(state);
      });
    }
  }
  return InternalsAttachedElement as Constructor<InternalsAttachedInterface> &
    T;
};
