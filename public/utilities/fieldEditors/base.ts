import { SourceMap } from "module";

export const requiresLiteralWrap = ["string"];

export abstract class FieldEditorBase {
  public static byType = {};
  public static register = function (f, type, label) {
    f.type = type;
    f.label = label;

    f.propStructure = f.propStructure || type;

    f.finalizeValue = f.finalizeValue || function () {};

    this.byType[type] = f;
  };

  public static getEditorClass = function (type) {
    return this.byType[type];
  };

  public static getEditor = function (isSettings, options) {
    let type = options.type,
      name = options.name,
      value = options.value,
      viewName = options.viewName,
      templateName = options.templateName,
      instanceName = options.instanceName,
      cls = this.getEditorClass(type),
      editor = new cls(isSettings, {
        name: name,
        value: value,
        viewName: viewName,
        templateName: templateName,
        instanceName: instanceName,
      });

    return editor;
  };

  constructor() {}

  private name: string;
  public $root;
  private viewName: string;
  private templateName: string;
  private instanceName: string;

  init(isSettings, options) {
    this.get$Dom().data("editor", this);
    this.setName(options.name);
    this.setViewName(options.viewName);
    this.setTemplateName(options.templateName);
    this.setInstanceName(options.instanceName);
    this.setValue(options.value);
  }

  abstract setValue(v);
  abstract getType(): any;

  setName(name) {
    this.name = name;
  }

  getName() {
    return this.name;
  }

  set$Dom(dom) {
    this.$root = dom;
    dom.addClass("fieldEditor");
    dom.addClass("field-" + this.getType());
  }

  get$Dom() {
    return this.$root;
  }

  setViewName(viewName) {
    this.viewName = viewName;
  }
  setTemplateName(templateName) {
    this.templateName = templateName;
  }
  setInstanceName(instanceName) {
    this.instanceName = instanceName;
  }

  getViewName() {
    return this.viewName;
  }
  getTemplateName() {
    return this.templateName;
  }
  getInstanceName() {
    return this.instanceName;
  }
}
