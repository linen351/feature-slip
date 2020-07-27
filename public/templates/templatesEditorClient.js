window.featureSlip.templates = window.featureSlip.templates || {};

window.featureSlip.templates.editor = (function () {

    const editorTheme = "ace/theme/monokai";

    let ns = featureSlip.common.initDefNs("templatesEditor"),

        loadedTemplateName,

        currentSettings = {},

        $settingsEditorConstantsContent,
        $settingsInstanceFieldsMouldContent,

        $fieldSelect,
        $fieldSelectMenu,

        settingEditors = {
            templateSettings: "templateSettings",
            instanceFieldsMould: "instanceFieldsMould",
            templateConstants: "templateConstants"
        },

        $settingsContents = {},

        allEditors = [],
        htmlEditor,
        cssEditor,
        codeEditor,

        latestUsedEditor;

    function getFieldToTextFunc(start, end, separator, wrapFunc) {

        wrapFunc = wrapFunc || function (v) { return v; }

        return function (field) {

            let r = start + field.path.join(separator) + end;

            if (featureSlip.fieldEditors.requiresLiteralWrap.includes(field.type)) {
                r = wrapFunc(r);
            }

            return r;
        };

    }

    const fieldToText = {
        "ace/mode/html": getFieldToTextFunc("{{", "}}", "."),
        "ace/mode/scss": getFieldToTextFunc("$", "", "-", function (v) { return "#{" + v + "}"; }),
        "ace/mode/javascript": getFieldToTextFunc("", "", ".")
    };


    ns.init = function () {

        let $root = ns.$root;

        let $settingsEditorRoot = $root.find(".settings"),

            $settingEditors = {},

            $htmlEditorRoot = $root.find(".html"),
            $cssEditorRoot = $root.find(".css"),
            $codeEditorRoot = $root.find(".code"),

            $htmlEditorContent = $htmlEditorRoot.find(".content"),
            $cssEditorContent = $cssEditorRoot.find(".content"),
            $codeEditorContent = $codeEditorRoot.find(".content");

        $fieldSelect = $root.find(".field-select");
        $fieldSelectMenu = $fieldSelect.find(".menu");

        for (let key in settingEditors) {

            let $settingsRoot = $settingEditors[key] = $settingsEditorRoot.find("." + key);

            $settingsContents[key] = $settingsRoot.find(".content");

            if (key != settingEditors.templateSettings) {

                (function (k) {

                    $settingsRoot.find(".add").click(function () {

                        refreshCurrentSettingsFromGui()

                        currentSettings[k] = currentSettings[k] || [];

                        currentSettings[k].push({ name: "", type: "string", value: "" });

                        redrawSettingsEditor();

                    });

                }(key));
            }

        }

        htmlEditor = ace.edit($htmlEditorContent.get(0));
        htmlEditor.session.setMode("ace/mode/html");
        allEditors.push(htmlEditor);

        cssEditor = ace.edit($cssEditorContent.get(0));
        cssEditor.session.setMode("ace/mode/scss");
        allEditors.push(cssEditor);

        codeEditor = ace.edit($codeEditorContent.get(0));
        codeEditor.session.setMode("ace/mode/javascript");
        allEditors.push(codeEditor);

        allEditors.forEach(function (editor) {
            editor.setTheme(editorTheme);
            editor.on("focus", function () {
                latestUsedEditor = editor;
            });
        });

        $fieldSelect.dropdown({
            forceSelection: false,
            onChange: function (value, text, $selectedItem) {

                if ($selectedItem) {

                    if (latestUsedEditor) {

                        let selection = latestUsedEditor.getSelectionRange(),
                            selectionStart = selection.start,
                            selectionEnd = selection.end;

                        if (selectionStart.row === selectionEnd.row) {

                            let field = $selectedItem.data("field");

                            latestUsedEditor.insert(fieldToText[latestUsedEditor.session.getMode().$id](field));
                        }

                    }

                    $fieldSelect.dropdown("clear");

                }

            }
        });

    };


    ns.incomingHandlers = {

        warning: function (data) {
            alert(data);
        },

        loaded: function (data) {

            loadedTemplateName = data.templateName;

            currentSettings = data.settings ? data.settings : {};

            htmlEditor.setValue(data.html);
            cssEditor.setValue(data.css);
            codeEditor.setValue(data.code);

            redrawSettingsEditor();

            $fieldSelectMenu.empty();


            let templateSettings = [];

            featureSlip.utilities.fieldList.addRange([
                { name: "templateName", type: "string" },
                { name: "instanceName", type: "string" }
            ], templateSettings);

            featureSlip.utilities.fieldList.addRange(currentSettings.instanceFieldsMould, templateSettings);
            featureSlip.utilities.fieldList.addRange(currentSettings.templateSettings, templateSettings);
            featureSlip.utilities.fieldList.addRange(currentSettings.templateConstants, templateSettings);

            let viewSettings = [];

            featureSlip.utilities.fieldList.addRange(data.viewFieldsMould, viewSettings);
            
            featureSlip.utilities.fieldList.addRange([
                { name: "viewName", type: "string" }
            ], viewSettings);


            let fieldGroups = {
                template: templateSettings,
                instance: templateSettings,
                view: viewSettings,
                system: data.systemSettings
            };

            function addFieldItemRecursive($target, path, left) {

                if (typeof left == "object") {

                    for (let key in left) {
                        addFieldItemRecursive($target, path.concat([key]), left[key]);
                    }

                } else {

                    $('<div class="item">' + path.slice(1).join("-") + '</div>')
                        .appendTo($target)
                        .data("field", { path: path, type: left });

                }

            }

            for (let groupKey in fieldGroups) {

                $('<div class="header">' + groupKey + '</div><div class="divider"></div>').appendTo($fieldSelectMenu);

                fieldGroups[groupKey].forEach(function (field) {

                    let propStructure = window.featureSlip.fieldEditors.getEditorClass(field.type).propStructure;

                    addFieldItemRecursive(
                        $fieldSelectMenu,
                        [groupKey, field.name],
                        propStructure
                    );

                });

            }


            let $templatesAndInstances = $("#templatesAndInstances");

            $templatesAndInstances.show();

            $templatesAndInstances.find(".template-name").html(loadedTemplateName);

        }

    };

    function resizeAllEditors() {

        allEditors.forEach(function (editor) {
            editor.resize();
        });

    }


    function noIllegalUnits(text, type) {

        // const illegalUnitRegex = /[0-9]+\s?(px|cm|mm|in|pt|pc)($|[^A-z]+)/;

        const illegalDomLookup = /document\.getElement[^\)]+\)/;

        const illegalHashLookup = /#([^\s\n\r"';$]+)(\s|\n|\r|"|'|;|$)/g;

        const acceptableHashValueLookup = /^[0-9A-Fa-f]{3,6}$|^{/;

        // let unitResult = illegalUnitRegex.exec(text);

        // if (unitResult) {   

        //     alert("Don't use absolut units such as \"" + unitResult[1] + "\" in " + type + ". Scaling will not work. Use rem or em or % instead. 1px = 1rem. Did not save.");
        //     return false;

        // }

        let domResult = illegalDomLookup.exec(text);

        if (domResult) {

            alert("Don't use absolut lookups such as \"" + domResult[0] + "\" in " + type + ". Isolation between templates will not work. Did not save.");
            return false;
            
        }

        let hashResult;

        while (hashResult = illegalHashLookup.exec(text)) {

            let hashValue = hashResult[1];

            if (!acceptableHashValueLookup.test(hashValue)) {
                alert("Don't use absolut lookups and ids such as \"#" + hashValue + "\" in " + type + ". Isolation between templates will not work. Did not save.");
                return false;
            }
        }

        return true;

    }


    ns.clickHandlers = {

        moveUp: function ($clicked, event) {

            let $item = $clicked.closest(".field");
            $item.prev().before($item);

        },

        moveDown: function ($clicked, event) {

            let $item = $clicked.closest(".field");
            $item.next().after($item);

        },

        deleteField: function ($clicked, event) {

            $clicked.closest(".field").remove();

        },

        rename: function ($clicked, event) {

            let name = prompt("Give me a new Name", loadedTemplateName);

            if (name) {
                ns.sendToServer("rename", {
                    oldTemplateName: loadedTemplateName,
                    newTemplateName: name
                });
            }

        },

        delete: function ($clicked, event) {

            if (confirm("Are you sure?")) {
                ns.sendToServer("delete", { templateName: loadedTemplateName });
            }

        },

        save: function ($clicked, event) {

            let html = htmlEditor.getValue(),
                css = cssEditor.getValue(),
                code = codeEditor.getValue();

            if (
                noIllegalUnits(html, "HTML") &&
                noIllegalUnits(css, "SCSS") &&
                noIllegalUnits(code, "JS")
            ) {

                refreshCurrentSettingsFromGui();
                save("settings", currentSettings);
                redrawSettingsEditor()

                save("html", html);
                save("css", css);
                save("code", code);

            }

        },

        expand: function ($clicked, event) {

            let $editor = $clicked.closest(".editor");

            $editor.addClass("selected-editor");

            ns.$root.addClass("single-editor");

            resizeAllEditors();

        },

        contract: function ($clicked, event) {

            ns.$root.removeClass("single-editor");

            ns.$root.find(".editor").removeClass("selected-editor");

            resizeAllEditors();

        }

    };


    ns.load = function (templateName, includeAllInstances) {

        ns.clear();

        ns.sendToServer("load", {
            templateName: templateName,
            includeAllInstances: includeAllInstances
        });

    };


    ns.clear = function () {

        loadedTemplateName = null;

        currentSettings = {};

        for (let key in $settingsContents) {
            $settingsContents[key].empty();
        }

        htmlEditor.setValue("");
        cssEditor.setValue("");
        codeEditor.setValue("");

    };


    function refreshCurrentSettingsFromGui() {

        for (let settingsEditorKey in $settingsContents) {

            let $content = $settingsContents[settingsEditorKey];

            let fields = featureSlip.common.handlebarTemplates.fieldsMould.getJson($content);

            currentSettings[settingsEditorKey] = fields;
        }

    }

    function redrawSettingsEditor() {

        for (let settingsEditorKey in $settingsContents) {

            let $content = $settingsContents[settingsEditorKey];

            let data = {
                templateName: loadedTemplateName,
                fields: currentSettings[settingsEditorKey] || []
            };

            let $dom = featureSlip.common.handlebarTemplates.fieldsMould.get$Dom(data, {
                onlyValuesChangable: settingsEditorKey == settingEditors.templateSettings
            });

            $content.html($dom);

        }

    }

    function save(what, data) {

        ns.sendToServer("save", {
            templateName: loadedTemplateName,
            what: what,
            data: data
        });

    }

    return ns;

}());