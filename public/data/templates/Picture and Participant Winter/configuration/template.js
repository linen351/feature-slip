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
      fontFamily: 'GothamMedium, Avenir, Helvetica Neue, Helvetica, Arial, sans-serif',
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

/*
let $currentContent = null;

function removeCurrentContent() {
    
    if ($currentContent) {
        
        $currentContent.removeClass("in").addClass("out");

        (function($content) {
            window.setTimeout(function() {
                $content.remove();
            }, template.transitionms);
        } ($currentContent));
        
        $currentContent = null;
    }
    
}


const templ = '<div class="container"><div class="imageContainer"></div><div class="efternamn"></div><div class="förlaga"></div></div>';

function setCurrentContent(instance) {
    
    removeCurrentContent();

    let url = instance.bild.path;

    $currentContent = $(templ);
    
    for(var i = 0; i < $instanceRoot.length - 1; i++) {
        $currentContent = $currentContent.add(templ);
    }
    
    $instanceRoot.each(function(index) {
       $(this).append($currentContent[index]); 
    });

    (function($content) {
    
        $('<img/>').attr('src', url).on('load', function() {

            let $image = $content.find(".imageContainer");
            
            $image.css("background-image", "url('" + url + "')");
            
            $content.find(".efternamn").html(instance.efternamn);

            let $förlaga = $content.find(".förlaga");

            $förlaga.html(instance.förlaga + "<br />" + instance.förlaga2);

            if (instance.mindreKaraktär) {
                $förlaga.addClass("mindre");   
            }

    
            $content.addClass("in");

            window.setTimeout(function() {
                $content.addClass("prepForOut");
            }, template.transitionms);

            $(this).remove();
        });
    
    }($currentContent));
    
}
*/

function startIn(doneCallback, instance) {
    doneCallback();

    $instanceRoot.addClass("in");

    ShapeShifter.Shape.switchShape(ShapeShifter.ShapeBuilder.texts([
        { "text": instance.förnamn, "xFraction": 0.45, "yFraction": 0.30, fontScale: 0.28, textAlign: "left" },
//        { "text": instance.efternamn, "xFraction": 0.46, "yFraction": 0.44, fontScale: 0.15, textAlign: "left" },
        { "text": instance.karaktär, "xFraction": 0.45, "yFraction": 0.71, fontScale: instance.mindreKaraktär ? 0.17 : 0.28, textAlign: "left" },
//        { "text": instance.förlaga, "xFraction": 0.46, "yFraction": 0.85, fontScale: 0.15, textAlign: "left" },
//        { "text": instance.förlaga2, "xFraction": 0.46, "yFraction": 0.95, fontScale: 0.15, textAlign: "left" }
        ]));  

    ShapeShifter.setOptions({snowActive: instance.snow});

//    setCurrentContent(instance);
    return doneCallback;

}

function startOut(doneCallback) {

    $instanceRoot.removeClass("in").addClass("out");

    ShapeShifter.Shape.switchShape(ShapeShifter.ShapeBuilder.letter(""));  

//    removeCurrentContent();

    window.setTimeout(doneCallback, template.transitionms);
    return doneCallback;
}