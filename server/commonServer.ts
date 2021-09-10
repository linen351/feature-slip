import { sendToAllClients as send } from "./app";

export const fileEncoding = "utf-8";

export const sendToAllClients = function (action, data) {
  send(this, { action: action, data: data });
};

export const fileEndingIsJson = function (path) {
  return path.substring(path.lastIndexOf(".") + 1) == "json";
};

export const applyFieldDefaults = function (settings, defaultFields) {
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
      type: type,
    };
  });
};
