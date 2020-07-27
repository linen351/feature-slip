(function () {

    const allUserTypes = window.featureSlip.allUserTypes = [
        "watcher",
        "editor",
        "runner",
        "viewadmin",
        "admin"
    ];

    const userTypesToNumber = window.featureSlip.userTypesToNumber = allUserTypes.reduce(function (acc, v, index) {

        acc[v] = index;
        return acc;

    }, {});


    const userType = window.featureSlip.userType = (function () {

        let selectedEditorType = userTypesToNumber[location.pathname.split("/")[1]];

        if (selectedEditorType) {
            return selectedEditorType;
        }

        return 0;

    }());

    $("body").addClass("user-is-" + allUserTypes[userType]);

    let ns = window.featureSlip.common

    nsDef = ns.nsDef;

    nsDef.showMain = function () {

        let $root = this.$root;

        $root.siblings(".mainView").hide();

        $root.show();

    };


    (function () {

        function getSingleFieldsTable$Dom(data) {

            let $root = $('<table class="ui definition table"></table>');

            data.fields.forEach(function (field) {

                let $row = $("<tr></tr>").appendTo($root);

                $row.append("<td>" + field.name + "</td>");

                let $editorTd = $("<td></td>").appendTo($row);

                let editor = featureSlip.fieldEditors.getEditor(false, {
                    name: field.name,
                    type: field.type,
                    value: field.value,
                    templateName: data.templateName,
                    instanceName: data.instanceName,
                    viewName: data.viewName
                });

                $editorTd.append(editor.get$Dom());

            });

            return $root;

        }

        function singleFieldsTableToJson($view) {

            let fields = {};

            $view.find(".fieldEditor").each(function () {

                let editor = $(this).data("editor");

                fields[editor.getName()] = editor.getValue();

            });

            return fields;

        }

        function getFieldsMould$Dom(data, options) {

            options = options || {};

            const fieldOrigIndexCssClass = "field-orig-index-";

            let onlyValuesChangable = options.onlyValuesChangable;

            let $root = $('<table class="ui definition table"></table>');

            let templateName = data.templateName;
            let instanceName = data.instanceName;
            let viewName = data.viewName;

            data.fields.forEach(function (field, index) {

                let name = field.name;
                let type = field.type;
                let value = field.value;

                let $field = $('<tr class="field ' + fieldOrigIndexCssClass + index + '" ' + (onlyValuesChangable ? '' : ' draggable="true"') + '></tr>').appendTo($root);

                $field.on("dragstart", function (ev) {
                    let originalEv = ev.originalEvent;
                    originalEv.dropEffect = "move";
                    originalEv.dataTransfer.setData("text", index);
                });

                $field.on("dragover", function (ev) {
                    ev.preventDefault();
                });

                $field.on("drop", function (ev) {

                    let originalEv = ev.originalEvent;

                    originalEv.preventDefault();

                    let $droppedField = $root.find('.field.' + fieldOrigIndexCssClass + originalEv.dataTransfer.getData("text"));
                    if ($droppedField.length) {

                        let $target = $(originalEv.currentTarget);

                        if ($root.get(0) === $target.closest("table").get(0)) {

                            $(originalEv.currentTarget).after($droppedField);

                        }
                    }

                });


                let $nameInput = $('<td class="name"><div class="ui input"><input type="text" value="' + name + '"' + (onlyValuesChangable ? " disabled" : "") + ' /></div></td>').appendTo($field).find("input");

                $nameInput.on("change", function () {

                    let val = $nameInput.val().trim();

                    while (/[\<\>\:\"\/\\\|\?\*]/.test(val)) {
                        val = prompt("Only chars and digits", val) || "";
                    }

                    $nameInput.val(val);

                });


                let $typeSelector = $('<td class="type"><select class="ui dropdown"' + (onlyValuesChangable ? " disabled" : "") + '></select></td>').appendTo($field).find("select");

                let availableFieldEditors = featureSlip.fieldEditors.byType;

                for (let availableType in availableFieldEditors) {

                    let editor = availableFieldEditors[availableType];

                    $typeSelector.append('<option value="' + availableType + '"' + (type == availableType ? ' selected' : '') + '>' + editor.label + '</option>');

                };

                $typeSelector.dropdown({});

                let $editorWrapper = $("<td></td>").appendTo($field);

                let editor = featureSlip.fieldEditors.getEditor(true, {
                    name: name,
                    type: type,
                    value: value,
                    templateName: templateName,
                    instanceName: instanceName,
                    viewName: viewName
                });

                $editorWrapper.append(editor.get$Dom());

                let $buttonRibbon = $('<td class="buttons"><div class="ui icon buttons"></div></td>').appendTo($field).find(".buttons");

                $buttonRibbon.append('<button class="ui button deleteField"' + (onlyValuesChangable ? " disabled" : "") + '><i class="trash icon"></i></button>');
                $buttonRibbon.append('<button class="ui button moveDown"' + (onlyValuesChangable ? " disabled" : "") + '><i class="sort down icon"></i></button>');
                $buttonRibbon.append('<button class="ui button moveUp"' + (onlyValuesChangable ? " disabled" : "") + '><i class="sort up icon"></i></button>');

            });

            return $root;

        }

        function fieldsMouldToJson($view) {

            let fields = [];

            $view.find(".field").each(function () {

                let $item = $(this),
                    name = $item.find(".name input").val(),
                    type = $item.find(".type :selected").val(),
                    editor = $item.find(".fieldEditor").data("editor");

                fields.push({
                    name: name,
                    type: type,
                    value: editor.getValue()
                });
            })

            return fields;

        }


        function addButtonRibbon($parentRow, group, additionalClass) {

            let $buttonRibbon = $('<td><div class="ui icon buttons ' + additionalClass + '"></div></td>').appendTo($parentRow).find('div');

            for (let keyClass in group) {
                $buttonRibbon.append('<a class="ui button ' + keyClass + '"><i class="' + group[keyClass] + ' icon"></i></a>');
            }

        }

        function getInstancesEditTable$Dom(data) {

            const buttonsGroup1 = {
                startIn: "play",
                startRefresh: "redo refresh",
                startOut: "stop"
            };

            const buttonsGroup2 = {
                rename: "edit",
                delete: "trash"
            };

            let instances = data.instances;

            if (0 < instances.length) {

                let templateName = data.templateName;
                let viewName = data.viewName;

                let $root = $('<table class="ui definition table"></table>');

                let theadHtml = "";
                theadHtml += "<thead>";
                theadHtml += "  <tr>";
                theadHtml += "    <th></th>";
                theadHtml += "    <th></th>";
                instances[0].fields.forEach(function (field) {
                    theadHtml += "    <th>" + field.name + "</th>";
                });
                theadHtml += "    <th></th>";
                theadHtml += "  </tr>";
                theadHtml += "</thead>";

                $root.append(theadHtml);

                let $tbody = $("<tbody></tbody").appendTo($root)

                instances.forEach(function (instance) {

                    let instanceName = instance.instanceName;

                    let $row = $('<tr class="instance" data-instancename="' + instanceName + '"></tr>').appendTo($tbody);

                    $row.append('<td class="name">' + instanceName + '</td>');

                    addButtonRibbon($row, buttonsGroup1, "user-runner-show");

                    instance.fields.forEach(function (field) {

                        let $td = $("<td></td>").appendTo($row);

                        let editor = featureSlip.fieldEditors.getEditor(false, {
                            name: field.name,
                            type: field.type,
                            value: field.value,
                            templateName: templateName,
                            instanceName: instanceName,
                            viewName: viewName
                        });

                        $td.append(editor.get$Dom());

                    });

                    addButtonRibbon($row, buttonsGroup2, "user-editor-show");

                });

                return $root;

            }

            return $("<div></div>");

        }

        function multilineFieldsTableToJson($view) {

            function instance$ToJson($instance) {

                let result = {
                    instanceName: $instance.data("instancename"),
                    fields: singleFieldsTableToJson($instance)
                };

                return result;

            }

            let result = [];

            $view.find("tbody tr").each(function () {
                result.push(instance$ToJson($(this)));
            });

            return result;

        }

        function getSelectList$Dom(data, allowAdd) {

            return $(selectListTemplate(data));

        }

        function getItems$Dom(data) {
            return $(itemsTemplate(data));
        }

        function itemsToJson($root) {

            let result = [];

            $root.find("tr").each(function () {

                let $row = $(this);

                result.push({
                    id: $row.data("id"),
                    viewName: $row.data("viewname"),
                    templateName: $row.data("templatename"),
                    instanceName: $row.data("instancename")
                });

            });

            return result;

        }


        function getInstancePlayer$Dom(data) {

            return $(instancePlayerTemplate(data));

        }


        function getPropsFromItem($item) {

            return {
                id: $item.data("id"),
                viewName: $item.data("viewname"),
                templateName: $item.data("templatename"),
                instanceName: $item.data("instancename")
            };

        }


        function getClickedEventHandler(callback, additionalPropsCallback) {

            return function ($clicked) {

                let $target = $clicked.closest("tr");

                if (!$target.length) {
                    $target = $clicked;
                }

                let props = getPropsFromItem($target);

                additionalPropsCallback(props);

                callback(props);

            };

        }


        let itemsHtml = $(".handlebars-items-template").html();

        Handlebars.registerPartial('items', itemsHtml)

        let selectListTemplate = Handlebars.compile($(".handlebars-list-template").html()),
            itemsTemplate = Handlebars.compile(itemsHtml),
            instancePlayerTemplate = Handlebars.compile($(".handlebars-instance-player-template").html())


        ns.handlebarTemplates = {

            fieldsMould: {

                get$Dom: getFieldsMould$Dom,
                getJson: fieldsMouldToJson

            },

            singleFieldsTable: {

                get$Dom: getSingleFieldsTable$Dom,
                getJson: singleFieldsTableToJson

            },

            instancesEditTable: {

                get$Dom: getInstancesEditTable$Dom,
                getJson: multilineFieldsTableToJson

            },

            selectList: {
                get$Dom: getSelectList$Dom
            },

            items: {
                get$Dom: getItems$Dom,
                getClickedEventHandler: getClickedEventHandler,
                getJson: itemsToJson

            },

            instancePlayer: {
                get$Dom: getInstancePlayer$Dom
            }

        };

    }());

    return ns;

}());