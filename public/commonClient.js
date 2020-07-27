window.featureSlip = window.featureSlip || {};

window.featureSlip.handlersByKey = {};
window.featureSlip.allHandlers = [];

// if user is running mozilla then use it's built-in WebSocket
window.WebSocket = window.WebSocket || window.MozWebSocket;


(function () {

    let incomingFromServerListenersByHandler = {};

    let connection;

    function listenForIncomingFromServer(options) {

        let handlerKey = options.handler,
            actionKey = options.action,
            callback = options.callback,
            listeners = incomingFromServerListenersByHandler[handlerKey];

        if (!listeners) {
            listeners = incomingFromServerListenersByHandler[handlerKey] = [];
        }

        if (actionKey) {

            listeners.push(function (data) {

                if (actionKey == data.action) {

                    callback(data.data);

                }

            });

            return;
        }

        listeners.push(callback);

    };


    function sendToServer(handler, data) {

        let stringed = JSON.stringify({ handler: handler.key, data: data });
        connection.send(stringed);

    }

    function connect(connectedCallback) {

        if (connection) {
            connection.close();
        }

        connection = new WebSocket('ws://' + location.host);

        connection.onopen = function () {
            console.log("ws opened");

            (connectedCallback || function () { })();

        };

        connection.onerror = function (error) {
        };

        connection.onmessage = function (message) {

            let json = JSON.parse(message.data);

            let listeners = incomingFromServerListenersByHandler[json.handler] || [];

            listeners.forEach(function (listener) {

                listener(json.data);

            });

        };

    }

    function init() {

        connect(function () {

            featureSlip.allHandlers.forEach(function (handler) {
                handler.init();
            });

            window.setInterval(function () {
                if (connection.readyState === WebSocket.CLOSED) {
                    connect();
                }
            },
                1000);

        });


        $(document).click(function (event) {

            let target = event.target,
                chain = [];

            while (target) {

                chain.push(target);

                featureSlip.allHandlers.forEach(function (handler) {

                    if (target && target == handler.rootElement) {

                        handler.incomingClick.call(handler, chain, event);

                        target = null;
                        return;
                    }

                });

                if (target) {
                    target = target.parentElement;
                }
            }

        });
    }

    featureSlip.sendToServer = sendToServer;
    featureSlip.init = init;

    window.featureSlip.common = (function () {

        let ns = {};

        ns.listenForIncomingFromServer = listenForIncomingFromServer;

        ns.nsDef = {

            sendToServer: function (action, data) {
                featureSlip.sendToServer(this, { action: action, data: data });
            },

            incomingFromServer: function (data) {

                this.incomingHandlers[data.action](data.data);

            },

            incomingClick: function (chain, event) {

                let index = 0;

                while (index < chain.length) {

                    let $clicked = $(chain[index]);

                    let clickHandlers = this.clickHandlers;

                    for (let key in clickHandlers) {

                        if ($clicked.hasClass(key)) {

                            clickHandlers[key]($clicked, event);
                            return;
                        }

                    }

                    index++;
                }

            }

        };

        ns.initDefNs = function (moduleKey) {

            let nsDef = ns.nsDef,

                $root = $("#" + moduleKey),
                resultNs = {
                    key: moduleKey,
                    $root: $root,
                    rootElement: $root.get(0),
                    $contentTarget: $root.find(".contentTarget").first() //todo only one
                };

            for (let key in nsDef) {
                resultNs[key] = nsDef[key];
            }

            featureSlip.common.listenForIncomingFromServer({
                handler: moduleKey,
                callback: function (data) {
                    resultNs.incomingFromServer(data);
                }
            });

            featureSlip.handlersByKey[moduleKey] = resultNs;
            featureSlip.allHandlers.push(resultNs);

            return resultNs;
        }

        return ns;

    }());

}());
