/*
    Template variable: template.X
    Instance variable: instance.Y
    View variable: view.Z
    System variable: system.Q

    Template variables are set before init and are static until this is unloaded.
    Instance variables are passed in startIn.


*/

function init(doneCallback) {
    doneCallback();
}

function startIn(doneCallback, instance) {
    $instanceRoot.removeClass("startOut").addClass("startIn");
    doneCallback();
}

function startOut(doneCallback) {
    $instanceRoot.removeClass("startIn").addClass("startOut");
    window.setTimeout(function() {
        $instanceRoot.removeClass("startOut");
        doneCallback();
    }, template.transitionms);
    return doneCallback;
}