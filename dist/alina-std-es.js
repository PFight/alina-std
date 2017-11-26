import { Component, NodeContext, QueryType, definedNotNull, fromTemplate, getIdlName, undefinedOrNull } from 'alina-core';

class AlinaComponent extends Component {
    addChild(template, render) {
        this.root.tpl().addChild(template, render);
    }
    setChild(template, render) {
        this.root.tpl().setChild(template, render);
    }
    replace(template, render) {
        this.root.tpl().replace(template, render);
    }
}

let rootNode = typeof (document) === 'undefined' ? null : document;
var Document = rootNode &&
    new NodeContext(rootNode, null).ext(StandardExt);

const undefinedOrNull$1 = undefinedOrNull;
const definedNotNull$1 = definedNotNull;
class AlRepeat extends AlinaComponent {
    constructor() {
        super(...arguments);
        this.itemContexts = [];
    }
    repeat(items, update, options) {
        if (update) {
            this.context = {
                template: this.root.elem,
                container: this.root.elem.parentElement,
                insertBefore: this.root.elem,
                equals: options && options.equals,
                update: update
            };
        }
        this.repeatEx(items, this.context);
    }
    repeatEx(items, context) {
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
                let node = fromTemplate(props.template);
                itemContext.nodeContext = this.root.create(node);
            }
            // Fill content
            props.update(itemContext.nodeContext, modelItem);
            // Insert to parent
            if (!itemContext.mounted) {
                let position = i == 0 ? props.insertBefore : this.itemContexts[i - 1].nodeContext.node.nextSibling;
                if (position) {
                    props.container.insertBefore(itemContext.nodeContext.node, position);
                }
                else {
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
        this.itemContexts.splice(firstIndexToRemove, this.itemContexts.length - firstIndexToRemove);
    }
    compare(a, b, comparer) {
        return (undefinedOrNull$1(a) && undefinedOrNull$1(b)) ||
            (definedNotNull$1(a) && definedNotNull$1(b) && !comparer) ||
            (definedNotNull$1(a) && definedNotNull$1(b) && comparer && comparer(a, b));
    }
}

class AlSet extends AlinaComponent {
    setEntry(value) {
        if (this.lastValue !== value) {
            let preparedValue = value;
            let binding = this.root.binding;
            // Initial value is stub text (query)
            let lastValue = this.lastValue !== undefined ? this.lastValue : binding.query;
            if (binding.queryType == QueryType.NodeAttribute) {
                // Class names should be separated with space         
                if (binding.attributeName == "class") {
                    preparedValue = (!value) ? "" : value + " ";
                }
                // Some attributes has corresponding idl, some doesn't.
                if (binding.idlName) {
                    let currentVal = binding.node[binding.idlName];
                    if (typeof (currentVal) == "string") {
                        binding.node[binding.idlName] = currentVal.replace(lastValue, preparedValue);
                    }
                    else {
                        binding.node[binding.idlName] = preparedValue;
                    }
                }
                else {
                    let elem = binding.node;
                    let currentVal = elem.getAttribute(binding.attributeName);
                    elem.setAttribute(binding.attributeName, currentVal.replace(lastValue, preparedValue));
                }
            }
            else {
                binding.node.textContent = binding.node.textContent.replace(lastValue, value);
            }
            this.lastValue = preparedValue;
        }
    }
    setEntryOnce(value) {
        if (this.lastValue === undefined) {
            this.setEntry(value);
        }
    }
}

class AlShow extends AlinaComponent {
    showIf(value, render) {
        if (this.lastValue !== value) {
            let templateElem = this.root.nodeAs();
            if (value) {
                // Value changed and now is true - show node
                this.node = fromTemplate(templateElem);
                if (render) {
                    this.nodeContext = this.root.create(this.node);
                    render(this.nodeContext);
                }
                templateElem.parentElement.insertBefore(this.node, templateElem);
            }
            else {
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
        }
        else {
            // Render on every call, even if value not changed
            if (value && render && this.nodeContext) {
                render(this.nodeContext);
            }
        }
    }
}

class AlTemplate extends AlinaComponent {
    addChild(template, render) {
        if (!this.result) {
            this.result = this.root.create(this.instantiateTemplateOne(template));
            let ret = render(this.result);
            this.root.elem.appendChild(this.result.node);
            return ret;
        }
        else {
            return render(this.result);
        }
    }
    setChild(template, render) {
        if (!this.result) {
            this.result = this.root.create(this.instantiateTemplateOne(template));
            let ret = render(this.result);
            this.root.elem.innerHTML = "";
            this.root.elem.appendChild(this.result.node);
            return ret;
        }
        else {
            return render(this.result);
        }
    }
    replace(template, render) {
        if (!this.result) {
            this.result = this.root.create(this.instantiateTemplateOne(template));
            let ret = render(this.result);
            let parent = this.root.elem.parentElement;
            if (parent) {
                parent.replaceChild(this.result.elem, this.root.elem);
            }
            this.root.elem = this.result.elem;
            return ret;
        }
        else {
            return render(this.result);
        }
    }
    //protected instantiateTemplate(templateElem: HTMLTemplateElement): Node[] {
    //  return templateElem.content ?
    //    [].map.call(templateElem.content.children, (node) => node.cloneNode(true))
    //    :
    //    [].map.call(templateElem.children, (node) => node.cloneNode(true))
    //}
    instantiateTemplateOne(templateElem) {
        return fromTemplate(templateElem);
    }
}

class AlQuery extends AlinaComponent {
    query(selector) {
        let context = this.root.getComponentContext(AlQuery, selector, () => ({
            result: this.root.create(this.querySelectorInternal(selector))
        }));
        return context.result;
    }
    queryAll(selector, render) {
        let context = this.root.getComponentContext(AlQuery, selector, () => ({
            contexts: this.querySelectorAllInternal(selector).map(x => this.root.create({
                node: x,
                queryType: QueryType.Node,
                query: selector
            }))
        }));
        for (let c of context.contexts) {
            render(c);
        }
    }
    querySelectorInternal(selector) {
        let result;
        if (this.root.node.nodeType == Node.ELEMENT_NODE || this.root.node.nodeType == Node.DOCUMENT_NODE) {
            let elem = this.root.node;
            if (elem.matches && elem.matches(selector)) {
                result = elem;
            }
            else {
                result = elem.querySelector(selector);
            }
        }
        return result;
    }
    querySelectorAllInternal(selector) {
        let result = [];
        let node = this.root.node;
        if (node.nodeType == Node.ELEMENT_NODE || node.nodeType == Node.DOCUMENT_NODE) {
            let elem = node;
            if (elem.matches && elem.matches(selector)) {
                result.push(elem);
            }
            result = result.concat(elem.querySelectorAll(selector));
        }
        return result;
    }
}

class AlEntry extends AlinaComponent {
    getEntries(entry, render) {
        let context = this.root.getComponentContext(AlEntry, entry, () => {
            let bindings = [];
            this.getEntiresInternal(this.root.node, entry, bindings, false);
            return { contexts: bindings.map(x => this.root.create(x)) };
        });
        for (let c of context.contexts) {
            render(c);
        }
    }
    getEntry(entry) {
        let context = this.root.getComponentContext(AlEntry, entry, () => {
            let bindings = [];
            this.getEntiresInternal(this.root.node, entry, bindings, true);
            return { nodeContext: this.root.create(bindings[0]) };
        });
        return context.nodeContext;
    }
    getEntiresInternal(node, query, bindings, single, queryType) {
        if (queryType === undefined || queryType == QueryType.NodeTextContent) {
            if (node.nodeType == Node.TEXT_NODE || node.nodeType == Node.COMMENT_NODE) {
                let parts = node.textContent.split(query);
                if (parts.length > 1) {
                    // Split content, to make stub separate node 
                    // and save this node to context.stubNodes
                    let nodeParent = node.parentNode;
                    for (let i = 0; i < parts.length - 1; i++) {
                        let part = parts[i];
                        if (part.length > 0) {
                            nodeParent.insertBefore(document.createTextNode(part), node);
                        }
                        let stubNode = document.createTextNode(query);
                        if (!single || bindings.length == 0) {
                            bindings.push({
                                node: stubNode,
                                queryType: QueryType.NodeTextContent,
                                query: query
                            });
                        }
                        nodeParent.insertBefore(stubNode, node);
                    }
                    let lastPart = parts[parts.length - 1];
                    if (lastPart && lastPart.length > 0) {
                        nodeParent.insertBefore(document.createTextNode(lastPart), node);
                    }
                    nodeParent.removeChild(node);
                }
            }
        }
        if ((queryType === undefined || queryType == QueryType.NodeAttribute) && node.attributes) {
            for (let i = 0; i < node.attributes.length && (!single || bindings.length == 0); i++) {
                let attr = node.attributes[i];
                if (attr.value && attr.value.indexOf(query) >= 0) {
                    bindings.push({
                        node: node,
                        query: query,
                        attributeName: attr.name,
                        idlName: getIdlName(attr, node),
                        queryType: QueryType.NodeAttribute
                    });
                }
            }
        }
        for (let i = 0; i < node.childNodes.length && (!single || bindings.length == 0); i++) {
            let lengthBefore = node.childNodes.length;
            this.getEntiresInternal(node.childNodes[i], query, bindings, single, queryType);
            let lengthAfter = node.childNodes.length;
            // Node can be replaced by several other nodes
            if (lengthAfter > lengthBefore) {
                i += lengthAfter - lengthBefore;
            }
        }
    }
}

class AlFind extends AlinaComponent {
    findNode(entry) {
        let context = this.root.getComponentContext(AlFind, entry, () => {
            let bindings = [];
            this.findNodesInternal(this.root.node, entry, bindings, true);
            return { nodeContext: this.root.create(bindings[0]) };
        });
        return context.nodeContext;
    }
    findNodes(entry, render) {
        let context = this.root.getComponentContext(AlFind, entry, () => {
            let bindings = [];
            this.findNodesInternal(this.root.node, entry, bindings, false);
            return { contexts: bindings.map(x => this.root.create(x)) };
        });
        for (let c of context.contexts) {
            render(c);
        }
    }
    findNodesInternal(node, query, bindings, single) {
        let found = false;
        if (node.nodeType == Node.TEXT_NODE || node.nodeType == Node.COMMENT_NODE) {
            if (node.textContent.indexOf(query) >= 0) {
                bindings.push({
                    node: node,
                    query: query,
                    queryType: QueryType.Node
                });
                found = true;
            }
        }
        if (!found && node.attributes) {
            for (let i = 0; i < node.attributes.length && !found; i++) {
                let attr = node.attributes[i];
                if (attr.name.indexOf(query) >= 0 || attr.value.indexOf(query) >= 0) {
                    bindings.push({
                        node: node,
                        query: query,
                        attributeName: attr.name,
                        idlName: getIdlName(attr, node),
                        queryType: QueryType.Node
                    });
                }
            }
        }
        for (let i = 0; i < node.childNodes.length && (!single || bindings.length == 0); i++) {
            this.findNodesInternal(node.childNodes[i], query, bindings, single);
        }
    }
}

function StandardExt(renderer) {
    let result = renderer;
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
function on(value, callback, key) {
    let context = this.getComponentContext(on, key);
    if (context.lastValue !== value) {
        let result = callback(this, value, context.lastValue);
        context.lastValue = result !== undefined ? result : value;
    }
}
function once(callback) {
    let context = this.getComponentContext(once, "", () => ({ first: true }));
    if (context.first) {
        callback(this);
        context.first = false;
    }
}
function query(selector) {
    return this.mount(AlQuery).query(selector);
}
function queryAll(selector, render) {
    this.mount(AlQuery).queryAll(selector, render);
}
function getEntries(entry, render) {
    return this.mount(AlEntry).getEntries(entry, render);
}
function getEntry(entry) {
    return this.mount(AlEntry).getEntry(entry);
}
function findNode(entry) {
    return this.mount(AlFind).findNode(entry);
}
function findNodes(entry, render) {
    return this.mount(AlFind).findNodes(entry, render);
}
function set(stub, value) {
    this.mount(AlEntry).getEntries(stub, (context) => {
        context.mount(AlSet).setEntry(value);
    });
}
function setOnce(stub, value) {
    this.mount(AlEntry).getEntries(stub, (context) => {
        context.mount(AlSet).setEntryOnce(value);
    });
}
function repeat(templateSelector, items, update) {
    this.mount(AlQuery).query(templateSelector)
        .mount(AlRepeat).repeat(items, update);
}
function showIf(templateSelector, value, render) {
    this.mount(AlQuery).query(templateSelector)
        .mount(AlShow).showIf(value, render);
}
function tpl(key) {
    return this.mount(AlTemplate, key);
}

//export * from "alina-core";
//import { Alina, AlinaComponent, Document, FuncAlinaComponent} from "./alina-std/Main";
//export { Alina, AlinaComponent, Document, FuncAlinaComponent };

export { AlinaComponent, Document, AlRepeat, AlSet, AlShow, AlTemplate, AlQuery, AlEntry, AlFind, StandardExt };
