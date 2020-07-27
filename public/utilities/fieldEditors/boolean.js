window.featureSlip.fieldEditors.Boolean = (function() {

    const template = '<div class="ui toggle checkbox"><input type="checkbox" /><label></label></div>';

    function f(isSettings, options) {

        let $dom = $(template);

        this.$checkbox = $dom.find("input");

        this.set$Dom($dom);

        f.superclass.init.apply(this, arguments);   
        
    }
    featureSlip.utilities.extend(f, featureSlip.fieldEditors.Base);

    f.prototype.getValue = function() {
        return this.$checkbox.is(":checked");
    };

    f.prototype.setValue = function(v) {
        this.$checkbox.attr("checked", v);
    }

    window.featureSlip.fieldEditors.register(f, "boolean", "Boolean");
    
    return f;

}());