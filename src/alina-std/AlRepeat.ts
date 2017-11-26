﻿import * as Alina from "alina-core";
import * as AlStd from "../alina-std";

const undefinedOrNull = Alina.undefinedOrNull;
const definedNotNull = Alina.definedNotNull;

export interface RepeatExtraOptions<T> {
  equals?: (a: T, b: T) => boolean;
}

export interface RepeatItemContext<T> {
  oldModelItem?: T;
  mounted?: boolean;
  nodeContext?: AlStd.Alina;
}

export interface AlRepeatContext<T> {
  template: HTMLTemplateElement;
  insertBefore: HTMLElement | null;
  container: HTMLElement;
  equals?: (a: T, b: T) => boolean;
  update: (renderer: AlStd.Alina, model: T) => void;
}

export class AlRepeat extends AlStd.AlinaComponent {
  itemContexts: RepeatItemContext<any>[] = [];
  context: AlRepeatContext<any>;

  repeat<T>(items: T[], update: (renderer: AlStd.Alina, model: T) => void, options?: RepeatExtraOptions<T>) {
    if (update) {
      this.context = {
        template: this.root.elem as HTMLTemplateElement,
        container: this.root.elem.parentElement,
        insertBefore: this.root.elem,
        equals: options && options.equals,
        update: update
      };
    }
    this.repeatEx(items, this.context);
  } 

  repeatEx<T>(items: T[], context: AlRepeatContext<T>) {
    if (context) {
      this.context = context;
    }
    let props = this.context;

    // Add new and update existing
    for (let i = 0; i < items.length; i++) {
      let modelItem = items[i];

      // Createcontext
      let itemContext = this.itemContexts[i];
      if (!itemContext || !this.compare(modelItem, itemContext.oldModelItem, props.equals)) {
        itemContext = this.itemContexts[i] = {};
      }

      // Create node
      if (!itemContext.nodeContext) {
        let node = Alina.fromTemplate(props.template);
        itemContext.nodeContext = this.root.create(node);
      }

      // Fill content
      props.update(itemContext.nodeContext, modelItem);

      // Insert to parent
      if (!itemContext.mounted) {
        let position = i == 0 ? props.insertBefore : this.itemContexts[i - 1].nodeContext.node.nextSibling;
        if (position) {
          props.container.insertBefore(itemContext.nodeContext.node, position);
        } else {
          props.container.appendChild(itemContext.nodeContext.node);
        }
        itemContext.mounted = true;
      }

      itemContext.oldModelItem = modelItem;
    }

    // Remove old
    let firstIndexToRemove = items.length;
    for (let i = firstIndexToRemove; i < this.itemContexts.length; i++) {
      let context = this.itemContexts[i];
      context.nodeContext.dispose();
      let elem = context.nodeContext.node;
      if (elem) {
        props.container.removeChild(elem);
      }
    }
    this.itemContexts.splice(firstIndexToRemove,
      this.itemContexts.length - firstIndexToRemove);
  }

  protected compare(a, b, comparer) {
    return (undefinedOrNull(a) && undefinedOrNull(b)) ||
      (definedNotNull(a) && definedNotNull(b) && !comparer) ||
      (definedNotNull(a) && definedNotNull(b) && comparer && comparer(a, b));
  }
}