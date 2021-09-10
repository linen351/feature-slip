import { FieldEditorBase } from "./base";

const template = '<div class="ui input"><input type="text" value="" /></div>';

const type = "string";

class FieldEditorString extends FieldEditorBase {
  private $input;

  constructor(isSettings, options) {
    super();

    let $dom = $(template);

    this.set$Dom($dom);

    this.$input = this.$root.find("input");
  }

  getType() {
    return type;
  }

  getValue() {
    return this.$input.val();
  }

  setValue(v) {
    this.$input.val(v);
  }
}

FieldEditorBase.register(FieldEditorString, type, "String");
