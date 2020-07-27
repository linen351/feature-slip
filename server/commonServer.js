exports.fileEncoding = "utf-8";

exports.sendToAllClients = function (action, data) {

    ggs.sendToAllClients(this, { action: action, data: data });

}

exports.fileEndingIsJson = function (path) {
    return path.substring(path.lastIndexOf(".") + 1) == "json";
}

exports.applyFieldDefaults = function (settings, defaultFields) {

    return defaultFields.map(function (variable) {

        let name = variable.name,
            type = variable.type,
            defValue = variable.value;

        let value = settings[name];

        if (value === undefined) {
            value = defValue;
        }

        return {
            name: name,
            value: value,
            type: type
        };

    });

}