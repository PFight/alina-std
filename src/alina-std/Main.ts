import * as Al from "alina-core";
import * as AlStd from "../alina-std";

export type Alina = Al.NodeContext & AlStd.StandardExtensions;

export class AlinaComponent<ContextT extends Alina = Alina>
  extends Al.Component<ContextT> implements AlStd.ITemplateProcessor<ContextT>
{
  addChild(template: HTMLTemplateElement, render?: (renderer: ContextT) => void): void {
    this.root.tpl().addChild(template, render);
  }
  setChild(template: HTMLTemplateElement, render?: (renderer: ContextT) => void): void {
    this.root.tpl().setChild(template, render);
  }
  replace(template: HTMLTemplateElement, render?: (renderer: ContextT) => void): void {
    this.root.tpl().replace(template, render);
  }
};

export type FuncAlinaComponent<PropsT, RetT> = Al.FuncComponent<Alina, PropsT, RetT>;

let rootNode = typeof(document) === 'undefined' ? null : document;
export var Document = rootNode && 
  new Al.NodeContext(rootNode, null).ext(AlStd.StandardExt);
