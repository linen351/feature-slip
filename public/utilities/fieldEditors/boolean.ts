import { FieldEditorBase } from "./base";

const template =
  '<div class="ui toggle checkbox"><input type="checkbox" /><label></label></div>';

const type = "boolean";

class FieldEditorBoolean extends FieldEditorBase {
  private $checkbox;

  constructor(isSettings, options) {
    super();

    let $dom = $(template);

    this.$checkbox = $dom.find("input");

    this.set$Dom($dom);
  }

  getType() {
    return type;
  }

  getValue() {
    return this.$checkbox.is(":checked");
  }

  setValue(v) {
    this.$checkbox.attr("checked", v);
  }
}

FieldEditorBase.register(FieldEditorBoolean, type, "Boolean");
