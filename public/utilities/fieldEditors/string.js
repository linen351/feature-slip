window.featureSlip.fieldEditors.String = (function() {

    const template = '<div class="ui input"><input type="text" value="" /></div>';
    
    function f(isSettings, options) {

        let $dom = $(template);

        this.set$Dom($dom);

        this.$input = this.$root.find("input");
        
        f.superclass.init.apply(this, arguments);   
        
    }
    featureSlip.utilities.extend(f, featureSlip.fieldEditors.Base);

    f.prototype.getValue = function() {
        return this.$input.val();
    };

    f.prototype.setValue = function(v) {
        this.$input.val(v);        
    }

    window.featureSlip.fieldEditors.register(f, "string", "String");
    
    return f;

}());