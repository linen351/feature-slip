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
    return doneCallback;

}


function startIn(doneCallback, instance) {
    doneCallback();

    $instanceRoot.addClass("in");

    return doneCallback;

}

function startOut(doneCallback) {

    $instanceRoot.removeClass("in").addClass("out");

    window.setTimeout(doneCallback, template.transitionms);
    return doneCallback;
}