window.featureSlip.fieldEditors.Select = (function () {

    const template = '<div class="ui toggle select"><div class="ui selection dropdown"><i class="dropdown icon"></i><div class="text"></div><div class="menu"></div></div><button class="ui icon button settings"><i class="cog icon"></i></button></div>';

    const dialogTemplate = '<div class="select-settings-selector ui modal"><i class="close icon"></i><div class="header">Select</div><div class="content"><textarea></textarea></div><div class="actions"><div class="ui black deny button">Cancel</div></div></div>';

    function f(isSettings, options) {

        this.value = {
            options: [],
            selected: null
        };

        let that = this,
            $dom = $(template);


        let $select = this.$select = $dom.find(".selection");
        this.$selectMenu = $select.find(".menu");
        let $settingsButton = $dom.find("button.settings");

        if (!isSettings) {
            $settingsButton.hide();
        }

        $settingsButton.click(function (event) {
            event.stopPropagation();
            that.openSelector();
        });

        this.set$Dom($dom);

        f.superclass.init.apply(this, arguments);

        $select.dropdown({
            forceSelection: false,
            onChange: function (value, text, $selectedItem) {
                that.setValue({ selected: value });
            }
        });


    }
    featureSlip.utilities.extend(f, featureSlip.fieldEditors.Base);

    f.prototype.getValue = function () {
        return this.value;
    };

    f.prototype.setValue = function (v) {

        v = v || {};

        let $select = this.$select;
        let $selectMenu = this.$selectMenu;

        let options = v.options;
        let selected = v.selected;

        let value = this.value;

        if (options) {
            value.options = options;
        }
        if (typeof selected != "undefined") {
            value.selected = selected;
        }

        $select.dropdown({ values: value.options.map(v => { return { "name": v, "value": v, "selected": value.selected == v } }) });

    }

    f.prototype.openSelector = function () {

        let that = this,
            $dialog = $(dialogTemplate).appendTo("body");

        $dialog.modal('show');

        $dialog.click(function (event) { event.stopPropagation(); });

        let $textarea = $dialog.find("textarea");

        $textarea.val(this.value.options.join("\n"))
            .change(function () {
                that.setValue({ options: $textarea.val().split("\n").map(s => s.trim()).filter(s => s) });
            });

        function close() {

            $dialog.modal('hide', function () {
                $dialog.remove();
            });

        }

        $(document).click(close);

    };

    f.propStructure = {
        selected: "string"
    };

    window.featureSlip.fieldEditors.register(f, "select", "Select");

    return f;

}());