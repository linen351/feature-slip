/*
    Template variable: template.X
    Instance variable: instance.Y
    View variable: view.Z
    System variable: system.Q

    Template variables are set before init and are static until this is unloaded.
    Instance variables are passed in startIn.

*/

function init(doneCallback) {
    
    let $canvases = $sharedRoot.find("canvas.snow");

    if (!$canvases.length) {
        $sharedRoot.append('<canvas class="snow" style="width: 100%; height: 100%;"></canvas>');
    }
    
    $canvases = $sharedRoot.find("canvas.snow");
    
    let drawingCanvases = Array.from($canvases.map(function() { return this }));

    let shapeDotRadius = 3;

    ShapeShifter.init({
      outCanvases: drawingCanvases,
      outWidth: view.stageWidth,
      outHeight: view.stageHeight,
      fontSize: 500,
      //      fontFamily = 'NarconFont',
      fontFamily: 'Avenir, Helvetica Neue, Helvetica, Arial, sans-serif',
      pixelScanGap: Math.floor(5 * shapeDotRadius/2),

      initialNumberOfDots: 2000,

      stochasticMovementDistance: () => (Math.random() * 2 - 1) * 5 * shapeDotRadius,
      fallingSpeed: 0.3 * shapeDotRadius,
      shapeDotRadius: shapeDotRadius,

      shapeToShapeDotBlowUpSize: () => (Math.random() + 0.5) * 5 * shapeDotRadius,
      noShapeToShapeDotBlowUpSize: () => (Math.random() + 1) * 2 * shapeDotRadius,
      shapeToNoShapeDotBlowUpSize: () => (Math.random() + 0.5) * 5 * shapeDotRadius,
      shapeToShapeDotHoldCount: 18,
      noShapeToShapeDotHoldCount: 5,
      shapeToNoShapeDotHoldCount: 20,
      noShapeDotRadius: () => Math.random() * shapeDotRadius * 2,
      dotInitialSpeed: 0.07,
      noShapeToShapeDotSpeed: 0.11,
      shapeToShapeDotSpeed: 0.14,
      fastToShapeDotHoldCount: 18,
      fastToShapeDotSpeed: 0.25,
      noShapeDotSpeed: () => (1 + Math.random()) * 0.02,
      shapeToShapeDotAlpha: () => Math.random(),
      shapeDotAlpha: 1,
      noShapeDotAlpha: 0.4,
      shapeToNoShapeAlpha: () => Math.random()

    });
    
    doneCallback();

    return doneCallback;

}


function startIn(doneCallback, instance) {

    $instanceRoot.addClass("startIn");

    //ShapeShifter.Shape.switchShape(ShapeShifter.ShapeBuilder.letter(instance.text, { fontFamily: "NarconFont", pixelScanGap: 9 }));  

    ShapeShifter.Shape.switchShape(ShapeShifter.ShapeBuilder.letter(""));  
    ShapeShifter.setOptions({snowActive: instance.snow});

    doneCallback();
    
    return doneCallback;
    
}

function startOut(doneCallback) {

    $instanceRoot.removeClass("startIn").addClass("startOut");

    window.setTimeout(doneCallback, template.transitionms);
    
    return doneCallback;
}