import { FieldEditorBase } from "./base";
require("../../thirdparty/jscolor");

const template =
  '<div class="ui input"><input type="text" class="jscolor" value="" /></div>';

const type = "color";

class FieldEditorColor extends FieldEditorBase {
  private picker;

  constructor(isSettings, options) {
    super();

    let $dom = $(template);

    this.picker = new jscolor($dom.find("input").get(0));

    this.set$Dom($dom);
  }

  getType() {
    return type;
  }
  getValue = function () {
    return this.picker.toHEXString();
  };

  setValue = function (v) {
    this.picker.fromString("" + v);
  };
}

FieldEditorBase.register(FieldEditorColor, type, "Colour");
