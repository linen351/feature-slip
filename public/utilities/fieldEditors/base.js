window.featureSlip.fieldEditors = window.featureSlip.fieldEditors || {};

window.featureSlip.fieldEditors.byType = {};

window.featureSlip.fieldEditors.register = function (f, type, label) {

    f.type = type;
    f.label = label;

    f.propStructure = f.propStructure || type;

    f.finalizeValue = f.finalizeValue || function() {};

    f.prototype.getType = function () { return type; }

    window.featureSlip.fieldEditors.byType[type] = f;

};

window.featureSlip.fieldEditors.requiresLiteralWrap = ["string"];

let getEditorClass = window.featureSlip.fieldEditors.getEditorClass = function (type) {

    return featureSlip.fieldEditors.byType[type];

}

window.featureSlip.fieldEditors.getEditor = function (isSettings, options) {

    let type = options.type,
        name = options.name,
        value = options.value,
        viewName = options.viewName,
        templateName = options.templateName,
        instanceName = options.instanceName,

        cls = getEditorClass(type),

        editor = new cls(isSettings, {
            name: name,
            value: value,
            viewName: viewName,
            templateName: templateName,
            instanceName: instanceName
        });

    return editor;

};

window.featureSlip.fieldEditors.Base = (function () {

    function f() {
    }

    f.prototype.init = function (isSettings, options) {
        this.get$Dom().data("editor", this);
        this.setName(options.name);
        this.setViewName(options.viewName);
        this.setTemplateName(options.templateName);
        this.setInstanceName(options.instanceName);
        this.setValue(options.value);
    };

    f.prototype.setName = function (name) { this.name = name; };

    f.prototype.getName = function () { return this.name; };

    f.prototype.set$Dom = function (dom) {
        this.$root = dom;
        dom.addClass("fieldEditor");
        dom.addClass("field-" + this.getType());
    };

    f.prototype.get$Dom = function () { return this.$root; };

    f.prototype.setViewName = function (viewName) { this.viewName = viewName; }
    f.prototype.setTemplateName = function (templateName) { this.templateName = templateName; }
    f.prototype.setInstanceName = function (instanceName) { this.instanceName = instanceName; }

    f.prototype.getViewName = function () { return this.viewName; }
    f.prototype.getTemplateName = function () { return this.templateName; }
    f.prototype.getInstanceName = function () { return this.instanceName; }

    return f;

}());