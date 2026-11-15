import { property } from 'lit/decorators.js';

import { ListItem } from './list-item.js';

export declare class OptionInterface {
  value: string;
}

export const OptionMixin = <T extends Constructor<ListItem>>(superClass: T) => {
  class OptionElement extends superClass {
    override _role = 'option';
    @property({ reflect: true }) value: string = '';
  }
  return OptionElement as Constructor<OptionInterface> & T;
};

export class Option extends OptionMixin(ListItem) {}
