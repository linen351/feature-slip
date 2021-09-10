import { FieldEditorBase } from "./base";

const template = '<div class="ui input"><input type="number" value="" /></div>';

const type = "number";

class FieldEditorNumber extends FieldEditorBase {
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
    return parseInt(this.$input.val());
  }

  setValue(v) {
    this.$input.val(v);
  }
}

FieldEditorBase.register(FieldEditorNumber, type, "Number");
