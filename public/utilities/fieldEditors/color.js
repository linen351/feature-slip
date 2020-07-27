window.featureSlip.fieldEditors.Colour = (function() {

    const template = '<div class="ui input"><input type="text" class="jscolor" value="" /></div>';

    function f(isSettings, options) {

        let $dom = $(template);

        this.picker = new jscolor($dom.find("input").get(0));

        this.set$Dom($dom);

        f.superclass.init.apply(this, arguments);   
        
    }
    featureSlip.utilities.extend(f, featureSlip.fieldEditors.Base);

    f.prototype.getValue = function() {
        return this.picker.toHEXString();
    };

    f.prototype.setValue = function(v) {
        this.picker.fromString("" + v);
    };

    window.featureSlip.fieldEditors.register(f, "color", "Colour");
    
    return f;

}());