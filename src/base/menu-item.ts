import { ListItem } from './list-item.js';

export const MenuItemMixin = <T extends Constructor<ListItem>>(
  superClass: T
) => {
  class MenuItemElement extends superClass {
    override _role: string = 'menuitem';
  }
  return MenuItemElement;
};

export class MenuItem extends MenuItemMixin(ListItem) {}
