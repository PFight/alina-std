﻿import * as AlStd from "../alina-std";
import * as Alina from "alina-core";

export class AlShow extends AlStd.AlinaComponent {
  lastValue: any;
  node: Node;
  nodeContext: AlStd.Alina;

  showIf(value: boolean, render?: (context: AlStd.Alina) => void) {
    if (this.lastValue !== value) {
      let templateElem = this.root.nodeAs<HTMLTemplateElement>();
      if (value) {
        // Value changed and now is true - show node
        this.node = Alina.fromTemplate(templateElem);
        if (render) {
          this.nodeContext = this.root.create(this.node);
          render(this.nodeContext);
        }
        templateElem.parentElement.insertBefore(this.node, templateElem);
      } else {
        // Value changed and now is false - remove node
        if (this.nodeContext) {
          this.nodeContext.dispose();
          this.nodeContext = null;
        }
        if (this.node && this.node.parentElement) {
          this.node.parentElement.removeChild(this.node);
        }
      }
      this.lastValue = value;
    } else {
      // Render on every call, even if value not changed
      if (value && render && this.nodeContext) {
        render(this.nodeContext);
      }
    }
  }
}