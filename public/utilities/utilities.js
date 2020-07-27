(function () {

    function extend(subClass, superClass) {
        let F = function () { };
        F.prototype = superClass.prototype;
        subClass.prototype = new F();
        subClass.prototype.constructor = subClass;
        subClass.superclass = superClass.prototype;
        if (superClass.prototype.constructor == Object.prototype.constructor) {
            superClass.prototype.constructor = superClass;
        }
    }


    function stringFormat(str, arrayArgs) {

        let args;
        let offset;

        if (typeof arrayArgs == "object") {
            args = arrayArgs;
            offset = -1;
        } else {
            args = arguments;
            offset = 0;
        }

        let result = str,
            start = -1,
            end = -1,
            replaces = [];

        while (true) {
            start = result.indexOf("{", end);
            end = result.indexOf("}", end);
            if (start < 0 || end < 0) {
                break;
            }
            let replaceIndex = parseInt(result.substring(start + 1, end)) + 1,
                replaceValue = args[replaceIndex + offset];
            if (!replaceValue) {
                replaceValue = "";
            }

            replaces[replaceIndex] = replaceValue;

            replaceValue = "¤" + replaceIndex + "£";
            result = result.replace(result.substring(start, end + 1), replaceValue);

            end = start + replaceValue.length;
        }

        let i = replaces.length;
        while (i--) {
            let replace = replaces[i];
            if (replace !== null && replace !== undefined) {
                result = result.replace(new RegExp("¤" + i + "£", "g"), replace);
            }
        }

        return result;
    }


    let AllIsDoneMultiplexer = (function () {

        function valueOrFunctionResult(thingie, funcContext) {
            if (typeof thingie == "function") {
                return thingie.call(funcContext);
            }
            return thingie;
        };

        function allIsDoneMultiplexer(options) {
            this.parentCallbacks = options.parentCallbacks;
            this.doneValueOrFunc = options.doneValueOrFunc;
            this.label = options.label; //For debug purposes
            this.childCallbackStatuses = [];
        }

        // Gets a callback function which must eventually be called
        allIsDoneMultiplexer.prototype.getChildCallback = function (label) {
            let that = this,
                childCallbackStatuses = this.childCallbackStatuses,
                index = childCallbackStatuses.length;
            childCallbackStatuses[index] = label || false; // Label for debug purposes
            return function () {
                // Register this callback as being done
                childCallbackStatuses[index] = true;
                that.maybeDone();
            };
        };

        // If we have armed it, we have not previously called the parent callback, and each and every child callback has called back, then call the parent callbacks.
        allIsDoneMultiplexer.prototype.maybeDone = function () {
            let parentCallbacks = this.parentCallbacks;
            if (this.armed && !this.done && (parentCallbacks.length == 0 || this.childCallbackStatuses.every(function (status) { return status === true; }))) {

                // For debugging purposes
                //window.clearTimeout(this.giveUpTimer);

                this.done = true;
                let value = valueOrFunctionResult(this.doneValueOrFunc, this);
                parentCallbacks.forEach(function (parentCallback) {
                    parentCallback(value);
                });

                return true;
            }
            return false;
        };

        // Make ready to call back. It could be that all child callbacks have already called back. If so, the parent callbacks will run immediately.
        allIsDoneMultiplexer.prototype.arm = function () {
            this.armed = true;

            this.maybeDone();

            // For debugging purposes
            //if (!this.maybeDone()) {
            //    let that = this;
            //    this.giveUpTimer = window.setTimeout(function() {
            //        console.log("give up", that.label, that.childCallbackStatuses);
            //    }, 1000);
            //}

        };

        return function (options) {
            return new allIsDoneMultiplexer(options);
        };

    }());

    let fieldListNs = (function () {

        function toDict(asArray) {

            return asArray.reduce(function (acc, f) {
                acc[f.name] = f.value;
                return acc;
            }, {});

        }

        function addRange(toAdd, toAddTo) {

            toAddTo = toAddTo || [];

            toAdd.forEach(function(addField) {

                let addName = addField.name;
                let index = toAddTo.findIndex(function(existingField) { return addName == existingField.name; });

                if (index === -1) {
                    toAddTo.push(addField);
                } else {
                    toAddTo[index] = addField;
                }

            });

            return toAddTo;

        }


        return {
            toDict: toDict,
            addRange: addRange
        };

    }());


    let toExport = {
        extend: extend,
        stringFormat: stringFormat,
        AllIsDoneMultiplexer: AllIsDoneMultiplexer,
        fieldList: fieldListNs
    };

    if (typeof exports != "undefined") {
        for(var key in toExport) {
            exports[key] = toExport[key];
        }
    }

    if (typeof window != "undefined") {
        window.featureSlip = window.featureSlip || {};
        window.featureSlip.utilities = toExport;
    }

}());