var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('alina-core')) :
        typeof define === 'function' && define.amd ? define(['exports', 'alina-core'], factory) :
            (factory((global.alina = {}), global.Alina));
}(this, (function (exports, Alina) {
    'use strict';
    var AlinaComponent = /** @class */ (function (_super) {
        __extends(AlinaComponent, _super);
        function AlinaComponent() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        AlinaComponent.prototype.addChild = function (template, render) {
            this.root.tpl().addChild(template, render);
        };
        AlinaComponent.prototype.setChild = function (template, render) {
            this.root.tpl().setChild(template, render);
        };
        AlinaComponent.prototype.replace = function (template, render) {
            this.root.tpl().replace(template, render);
        };
        return AlinaComponent;
    }(Alina.Component));
    var rootNode = typeof (document) === 'undefined' ? null : document;
    var Document = rootNode &&
        new Alina.NodeContext(rootNode, null).ext(StandardExt);
    var undefinedOrNull$1 = Alina.undefinedOrNull;
    var definedNotNull$1 = Alina.definedNotNull;
    var AlRepeat = /** @class */ (function (_super) {
        __extends(AlRepeat, _super);
        function AlRepeat() {
            var _this = _super.apply(this, arguments) || this;
            _this.itemContexts = [];
            return _this;
        }
        AlRepeat.prototype.repeat = function (items, update, options) {
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
        };
        AlRepeat.prototype.repeatEx = function (items, context) {
            if (context) {
                this.context = context;
            }
            var props = this.context;
            // Add new and update existing
            for (var i = 0; i < items.length; i++) {
                var modelItem = items[i];
                // Createcontext
                var itemContext = this.itemContexts[i];
                if (!itemContext || !this.compare(modelItem, itemContext.oldModelItem, props.equals)) {
                    itemContext = this.itemContexts[i] = {};
                }
                // Create node
                if (!itemContext.nodeContext) {
                    var node = Alina.fromTemplate(props.template);
                    itemContext.nodeContext = this.root.create(node);
                }
                // Fill content
                props.update(itemContext.nodeContext, modelItem);
                // Insert to parent
                if (!itemContext.mounted) {
                    var position = i == 0 ? props.insertBefore : this.itemContexts[i - 1].nodeContext.node.nextSibling;
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
            var firstIndexToRemove = items.length;
            for (var i = firstIndexToRemove; i < this.itemContexts.length; i++) {
                var context_1 = this.itemContexts[i];
                context_1.nodeContext.dispose();
                var elem = context_1.nodeContext.node;
                if (elem) {
                    props.container.removeChild(elem);
                }
            }
            this.itemContexts.splice(firstIndexToRemove, this.itemContexts.length - firstIndexToRemove);
        };
        AlRepeat.prototype.compare = function (a, b, comparer) {
            return (undefinedOrNull$1(a) && undefinedOrNull$1(b)) ||
                (definedNotNull$1(a) && definedNotNull$1(b) && !comparer) ||
                (definedNotNull$1(a) && definedNotNull$1(b) && comparer && comparer(a, b));
        };
        return AlRepeat;
    }(AlinaComponent));
    var AlSet = /** @class */ (function (_super) {
        __extends(AlSet, _super);
        function AlSet() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        AlSet.prototype.setEntry = function (value) {
            if (this.lastValue !== value) {
                var preparedValue = value;
                var binding = this.root.binding;
                // Initial value is stub text (query)
                var lastValue = this.lastValue !== undefined ? this.lastValue : binding.query;
                if (binding.queryType == Alina.QueryType.NodeAttribute) {
                    // Class names should be separated with space         
                    if (binding.attributeName == "class") {
                        preparedValue = (!value) ? "" : value + " ";
                    }
                    // Some attributes has corresponding idl, some doesn't.
                    if (binding.idlName) {
                        var currentVal = binding.node[binding.idlName];
                        if (typeof (currentVal) == "string") {
                            binding.node[binding.idlName] = currentVal.replace(lastValue, preparedValue);
                        }
                        else {
                            binding.node[binding.idlName] = preparedValue;
                        }
                    }
                    else {
                        var elem = binding.node;
                        var currentVal = elem.getAttribute(binding.attributeName);
                        elem.setAttribute(binding.attributeName, currentVal.replace(lastValue, preparedValue));
                    }
                }
                else {
                    binding.node.textContent = binding.node.textContent.replace(lastValue, value);
                }
                this.lastValue = preparedValue;
            }
        };
        AlSet.prototype.setEntryOnce = function (value) {
            if (this.lastValue === undefined) {
                this.setEntry(value);
            }
        };
        return AlSet;
    }(AlinaComponent));
    var AlShow = /** @class */ (function (_super) {
        __extends(AlShow, _super);
        function AlShow() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        AlShow.prototype.showIf = function (value, render) {
            if (this.lastValue !== value) {
                var templateElem = this.root.nodeAs();
                if (value) {
                    // Value changed and now is true - show node
                    this.node = Alina.fromTemplate(templateElem);
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
        };
        return AlShow;
    }(AlinaComponent));
    var AlTemplate = /** @class */ (function (_super) {
        __extends(AlTemplate, _super);
        function AlTemplate() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        AlTemplate.prototype.addChild = function (template, render) {
            if (!this.result) {
                this.result = this.root.create(this.instantiateTemplateOne(template));
                var ret = render(this.result);
                this.root.elem.appendChild(this.result.node);
                return ret;
            }
            else {
                return render(this.result);
            }
        };
        AlTemplate.prototype.setChild = function (template, render) {
            if (!this.result) {
                this.result = this.root.create(this.instantiateTemplateOne(template));
                var ret = render(this.result);
                this.root.elem.innerHTML = "";
                this.root.elem.appendChild(this.result.node);
                return ret;
            }
            else {
                return render(this.result);
            }
        };
        AlTemplate.prototype.replace = function (template, render) {
            if (!this.result) {
                this.result = this.root.create(this.instantiateTemplateOne(template));
                var ret = render(this.result);
                var parent_1 = this.root.elem.parentElement;
                if (parent_1) {
                    parent_1.replaceChild(this.result.elem, this.root.elem);
                }
                this.root.elem = this.result.elem;
                return ret;
            }
            else {
                return render(this.result);
            }
        };
        //protected instantiateTemplate(templateElem: HTMLTemplateElement): Node[] {
        //  return templateElem.content ?
        //    [].map.call(templateElem.content.children, (node) => node.cloneNode(true))
        //    :
        //    [].map.call(templateElem.children, (node) => node.cloneNode(true))
        //}
        AlTemplate.prototype.instantiateTemplateOne = function (templateElem) {
            return Alina.fromTemplate(templateElem);
        };
        return AlTemplate;
    }(AlinaComponent));
    var AlQuery = /** @class */ (function (_super) {
        __extends(AlQuery, _super);
        function AlQuery() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        AlQuery.prototype.query = function (selector) {
            var _this = this;
            var context = this.root.getComponentContext(AlQuery, selector, function () { return ({
                result: _this.root.create(_this.querySelectorInternal(selector))
            }); });
            return context.result;
        };
        AlQuery.prototype.queryAll = function (selector, render) {
            var _this = this;
            var context = this.root.getComponentContext(AlQuery, selector, function () { return ({
                contexts: _this.querySelectorAllInternal(selector).map(function (x) { return _this.root.create({
                    node: x,
                    queryType: Alina.QueryType.Node,
                    query: selector
                }); })
            }); });
            for (var _i = 0, _a = context.contexts; _i < _a.length; _i++) {
                var c = _a[_i];
                render(c);
            }
        };
        AlQuery.prototype.querySelectorInternal = function (selector) {
            var result;
            if (this.root.node.nodeType == Node.ELEMENT_NODE || this.root.node.nodeType == Node.DOCUMENT_NODE) {
                var elem = this.root.node;
                if (elem.matches && elem.matches(selector)) {
                    result = elem;
                }
                else {
                    result = elem.querySelector(selector);
                }
            }
            return result;
        };
        AlQuery.prototype.querySelectorAllInternal = function (selector) {
            var result = [];
            var node = this.root.node;
            if (node.nodeType == Node.ELEMENT_NODE || node.nodeType == Node.DOCUMENT_NODE) {
                var elem = node;
                if (elem.matches && elem.matches(selector)) {
                    result.push(elem);
                }
                result = result.concat(elem.querySelectorAll(selector));
            }
            return result;
        };
        return AlQuery;
    }(AlinaComponent));
    var AlEntry = /** @class */ (function (_super) {
        __extends(AlEntry, _super);
        function AlEntry() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        AlEntry.prototype.getEntries = function (entry, render) {
            var _this = this;
            var context = this.root.getComponentContext(AlEntry, entry, function () {
                var bindings = [];
                _this.getEntiresInternal(_this.root.node, entry, bindings, false);
                return { contexts: bindings.map(function (x) { return _this.root.create(x); }) };
            });
            for (var _i = 0, _a = context.contexts; _i < _a.length; _i++) {
                var c = _a[_i];
                render(c);
            }
        };
        AlEntry.prototype.getEntry = function (entry) {
            var _this = this;
            var context = this.root.getComponentContext(AlEntry, entry, function () {
                var bindings = [];
                _this.getEntiresInternal(_this.root.node, entry, bindings, true);
                return { nodeContext: _this.root.create(bindings[0]) };
            });
            return context.nodeContext;
        };
        AlEntry.prototype.getEntiresInternal = function (node, query, bindings, single, queryType) {
            if (queryType === undefined || queryType == Alina.QueryType.NodeTextContent) {
                if (node.nodeType == Node.TEXT_NODE || node.nodeType == Node.COMMENT_NODE) {
                    var parts = node.textContent.split(query);
                    if (parts.length > 1) {
                        // Split content, to make stub separate node 
                        // and save this node to context.stubNodes
                        var nodeParent = node.parentNode;
                        for (var i = 0; i < parts.length - 1; i++) {
                            var part = parts[i];
                            if (part.length > 0) {
                                nodeParent.insertBefore(document.createTextNode(part), node);
                            }
                            var stubNode = document.createTextNode(query);
                            if (!single || bindings.length == 0) {
                                bindings.push({
                                    node: stubNode,
                                    queryType: Alina.QueryType.NodeTextContent,
                                    query: query
                                });
                            }
                            nodeParent.insertBefore(stubNode, node);
                        }
                        var lastPart = parts[parts.length - 1];
                        if (lastPart && lastPart.length > 0) {
                            nodeParent.insertBefore(document.createTextNode(lastPart), node);
                        }
                        nodeParent.removeChild(node);
                    }
                }
            }
            if ((queryType === undefined || queryType == Alina.QueryType.NodeAttribute) && node.attributes) {
                for (var i = 0; i < node.attributes.length && (!single || bindings.length == 0); i++) {
                    var attr = node.attributes[i];
                    if (attr.value && attr.value.indexOf(query) >= 0) {
                        bindings.push({
                            node: node,
                            query: query,
                            attributeName: attr.name,
                            idlName: Alina.getIdlName(attr, node),
                            queryType: Alina.QueryType.NodeAttribute
                        });
                    }
                }
            }
            for (var i = 0; i < node.childNodes.length && (!single || bindings.length == 0); i++) {
                var lengthBefore = node.childNodes.length;
                this.getEntiresInternal(node.childNodes[i], query, bindings, single, queryType);
                var lengthAfter = node.childNodes.length;
                // Node can be replaced by several other nodes
                if (lengthAfter > lengthBefore) {
                    i += lengthAfter - lengthBefore;
                }
            }
        };
        return AlEntry;
    }(AlinaComponent));
    var AlFind = /** @class */ (function (_super) {
        __extends(AlFind, _super);
        function AlFind() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        AlFind.prototype.findNode = function (entry) {
            var _this = this;
            var context = this.root.getComponentContext(AlFind, entry, function () {
                var bindings = [];
                _this.findNodesInternal(_this.root.node, entry, bindings, true);
                return { nodeContext: _this.root.create(bindings[0]) };
            });
            return context.nodeContext;
        };
        AlFind.prototype.findNodes = function (entry, render) {
            var _this = this;
            var context = this.root.getComponentContext(AlFind, entry, function () {
                var bindings = [];
                _this.findNodesInternal(_this.root.node, entry, bindings, false);
                return { contexts: bindings.map(function (x) { return _this.root.create(x); }) };
            });
            for (var _i = 0, _a = context.contexts; _i < _a.length; _i++) {
                var c = _a[_i];
                render(c);
            }
        };
        AlFind.prototype.findNodesInternal = function (node, query, bindings, single) {
            var found = false;
            if (node.nodeType == Node.TEXT_NODE || node.nodeType == Node.COMMENT_NODE) {
                if (node.textContent.indexOf(query) >= 0) {
                    bindings.push({
                        node: node,
                        query: query,
                        queryType: Alina.QueryType.Node
                    });
                    found = true;
                }
            }
            if (!found && node.attributes) {
                for (var i = 0; i < node.attributes.length && !found; i++) {
                    var attr = node.attributes[i];
                    if (attr.name.indexOf(query) >= 0 || attr.value.indexOf(query) >= 0) {
                        bindings.push({
                            node: node,
                            query: query,
                            attributeName: attr.name,
                            idlName: Alina.getIdlName(attr, node),
                            queryType: Alina.QueryType.Node
                        });
                    }
                }
            }
            for (var i = 0; i < node.childNodes.length && (!single || bindings.length == 0); i++) {
                this.findNodesInternal(node.childNodes[i], query, bindings, single);
            }
        };
        return AlFind;
    }(AlinaComponent));
    function StandardExt(renderer) {
        var result = renderer;
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
        var context = this.getComponentContext(on, key);
        if (context.lastValue !== value) {
            var result = callback(this, value, context.lastValue);
            context.lastValue = result !== undefined ? result : value;
        }
    }
    function once(callback) {
        var context = this.getComponentContext(once, "", function () { return ({ first: true }); });
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
        this.mount(AlEntry).getEntries(stub, function (context) {
            context.mount(AlSet).setEntry(value);
        });
    }
    function setOnce(stub, value) {
        this.mount(AlEntry).getEntries(stub, function (context) {
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
    exports.AlinaComponent = AlinaComponent;
    exports.Document = Document;
    exports.AlRepeat = AlRepeat;
    exports.AlSet = AlSet;
    exports.AlShow = AlShow;
    exports.AlTemplate = AlTemplate;
    exports.AlQuery = AlQuery;
    exports.AlEntry = AlEntry;
    exports.AlFind = AlFind;
    exports.StandardExt = StandardExt;
    Object.defineProperty(exports, '__esModule', { value: true });
})));
