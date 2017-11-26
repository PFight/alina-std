declare module "alina-std/Main" {
    import * as Al from "alina-core";
    import * as AlStd from "alina-std";
    export type Alina = Al.NodeContext & AlStd.StandardExtensions;
    export class AlinaComponent<ContextT extends Alina = Alina> extends Al.Component<ContextT> implements AlStd.ITemplateProcessor<ContextT> {
        addChild(template: HTMLTemplateElement, render?: (renderer: ContextT) => void): void;
        setChild(template: HTMLTemplateElement, render?: (renderer: ContextT) => void): void;
        replace(template: HTMLTemplateElement, render?: (renderer: ContextT) => void): void;
    }
    export type FuncAlinaComponent<PropsT, RetT> = Al.FuncComponent<Alina, PropsT, RetT>;
    export var Document: Alina;
}
declare module "alina-std/AlRepeat" {
    import * as AlStd from "alina-std";
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
        itemContexts: RepeatItemContext<any>[];
        context: AlRepeatContext<any>;
        repeat<T>(items: T[], update: (renderer: AlStd.Alina, model: T) => void, options?: RepeatExtraOptions<T>): void;
        repeatEx<T>(items: T[], context: AlRepeatContext<T>): void;
        protected compare(a: any, b: any, comparer: any): any;
    }
}
declare module "alina-std/AlSet" {
    import * as AlStd from "alina-std";
    export class AlSet extends AlStd.AlinaComponent {
        lastValue: any;
        setEntry(value: any): void;
        setEntryOnce(value: any): void;
    }
}
declare module "alina-std/AlShow" {
    import * as AlStd from "alina-std";
    export class AlShow extends AlStd.AlinaComponent {
        lastValue: any;
        node: Node;
        nodeContext: AlStd.Alina;
        showIf(value: boolean, render?: (context: AlStd.Alina) => void): void;
    }
}
declare module "alina-std/AlTemplate" {
    import * as Alina from "alina-core";
    import * as AlStd from "alina-std";
    export class AlTemplate extends AlStd.AlinaComponent implements AlStd.ITemplateProcessor<Alina.Alina> {
        result: AlStd.Alina;
        addChild<T>(template: HTMLTemplateElement, render: (renderer: AlStd.Alina) => T | void): T | void;
        setChild<T>(template: HTMLTemplateElement, render: (renderer: AlStd.Alina) => T | void): T | void;
        replace<T>(template: HTMLTemplateElement, render: (renderer: AlStd.Alina) => T | void): T | void;
        protected instantiateTemplateOne(templateElem: HTMLTemplateElement): Node;
    }
}
declare module "alina-std/AlQuery" {
    import * as Alina from "alina-core";
    import * as AlStd from "alina-std";
    export class AlQuery extends AlStd.AlinaComponent {
        query(selector: string): AlStd.Alina;
        queryAll(selector: string, render: (context: Alina.NodeContext) => void): void;
        protected querySelectorInternal(selector: string): Element;
        protected querySelectorAllInternal(selector: string): Element[];
    }
}
declare module "alina-std/AlEntry" {
    import * as Alina from "alina-core";
    import * as AlStd from "alina-std";
    export class AlEntry extends AlStd.AlinaComponent {
        getEntries(entry: string, render: (context: AlStd.Alina) => void): void;
        getEntry(entry: string): AlStd.Alina;
        protected getEntiresInternal(node: Node, query: string, bindings: Alina.NodeBinding[], single: boolean, queryType?: Alina.QueryType): void;
    }
}
declare module "alina-std/AlFind" {
    import * as Alina from "alina-core";
    import * as AlStd from "alina-std";
    export class AlFind extends AlStd.AlinaComponent {
        findNode(entry: string): AlStd.Alina;
        findNodes(entry: string, render: (context: Alina.NodeContext) => void): void;
        protected findNodesInternal(node: Node, query: string, bindings: Alina.NodeBinding[], single: boolean): void;
    }
}
declare module "alina-std/StandardExtensions" {
    import * as Alina from "alina-core";
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
    export function StandardExt<T extends Alina.NodeContext>(renderer: T): T & StandardExtensions;
}
declare module "alina-std" {
    export * from "alina-std/Main";
    export * from "alina-std/AlRepeat";
    export * from "alina-std/AlSet";
    export * from "alina-std/AlShow";
    export * from "alina-std/AlTemplate";
    export * from "alina-std/AlQuery";
    export * from "alina-std/AlEntry";
    export * from "alina-std/AlFind";
    export * from "alina-std/StandardExtensions";
}
