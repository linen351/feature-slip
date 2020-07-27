window.featureSlip = window.featureSlip || {};

window.sass = new Sass();

const cssValueIsTextualRegex = /^(#[A-F0-9]+)|[0-9]+(\w{0,2})$/;

const allHtmlColorsRegex = /(#(?:[0-9a-f]{2}){2,4}|(#[0-9a-f]{3})|(rgb|hsl)a?\((-?\d+%?[,\s]+){2,3}\s*[\d\.]+%?\)|black|silver|gray|whitesmoke|maroon|red|purple|fuchsia|green|lime|olivedrab|yellow|navy|blue|teal|aquamarine|orange|aliceblue|antiquewhite|aqua|azure|beige|bisque|blanchedalmond|blueviolet|brown|burlywood|cadetblue|chartreuse|chocolate|coral|cornflowerblue|cornsilk|crimson|darkblue|darkcyan|darkgoldenrod|darkgray|darkgreen|darkgrey|darkkhaki|darkmagenta|darkolivegreen|darkorange|darkorchid|darkred|darksalmon|darkseagreen|darkslateblue|darkslategray|darkslategrey|darkturquoise|darkviolet|deeppink|deepskyblue|dimgray|dimgrey|dodgerblue|firebrick|floralwhite|forestgreen|gainsboro|ghostwhite|goldenrod|gold|greenyellow|grey|honeydew|hotpink|indianred|indigo|ivory|khaki|lavenderblush|lavender|lawngreen|lemonchiffon|lightblue|lightcoral|lightcyan|lightgoldenrodyellow|lightgray|lightgreen|lightgrey|lightpink|lightsalmon|lightseagreen|lightskyblue|lightslategray|lightslategrey|lightsteelblue|lightyellow|limegreen|linen|mediumaquamarine|mediumblue|mediumorchid|mediumpurple|mediumseagreen|mediumslateblue|mediumspringgreen|mediumturquoise|mediumvioletred|midnightblue|mintcream|mistyrose|moccasin|navajowhite|oldlace|olive|orangered|orchid|palegoldenrod|palegreen|paleturquoise|palevioletred|papayawhip|peachpuff|peru|pink|plum|powderblue|rosybrown|royalblue|saddlebrown|salmon|sandybrown|seagreen|seashell|sienna|skyblue|slateblue|slategray|slategrey|snow|springgreen|steelblue|tan|thistle|tomato|turquoise|violet|wheat|white|yellowgreen|rebeccapurple)\b/ig;

const viewModesEnum = {
    normal: "normal",
    mask: "mask",
    masked: "masked"
};

let $sharedRoot;

window.featureSlip.viewer = (function () {

    let ns = featureSlip.common.initDefNs("viewer"),

        loadedViewName,

        viewSettings,
        viewSettingsAsDict,

        viewerScale,
        viewerGraceMargin,
        viewerWidth,
        viewerHeight,
        viewerStageWidth,
        viewerStageHeight,
        viewerStageOffsetX,
        viewerStageOffsetY,

        viewerUseModes = [],

        systemSettings,

        templateSettingsByTemplateName = {},
        templateHtmlByTemplateName = {},
        templateCssByTemplateName = {},
        templateCodeByTemplateName = {},

        runningInstancesByInstanceNameByTemplateName = {};

    const instanceModes = {
        "created": 1,
        "init": 2,
        "inited": 3,
        "ining": 4,
        "showing": 5,
        "outing": 6
    };


    ns.init = function () {

        let query = location.search;
        loadedViewName = decodeURIComponent(query.substr(query.indexOf("=") + 1));

        $("body").find("title").html("Viewer " + loadedViewName);

        viewPath = "/viewer/" + loadedViewName + "/";

        ns.sendToServer("loadSystemSettings");

        ns.sendToServer("loadViewSettings", {
            viewName: loadedViewName
        });

        ns.sendToServer("loadAllTemplatesForView", {
            viewName: loadedViewName
        });

    };


    ns.incomingHandlers = {

        warning: function (data) {
            alert(data);
        },

        loaded: function (data) {

            if (data.systemSettings) {

                setSystemSettings(data.systemSettings);

            }

            if (loadedViewName != data.viewName) {
                return;
            }

            if (data.viewSettings) {

                setViewSettings(data.viewSettings);

            }

            if (data.templates) {

                setTemplateDatas(data.templates);

            }

            if (data.template) {

                setTemplateData(data.template);

            }

        },

        startIn: startIn,

        startOut: startOut

    };


    ns.clickHandlers = {


    };


    ns.setCloseCallback = function (callback) {

        $(window).on("beforeunload", callback);

    };

    function setViewSettings(settings) {

        settings.push({
            name: "viewName",
            type: "string",
            value: loadedViewName
        });

        viewSettings = settings;

        viewSettingsAsDict = featureSlip.utilities.fieldList.toDict(viewSettings);
        viewerScale = viewSettingsAsDict.scale / 100;
        viewerGraceMargin = viewSettingsAsDict.graceMargin,
            viewerWidth = viewSettingsAsDict.viewerWidth;
        viewerHeight = viewSettingsAsDict.viewerHeight;
        viewerStageWidth = (viewSettingsAsDict.stageWidth || viewerWidth);
        viewerStageHeight = (viewSettingsAsDict.stageHeight || viewerHeight);
        viewerStageOffsetX = -viewSettingsAsDict.offsetX;
        viewerStageOffsetY = -viewSettingsAsDict.offsetY;

        let viewerShowMask = viewSettingsAsDict.showMask;
        let viewerShowMasked = viewSettingsAsDict.showMasked;
        let verticalWhenBothMaskAndMasked = viewSettingsAsDict.verticalWhenBothMaskAndMasked;
        let chromaColor = viewSettingsAsDict.chroma;

        viewerUseModes.length = 0;

        if (viewerShowMask || viewerShowMasked) {
            if (viewerShowMask) {
                viewerUseModes.push(viewModesEnum.mask);
            }
            if (viewerShowMasked) {
                viewerUseModes.push(viewModesEnum.masked);
            }
        } else {
            viewerUseModes.push(viewModesEnum.normal);
        }

        let $body = $("body"),
            $viewerWindow = $body.find(".viewer-window"),
            $views = $viewerWindow.find(".views");

        if (viewerScale && viewerScale != 1) {
            $viewerWindow.css("transform", "scale(" + viewerScale + ")");
        }

        if (verticalWhenBothMaskAndMasked) {
            $body.addClass("stack-vertical");
        } else {
            $body.removeClass("stack-vertical");
        }

        $body[(viewSettingsAsDict.showBorders ? "addClass" : "removeClass")]("show-borders");

        $viewerWindow.css({
            width: (viewerWidth + 2 * viewerGraceMargin) * (verticalWhenBothMaskAndMasked ? 1 : viewerUseModes.length),
            height: (viewerHeight + 2 * viewerGraceMargin) * (verticalWhenBothMaskAndMasked ? viewerUseModes.length : 1)
        });

        $views.empty();
        viewerUseModes.forEach(function (viewModeKey) {
            $views.append('<div class="view ' + viewModeKey + '" style="background-color: ' + (viewModeKey == viewModesEnum.mask ? "FFF" : chromaColor) + '; padding: ' + viewerGraceMargin + 'px; width: ' + viewerWidth + 'px; height: ' + viewerHeight + 'px;">' +
                '<div class="debug-border"><div class="outer"></div><div class="inner"></div></div>' +
                '<div class="view__hole" style="width: ' + viewerWidth + 'px; height: ' + viewerHeight + 'px;">' +
                '<div class="view__stage" style="left: ' + viewerStageOffsetX + 'px; top: ' + viewerStageOffsetY + 'px; width: ' + viewerStageWidth + 'px; height: ' + viewerStageHeight + 'px;">' +
                '<div class="instance instance_shared">' +
                '</div>' +
                '</div>' +
                '</div>' +
                '</div>'
            );
        });

        $sharedRoot = $views.find(".instance_shared");

    }

    function setSystemSettings(data) {

        systemSettings = data;

    }

    function setTemplateDatas(datas) {

        datas.forEach(setTemplateData);

    }

    function setTemplateData(data) {

        let templateName = data.templateName,
            templateSettings = data.settings;

        if (mergeTemplateSettings(templateSettings).some(function (f) { return f.name == "active" && f.value; })) {

            setTemplateSettings(templateName, data.settings);

            setTemplateHtml(templateName, data.html);

            setTemplateCss(templateName, data.css);

            setTemplateCode(templateName, data.code);

        } else {

            // clearTemplateSettings(templateName);

            // clearTemplateHtml(templateName);

            // clearTemplateCss(templateName);

            // clearTemplateCode(templateName);

        }

    }

    function setTemplateSettings(templateName, settings) {

        templateSettingsByTemplateName[templateName] = settings;

    }

    function setTemplateHtml(templateName, html) {

        templateHtmlByTemplateName[templateName] = html;

    }

    function setTemplateCss(templateName, css) {

        templateCssByTemplateName[templateName] = css;

    }

    function setTemplateCode(templateName, code) {

        templateCodeByTemplateName[templateName] = new Function(code)();

    }

    function clearTemplateSettings(templateName) {

        delete templateSettingsByTemplateName[templateName];

    }

    function clearTemplateHtml(templateName) {

        delete templateHtmlByTemplateName[templateName];

    }

    function clearTemplateCss(templateName) {

        delete templateCssByTemplateName[templateName];

    }

    function clearTemplateCode(templateName) {

        delete templateCodeByTemplateName[templateName];

    }


    function settingsToSass(value, path) {

        path = path || "$";

        let variables = "";

        if (value) {

            if (typeof value == "object") {

                for (let key in value) {

                    variables += settingsToSass(value[key], path + (path == "$" ? "" : "-") + key);

                }

            } else {

                if (!cssValueIsTextualRegex.test(value)) {
                    value = "'" + value + "'";
                }

                variables += path + ": " + value + ";\n";

            }

        }


        return variables;

    }

    function mergeTemplateSettings(templateSettings, target) {

        target = target || [];

        featureSlip.utilities.fieldList.addRange(templateSettings.templateSettings, target);
        featureSlip.utilities.fieldList.addRange(templateSettings.templateConstants, target);

        return target;

    }

    function startIn(inData) {

        let targetedViewName = inData.viewName;

        if (targetedViewName && loadedViewName != targetedViewName) {
            return;
        }


        let templateName = inData.templateName,
            instanceName = inData.instanceName,
            templateSettings = templateSettingsByTemplateName[templateName],
            instanceSettings = inData.instanceSettings,
            force = inData.force;

        if (!templateSettings) {
            console.warn('Not active template "' + templateName + '"');
            return;
        }

        let mergedTemplateSettings = [];

        mergeTemplateSettings(templateSettings, mergedTemplateSettings);

        featureSlip.utilities.fieldList.addRange(instanceSettings, mergedTemplateSettings);
        featureSlip.utilities.fieldList.addRange([
            { name: "templateName", type: "string", value: templateName },
            { name: "instanceName", type: "string", value: instanceName }
        ], mergedTemplateSettings);

        let propsForFinalizing = {
            templateName: templateName,
            instanceName: instanceName,
            viewName: loadedViewName
        };
        mergedTemplateSettings.forEach(function (f) {

            let editorClass = featureSlip.fieldEditors.getEditorClass(f.type);
            editorClass.finalizeValue(f, propsForFinalizing);

        });

        let mergedTemplateSettingsAsDict = featureSlip.utilities.fieldList.toDict(mergedTemplateSettings);

        let noOverlap = mergedTemplateSettingsAsDict.noOverlap;

        let instanceToShowIsCurrentlyExisting = getCurrentlyExisting(templateName, instanceName);

        let startOutArgs = null;

        if (instanceToShowIsCurrentlyExisting && !force) {

            return;

        } else {

            if (mergedTemplateSettingsAsDict.singleOnStage) {

                startOutArgs = {
                };

            } else if (mergedTemplateSettingsAsDict.singleTemplateOnStage) {

                startOutArgs = {
                    templateName: templateName
                };

            } else {

                startOutArgs = {
                    templateName: templateName,
                    instanceName: instanceName
                };

            }
        }

        if (instanceToShowIsCurrentlyExisting && force) {
            noOverlap = true;
        }

        let allSettingsDataAsDict = {
            template: mergedTemplateSettingsAsDict,
            view: featureSlip.utilities.fieldList.toDict(viewSettings),
            system: featureSlip.utilities.fieldList.toDict(systemSettings)
        };

        let allIsDone = featureSlip.utilities.AllIsDoneMultiplexer({
            parentCallbacks: [function () {

                createInstance(templateName, instanceName, allSettingsDataAsDict, function () {
                    actuallyStartIn(templateName, instanceName, mergedTemplateSettingsAsDict);
                });

            }]
        });

        if (startOutArgs) {

            let outCallback = noOverlap ? allIsDone.getChildCallback() : null;

            startOut(startOutArgs, outCallback);

        }

        allIsDone.arm();

    }

    function isCurrentlyExisting(templateName, instanceName) {
        return getCurrentlyExisting(templateName, instanceName);
    }

    function getCurrentlyExisting(templateName, instanceName) {
        runningInstancesByInstanceNameByTemplateName[templateName] = runningInstancesByInstanceNameByTemplateName[templateName] || {};
        return runningInstancesByInstanceNameByTemplateName[templateName][instanceName];
    }

    function actuallyStartIn(templateName, instanceName, instanceSettingAsDict) {

        let instance = getCurrentlyExisting(templateName, instanceName);

        if (!instance) {
            return;
        }
        instance.setMode(instanceModes.ining);

        let callHasBeenMade = false;

        function doneStartInCallback() {
            if (callHasBeenMade) {
                return;
            }
            callHasBeenMade = true;
            instance.setMode(instanceModes.showing);
        }

        let returnedStartInCallback = instance.startIn(doneStartInCallback, instanceSettingAsDict);

        if (returnedStartInCallback !== doneStartInCallback) {
            doneStartInCallback();
        }

    }

    function nameToCssClass(prefix, name) {
        return prefix + "_" + name.replace(/\s/g, "_");
    }

    function createInstance(templateName, instanceName, allSettingsData, createdCallback) {

        if (isCurrentlyExisting(templateName, instanceName)) {

            console.log("Template " + templateName + " instance " + instanceName + " already existing.");
            return;
        }

        let createdInstance = runningInstancesByInstanceNameByTemplateName[templateName][instanceName] = templateCodeByTemplateName[templateName].instantiate(allSettingsData, templateName, instanceName);
        createdInstance.setMode(instanceModes.created);

        let randomId = "instance_" + Math.random().toString().substring(2);

        let rawHtml = Handlebars.compile(templateHtmlByTemplateName[templateName])(allSettingsData);

        let templateCssClass = nameToCssClass("template", templateName);

        let htmlWrap = '<div class="instance ' + randomId + ' ' + templateCssClass + ' ' + nameToCssClass('instance', instanceName) + '">';
        htmlWrap += rawHtml;
        htmlWrap += '</div>';

        let rawSass = settingsToSass(allSettingsData) + templateCssByTemplateName[templateName];

        let sassWrap = ".viewer-window { > .views { > .view { > .view__hole { > .view__stage { > .instance." + randomId + '{';

        sassWrap += "display: block;";

        sassWrap += rawSass;

        sassWrap += '} } } } } }';

        sass.compile(sassWrap, function (step2CssData) {

            if (step2CssData.status) {

                delete runningInstancesByInstanceNameByTemplateName[templateName][instanceName];
                console.warn("Scss failed to parse " + step2CssData.message);
                return;
            }

            let cssWrap = '<style>' + step2CssData.text + '</style>';

            addToInstanceAndDocument(createdInstance, randomId, htmlWrap, cssWrap, templateCssClass, createdCallback);

        });

    }

    function addToInstanceAndDocument(createdInstance, randomId, html, css, templateCssClass, createdCallback) {

        if (createdInstance.getMode() !== instanceModes.created) {
            console.log("already added");
            return;
        }

        let $html = $();
        let $css = $(css);

        viewerUseModes.forEach(function () {
            $html = $html.add(html);
        });

        createdInstance.set$Css($css);
        createdInstance.set$InstanceDom($html);


        let $stages = $("body .views .view .view__hole .view__stage");

        let sharedTemplateCssClass = `.instance.instance_template_shared.${templateCssClass}`;

        if ($stages.find(sharedTemplateCssClass).length === 0) {
            $stages.append(`<div class="instance instance_template_shared ${templateCssClass}"></div>`);
        }

        createdInstance.set$TemplateDom($stages.find(sharedTemplateCssClass));


        let callHasBeenMade = false;
        function doneInitCallback() {
            if (callHasBeenMade) {
                return;
            }
            callHasBeenMade = true;
            createdInstance.setMode(instanceModes.inited);
        }

        createdInstance.setMode(instanceModes.init);
        let returnedInitCallback = createdInstance.init(doneInitCallback);

        if (returnedInitCallback !== doneInitCallback) {
            doneInitCallback();
        }

        $("head").append($css);
        $stages.each(function (index) {
            $(this).append($html.eq(index));
        });

        let maxTries = 100;
        let loadedTimer = window.setInterval(function () {

            let found = Array
                .from(document.styleSheets)
                .some(function (stylesheet) {
                    if (stylesheet.href) {
                        return false;
                    }
                    return Array
                        .from(stylesheet.rules)
                        .some(function (rule) {
                            return rule.selectorText.indexOf("." + randomId) != -1;
                        });
                });

            if (!maxTries || found) {

                window.clearInterval(loadedTimer);

                if (found) {
                    createdCallback();
                } else {
                    console.error("Css failed to load");
                }

            }

            maxTries--;

        }, 10);

    }

    function startOut(options, doneCallback) {

        doneCallback = doneCallback || function () { };

        let allIsDone = featureSlip.utilities.AllIsDoneMultiplexer({ parentCallbacks: [doneCallback] });

        let targetedViewName = options.viewName;

        if (targetedViewName && loadedViewName != targetedViewName) {
            return;
        }

        let inTemplateName = options.templateName,
            inInstanceName = options.instanceName;

        for (let templateName in runningInstancesByInstanceNameByTemplateName) {

            if (!inTemplateName || templateName == inTemplateName) {

                let runningInstancesByInstanceName = runningInstancesByInstanceNameByTemplateName[templateName] || {};

                for (let instanceName in runningInstancesByInstanceName) {

                    if (!inInstanceName || instanceName == inInstanceName) {

                        (function (instanceNameToOut) {

                            let instance = runningInstancesByInstanceName[instanceNameToOut];

                            if (instance.getMode() === instanceModes.showing) {

                                let $dom = instance.get$InstanceDom(),
                                    $css = instance.get$Css(),
                                    childCallback = allIsDone.getChildCallback();

                                instance.setMode(instanceModes.outing);

                                let callHasBeenMade = false;
                                function thisOutDoneCallback() {

                                    if (callHasBeenMade) {
                                        return;
                                    }

                                    callHasBeenMade = true;

                                    $dom.remove();
                                    $css.remove();
                                    delete runningInstancesByInstanceName[instanceName];

                                    childCallback();

                                }

                                let returnedCallback = instance.startOut(thisOutDoneCallback);

                                if (returnedCallback !== thisOutDoneCallback) {
                                    thisOutDoneCallback();
                                }

                            }

                        }(instanceName))

                    }

                }

            }

        }

        allIsDone.arm();

    }

    return ns;

}());

$(document).ready(function () {
    featureSlip.init();
});
