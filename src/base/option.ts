import { property } from 'lit/decorators.js';

import { ListItem } from './list-item.js';

export class Option extends ListItem {
  override _role = 'option';
  @property({ reflect: true }) value: string = '';
}
