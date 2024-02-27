/*!
 *	A CIELAB colorwheel based on https://github.com/techslides/huewheel
 */

/**
 * Create a new instance of a Hue wheel.
 *
 * @param {String|HTMLElement} elementID - ID of an element or the element itself to turn into a control
 * @constructor
 */
function HueWheel(elementID, shapes, target_angle, locationAngles, probe, probeByLocation, random_rotation, callbackFunction, jitters) {

    console.log(probeByLocation);

    if (isStr(elementID))
        elementID = document.getElementById(elementID);

    var me = this,
        canvas = document.createElement('canvas'),
        ctx = canvas.getContext('2d'),
        gw = 360 * 4,
        gwstep = 360 / gw,

        // pre-calcs
        d2r = Math.PI / 180,
        r2d = 180 / Math.PI,
        pi2 = 2 * Math.PI,

        // options
        w = stimuliDisplay.colorwheelOuterDiameter,
        h = w,
        cx = w * 0.5,
        cy = cx,
        angle = Infinity,

        showColor = false,

        thickness = stimuliDisplay.colorwheelOuterDiameter - stimuliDisplay.colorwheelInnerDiameter,
        shadow = 3,

        colorWidth = 0.5,
        colorBorder = 1,
        colorBorderColor = '#555',

        // calced setup
        hr,

        // internals
        to,
        x, y, // current mouse position
        r, g, b,

        target = target_angle + random_rotation,
        rotation = random_rotation,
        shape = shapes[probe];

    /*
     *	Init callback vector
     */
    this.onchange = callbackFunction;

    /*
     *	Init canvas for control
     */
    canvas.id = (elementID.id || 'hueWheel') + '_canvas';

    /*
     *	Generate control and insert into DOM
     */
    generateCanvas();
    elementID.innerHTML = '';
    elementID.appendChild(canvas);

    /*
     *	Init first draw and event
     */
    render();

    /*
     *	Setup mouse handlers
     */
    canvas.addEventListener('mousedown', mouseDown, false);
    window.addEventListener('mousemove', mouseMove, false);

    /*
     * *******  MOUSE handlers  *******
     */

    function mouseDown(e) {

        getXY(e);

        canvas.style.cursor = 'default';

        /*
         *	Check if in HUE RING
         */
        var tri = getTri(x, y),
            d = tri.dist,
            a = tri.angle;

        if (d > hr - thickness * 0.5 && d < hr + thickness * 0.5) {

            angle = wrapAngle(2 * Math.PI - a);

            clear();
            sendEvent();
        }

        return false;
    }

    function mouseMove(e) {

        getXY(e);

        var tri = getTri(x, y),
            d = tri.dist,
            a = tri.angle,
            isOver;

        isOver = ctx.isPointInPath(x, y);

        if (isOver) {
            canvas.style.cursor = 'pointer';
            return false;
        }

        /*
         *	Check if HUE RING
         */
        if (d > hr - thickness * 0.5 && d < hr + thickness * 0.5) {
            canvas.style.cursor = 'crosshair';

            angle = wrapAngle(2 * Math.PI - a);

            clear();
            return false;
        }

        canvas.style.cursor = 'default';

        return false;
    }

    /*
     *	Get position
     */
    function getXY(e) {

        cevent(e);

        var rect = canvas.getBoundingClientRect()

        x = e.clientX;
        y = e.clientY;

        x -= rect.left;
        y -= rect.top;
    }

    function cevent(e) {
        if (e.stopPropagation) e.stopPropagation();
        if (e.preventDefault) e.preventDefault();
    }

    /*
     *	Calc angle and distance
     */
    function getTri(x, y) {

        var dx = x - cx,
            dy = y - cy;

        return {
            dist: Math.sqrt(dx * dx + dy * dy),
            angle: Math.atan2(dy, dx)
        }
    }

    function wrapAngle(ang) {
        while (ang >= 2 * Math.PI) ang -= 2 * Math.PI;
        while (ang <= 0) ang += 2 * Math.PI;

        return ang;
    }

    function wrapAngleZeroCenter(ang) {
        while (ang >= Math.PI) ang -= 2 * Math.PI;
        while (ang <= -Math.PI) ang += 2 * Math.PI;

        return ang;
    }

    /*
     *	Calc setup
     */
    function setup() {
        hr = (w - thickness - shadow * 2) * 0.5 + 1; //hue radius
    }

    /*
     *	Render methods
     */
    function generateCanvas() {

        var i,
            rad,
            oldRad;

        setup();

        ctx.clearRect(0, 0, w, h);

        canvas.width = canvas.height = w;
        canvas.innerHTML = '<h1>No HTML5 Canvas support. Please upgrade the browser.</h1>';

        /*
         *	Render HUE wheel
         */
        ctx.lineWidth = thickness;

        if (shadow > 0) {

            ctx.save();
            ctx.save();

            ctx.strokeStyle = 'rgb(0, 0, 0)';

            ctx.beginPath();
            ctx.arc(cx, cy, hr, 0, pi2);
            ctx.closePath();
            ctx.stroke();

            ctx.restore();

            ctx.globalCompositeOperation = 'destination-out';
            ctx.beginPath();
            ctx.arc(cx, cy, hr, 0, pi2);
            ctx.closePath();
            ctx.stroke();

            ctx.restore();
        }

        for (i = 0, oldRad = 0; i < 360; i += gwstep) {

            // console.log("deg: " + i);

            rad = i * d2r;
            var newRGB = cieColors.angleToRGB(2 * Math.PI - rad - rotation);

            ctx.strokeStyle = 'rgb(' + newRGB[0] + ',' + newRGB[1] + ',' + newRGB[2] + ')';
            ctx.beginPath();
            ctx.arc(cx, cy, hr, oldRad, rad + 0.01);
            ctx.stroke();

            oldRad = rad;
        }

        /*
         *	Set static elements as background image of element
         */
        canvas.style.backgroundImage = 'url(' + canvas.toDataURL() + ')';
        ctx.clearRect(0, 0, w, h);

        clear();
    }

    function render() {
        clear();
    }

    function clear() {

        if (angle === Infinity) {
            r = 255;
            g = 255;
            b = 255;
        } else {
            getRGB();
        }

        ctx.clearRect(0, 0, w, h);

        if (showColor) {
            if (probeByLocation) {
                stimuliDisplay.drawShapesProbeByLocation(canvas, shapes, [r, g, b], locationAngles, Array.from({ length: jitters.length }, (_, i) => i+1), false, probe, jitters);
            } else {
                stimuliDisplay.drawShapesProbeByShape(canvas, shape, [r, g, b], false);
            }
        } else {
            if (probeByLocation) {
                stimuliDisplay.drawShapesProbeByLocation(canvas, shapes, [255, 255, 255], locationAngles, Array.from({ length: jitters.length }, (_, i) => i+1), false, probe, jitters);
            } else {
                stimuliDisplay.drawShapesProbeByShape(canvas, shape, [255, 255, 255], false);
            }
        }
    }

    function getRGB() {
        var rgb = cieColors.angleToRGB(angle - rotation);
        r = rgb[0];
        g = rgb[1];
        b = rgb[2];
    }

    /*
     *	Misc system and checks
     */
    function sendEvent() {
        canvas.removeEventListener('mousedown', mouseDown, false);
        window.removeEventListener('mousemove', mouseMove, false);

        // show correct answer for 1000ms
        let answerRadius = hr;
        let answerAngle = target_angle + random_rotation; 
        let answerX = cx + answerRadius * Math.cos(answerAngle);
        let answerY = cy - answerRadius * Math.sin(answerAngle);

        ctx.textAlign = "center";
        ctx.textBaseline = 'middle';
        ctx.font = "36px Arial";
        ctx.fillStyle = 'black';
        ctx.fillText("+", answerX, answerY);

        setTimeout(function() { me.onchange({
            angle: angle,
            target: target_angle,
            rotation: random_rotation,
            error: wrapAngleZeroCenter(angle - (target_angle + random_rotation)),
            response_time: performance.now()
        })}, 1000);
    }

    /*
     *	Internal helpers
     */
    function isStr(a) { return (typeof a === 'string') }

    function isBool(a) { return (typeof a === 'boolean') }

    function isNum(a) { return (typeof a === 'number') }
}
