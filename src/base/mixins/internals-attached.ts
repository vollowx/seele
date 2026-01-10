import { LitElement } from 'lit';

export const internals = Symbol('internals');
const privateInternals = Symbol('privateInternals');

export declare class InternalsAttachedInterface {
  [internals]: ElementInternals;
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
  }
  return InternalsAttachedElement as Constructor<InternalsAttachedInterface> &
    T;
};
