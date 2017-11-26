import * as Alina from "alina-core";
import * as AlStd from "../alina-std";

export interface StandardExtensions {
  query(selector: string): this;
  queryAll(selector: string, render: (context: this) => void): void;
  getEntry(entry: string): this;
  getEntries(entry: string, render: (context: this) => void): void;
  findNode(entry: string): this;
  findNodes(entry: string, render: (context: this) => void): void;
  set<T>(stub: string, value: T): void;
  setOnce<T>(stub: string, value: T): void;
  showIf(templateSelector: string, value: boolean, render?: (context: this) => void): void;
  tpl(key?: string): ITemplateProcessor<this>;
  repeat<T>(templateSelector: string, items: T[], update: (renderer: this, model: T) => void): void;
  on<T>(value: T, callback: (renderer: this, value?: T, prevValue?: T) => T | void, key?: string): void;
  once(callback: (renderer: this) => void): void;
}

export interface ITemplateProcessor<ContextT> {
  addChild<T>(template: HTMLTemplateElement, render: (renderer: ContextT) => T | void): T | void;
  setChild<T>(template: HTMLTemplateElement, render: (renderer: ContextT) => T | void): T | void;
  replace<T>(template: HTMLTemplateElement, render: (renderer: ContextT) => T | void): T | void;
}

export function StandardExt<T extends Alina.NodeContext>(renderer: T): T & StandardExtensions {
  let result = renderer as T & StandardExtensions;
  result.query = query;
  result.queryAll = queryAll;
  result.getEntry = getEntry;
  result.getEntries = getEntries;
  result.findNode = findNode;
  result.findNodes = findNodes;
  result.set = set;
  result.setOnce = setOnce;
  result.showIf = showIf;
  result.tpl = tpl;
  result.repeat = repeat;
  result.on = on;
  result.once = once;  
  return result;
}

function on<T>(this: Alina.NodeContext, value: T, callback: (renderer, value?: T, prevValue?: T) => T | void, key?: string): void {
  let context = this.getComponentContext<Record<'lastValue', T>>(on, key);
  if (context.lastValue !== value) {
    let result = callback(this, value, context.lastValue) as T;
    context.lastValue = result !== undefined ? result : value;
  }
}

function once(this: Alina.NodeContext, callback: (renderer) => void): void {
  let context = this.getComponentContext(once, "", () => ({ first: true }));
  if(context.first) {
    callback(this);
    context.first = false;
  }
}

function query(this: AlStd.Alina, selector: string): any {
  return this.mount(AlStd.AlQuery).query(selector);
}

function queryAll(this: AlStd.Alina, selector: string, render: (context) => void): void {
  this.mount(AlStd.AlQuery).queryAll(selector, render);
}

function getEntries(this: AlStd.Alina, entry: string, render: (context) => void): any {
  return this.mount(AlStd.AlEntry).getEntries(entry, render);
}

function getEntry(this: AlStd.Alina, entry: string): any {
  return this.mount(AlStd.AlEntry).getEntry(entry);
}

function findNode(this: AlStd.Alina, entry: string): any {
  return this.mount(AlStd.AlFind).findNode(entry);
}

function findNodes(this: AlStd.Alina, entry: string, render: (context) => void): any {
  return this.mount(AlStd.AlFind).findNodes(entry, render);
}

function set<T>(this: AlStd.Alina, stub: string, value: T): void {
  this.mount(AlStd.AlEntry).getEntries(stub, (context) => {
    context.mount(AlStd.AlSet).setEntry(value);
  });
}

function setOnce<T>(this: AlStd.Alina, stub: string, value: T): void {
  this.mount(AlStd.AlEntry).getEntries(stub, (context) => {
    context.mount(AlStd.AlSet).setEntryOnce(value);
  });
}

function repeat<T>(this: AlStd.Alina, templateSelector: string, items: T[], update: (renderer, model: T) => void): void {
  this.mount(AlStd.AlQuery).query(templateSelector)
    .mount(AlStd.AlRepeat).repeat(items, update);
}

function showIf(this: AlStd.Alina, templateSelector: string, value: boolean, render?: (context) => void): void {
  this.mount(AlStd.AlQuery).query(templateSelector)
    .mount(AlStd.AlShow).showIf(value, render);
}

function tpl(this: AlStd.Alina, key?: string): any {
  return this.mount(AlStd.AlTemplate, key);
}

