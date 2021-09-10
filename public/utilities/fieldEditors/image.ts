import { stringFormat } from "../utilities";
import { FieldEditorBase } from "./base";

const template =
  '<div class="ui animated button"><div class="visible content">V&auml;lj</div><div class="hidden content"></div></div>';

const type = "image";

const dialogTemplate =
  '<div class="image-selector ui modal"><i class="close icon"></i><div class="header">Image</div><div class="content"></div><div class="actions"><div class="ui black deny button">Cancel</div></div></div>';
const categoryTemplate =
  '<div class="category"><h3 class="ui header">{0}</h3></div>';
const imageTemplate =
  '<div class="item"><div class="preview" style="background-image: url(\'{1}\');"></div>{0}</div>';

const locationTypes = {
  global: "global",
  template: "template",
  view: "view",
  instance: "instance",
};

function getPath(locationType, data?) {
  data = data || {};

  let templateName = data.templateName,
    instanceName = data.instanceName,
    viewName = data.viewName;

  switch (locationType) {
    case locationTypes.global:
      return "/data/files";

    case locationTypes.view:
      if (viewName) {
        return "/data/views/" + viewName + "/files";
      }
      break;
    case locationTypes.template:
      if (templateName) {
        return "/data/templates/" + templateName + "/files";
      }
      break;
    case locationTypes.instance:
      if (templateName && instanceName) {
        return (
          "/data/templates/" +
          templateName +
          "/instances/" +
          instanceName +
          "/files"
        );
      }
  }
}

class FieldEditorImage extends FieldEditorBase {
  private value;

  constructor(isSettings, options) {
    super();

    let $dom = $(template);

    let that = this;

    this.set$Dom($dom);

    $dom.click(function (event) {
      event.stopPropagation();
      that.openSelector();
    });
  }

  getType() {
    return type;
  }

  getValue() {
    return this.value;
  }

  setValue(v) {
    this.value = v;
    let $dom = this.get$Dom();
    $dom.find(".visible.content").html(v ? v.name : "V&auml;lj");

    if (v) {
      let path = getPath(v.locationType, {
        viewName: this.getViewName(),
        templateName: this.getTemplateName(),
        instanceName: this.getInstanceName(),
      });

      if (path) {
        $dom
          .find(".hidden.content")
          .css(
            "background-image",
            v ? "url('" + path + "/" + v.name + "')" : ""
          );
      }
    }
  }

  openSelector() {
    let that = this,
      $dialog = $(dialogTemplate).appendTo("body");

    $dialog.modal("show");

    function close() {
      $dialog.modal("hide", function () {
        $dialog.remove();
      });
    }

    function loadPath(locationType, data?) {
      let name = locationType;

      let path = getPath(locationType, data);

      $.getJSON(path, function (filePaths) {
        if (filePaths.length) {
          let $category = $(stringFormat(categoryTemplate, name)).appendTo(
            $dialog.find(".content")
          );

          filePaths.forEach(function (fileName) {
            let filePath = path + "/" + fileName;

            let $file = $(stringFormat(imageTemplate, fileName, filePath));

            $category.append($file);

            $file.click(function () {
              that.setValue({
                name: fileName,
                locationType: locationType,
              });

              close();
            });
          });
        }
      });
    }

    let viewName = this.getViewName(),
      templateName = this.getTemplateName(),
      instanceName = this.getInstanceName();

    loadPath(locationTypes.global);

    if (viewName) {
      loadPath(locationTypes.view, { viewName: viewName });
    }

    if (templateName) {
      let data = { templateName: templateName };

      loadPath(locationTypes.template, data);

      if (instanceName) {
        data["instanceName"] = instanceName;

        loadPath(locationTypes.instance, data);
      }
    }

    $(document).click(close);
  }

  propStructure = {
    name: "string",
    path: "string",
  };

  finalizeValue(f, settings) {
    let v = f.value;

    let path = getPath(v.locationType, settings);

    if (path) {
      v.path = path + "/" + v.name;
    }
  }
}

FieldEditorBase.register(FieldEditorImage, type, "Image");
