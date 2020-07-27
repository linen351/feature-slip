window.featureSlip.fieldEditors.Number = (function() {

    const template = '<div class="ui input"><input type="number" value="" /></div>';

    function f(isSettings, options) {

        let $dom = $(template);

        this.set$Dom($dom);

        this.$input = this.$root.find("input");

        f.superclass.init.apply(this, arguments);   
        
    }
    featureSlip.utilities.extend(f, featureSlip.fieldEditors.Base);

    f.prototype.getValue = function() {
        return parseInt(this.$input.val());
    };

    f.prototype.setValue = function(v) {
        this.$input.val(v);
    }

    window.featureSlip.fieldEditors.register(f, "number", "Number");
    
    return f;

}());