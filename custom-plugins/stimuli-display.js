var stimuliDisplay = {
    stimuliCanvasWidth: 100,
    stimuliCanvasHeight: 100,
    stimuliWidth: 100,
    stimuliLocationCircleRadius: 100,
    colorwheelInnerDiameter: 100,
    colorwheelOuterDiameter: 100,
    jitterWidth: 5,
    jitterHeight: 5,

    resize(pxPerMillimeter) {
        // size of the total canvas
        this.stimuliCanvasWidth = pxPerMillimeter * 160;
        this.stimuliCanvasHeight = pxPerMillimeter * 160;
    
        // size of bounding box of stimuli, in pixels
        this.stimuliWidth = pxPerMillimeter * 13;
    
        // available locations to display at
        // this.stimuliLocationCircleRadius = pxPerMillimeter * 105 / 2; // borders size
        this.stimuliLocationCircleRadius = pxPerMillimeter * 85 / 2;
    
        // colorwheel diameters
        this.colorwheelInnerDiameter = pxPerMillimeter * 145;
        this.colorwheelOuterDiameter = pxPerMillimeter * 160;

        // jitter bounds
        this.jitterWidth = pxPerMillimeter * 8;
        this.jitterHeight = pxPerMillimeter * 8;
    },

    getLocationsFromAngles(locationAngles) {
        let locations = [];
        for (let locationAngle of locationAngles) {
            let x = this.stimuliLocationCircleRadius * Math.cos(locationAngle);
            let y = this.stimuliLocationCircleRadius * Math.sin(locationAngle);
    
            let new_coord = [this.stimuliCanvasWidth / 2 + x, this.stimuliCanvasHeight / 2 + y];
            locations.push(new_coord);
        }

        return locations;
    },

    drawShape(context, shape, center) {
        switch (shape) {
            case 'diamond':
                context.moveTo(center[0] - this.stimuliWidth / 2, center[1]);
                context.lineTo(center[0], center[1] + this.stimuliWidth / 2);
                context.lineTo(center[0] + this.stimuliWidth / 2, center[1]);
                context.lineTo(center[0], center[1] - this.stimuliWidth / 2);
                context.closePath();
                break;
            case 'circle':
                context.arc(center[0], center[1], this.stimuliWidth / 2, 0, 2 * Math.PI);
                break;
            case 'square':
                context.rect(center[0] - this.stimuliWidth / 2, center[1] - this.stimuliWidth / 2, this.stimuliWidth, this.stimuliWidth);
                break;
            case 'triangle':
                context.moveTo(center[0] - this.stimuliWidth / 2, center[1] + this.stimuliWidth / 2);
                context.lineTo(center[0] + this.stimuliWidth / 2, center[1] + this.stimuliWidth / 2);
                context.lineTo(center[0], center[1] - this.stimuliWidth / 2);
                context.closePath();
                break;
            case 'cross':
                context.moveTo(center[0] - this.stimuliWidth / 4, center[1] - this.stimuliWidth / 2);
                context.lineTo(center[0] + this.stimuliWidth / 4, center[1] - this.stimuliWidth / 2);
                context.lineTo(center[0] + this.stimuliWidth / 4, center[1] - this.stimuliWidth / 4);
                context.lineTo(center[0] + this.stimuliWidth / 2, center[1] - this.stimuliWidth / 4);
                context.lineTo(center[0] + this.stimuliWidth / 2, center[1] + this.stimuliWidth / 4);
                context.lineTo(center[0] + this.stimuliWidth / 4, center[1] + this.stimuliWidth / 4);
                context.lineTo(center[0] + this.stimuliWidth / 4, center[1] + this.stimuliWidth / 2);
                context.lineTo(center[0] - this.stimuliWidth / 4, center[1] + this.stimuliWidth / 2);
                context.lineTo(center[0] - this.stimuliWidth / 4, center[1] + this.stimuliWidth / 4);
                context.lineTo(center[0] - this.stimuliWidth / 2, center[1] + this.stimuliWidth / 4);
                context.lineTo(center[0] - this.stimuliWidth / 2, center[1] - this.stimuliWidth / 4);
                context.lineTo(center[0] - this.stimuliWidth / 4, center[1] - this.stimuliWidth / 4);
                context.closePath();
                break;
            case 'arrow':
                context.moveTo(center[0] - this.stimuliWidth / 2, center[1] - this.stimuliWidth / 2);
                context.lineTo(center[0] + this.stimuliWidth / 8, center[1] - this.stimuliWidth / 2);
                context.lineTo(center[0] + this.stimuliWidth / 2, center[1]);
                context.lineTo(center[0] + this.stimuliWidth / 8, center[1] + this.stimuliWidth / 2);
                context.lineTo(center[0] - this.stimuliWidth / 2, center[1] + this.stimuliWidth / 2);
                context.lineTo(center[0] - this.stimuliWidth / 8, center[1]);
                context.closePath();
                break;
            case 'flag':
                context.moveTo(center[0] - this.stimuliWidth / 2, center[1] - this.stimuliWidth / 2);
                context.bezierCurveTo(
                    center[0] - this.stimuliWidth * .1, center[1] - this.stimuliWidth * .2,
                    center[0] + this.stimuliWidth * .1, center[1] - this.stimuliWidth * .8,
                    center[0] + this.stimuliWidth / 2, center[1] - this.stimuliWidth / 2);
                context.lineTo(center[0] + this.stimuliWidth / 2, center[1] + this.stimuliWidth / 2);
                context.bezierCurveTo(
                    center[0] + this.stimuliWidth * .1, center[1] + this.stimuliWidth * .2,
                    center[0] - this.stimuliWidth * .1, center[1] + this.stimuliWidth * .8,
                    center[0] - this.stimuliWidth / 2, center[1] + this.stimuliWidth / 2
                );
                context.closePath();
                break;
        }
    },

    drawShapes(canvas, shapes, colors, locationAngles, indices, fixation, jitters) {
        const context = canvas.getContext('2d');

        let locations = this.getLocationsFromAngles(locationAngles);

        if (fixation) {
            context.font = "60px Arial";
            context.textAlign = "center";
            context.textBaseline = "middle";
            context.fillStyle = 'black';
            context.fillText("+", this.stimuliCanvasWidth / 2, this.stimuliCanvasHeight / 2);
        }

        for (let index of indices) {
            let currentJitter = [jitters[index][0] * stimuliDisplay.jitterWidth, jitters[index][0] * stimuliDisplay.jitterHeight];
            var center = locations[index].map((a, i) => a + currentJitter[i]);
            var shape = shapes[index];
            var color = colors[index];

            context.beginPath();

            this.drawShape(context, shape, center);

            context.fillStyle = 'rgb(' + color[0] + ',' + color[1] + ',' + color[2] + ')';
            context.fill();
            context.strokeStyle = "black";
            context.lineWidth = 2;
            context.stroke();
        }
    },

    drawShapesProbeByLocation(canvas, shapes, currentColor, locationAngles, indices, fixation, probe, jitters) {
        const context = canvas.getContext('2d');

        let locations = this.getLocationsFromAngles(locationAngles);

        if (fixation) {
            context.font = "60px Arial";
            context.textAlign = "center";
            context.textBaseline = "middle";
            context.fillStyle = 'black';
            context.fillText("+", this.stimuliCanvasWidth / 2, this.stimuliCanvasHeight / 2);
        }

        for (let index of indices) {
            let currentJitter = [jitters[index][0] * stimuliDisplay.jitterWidth, jitters[index][0] * stimuliDisplay.jitterHeight];
            var center = locations[index].map((a, i) => a + currentJitter[i]);
            var shape = shapes[index];

            context.beginPath();

            this.drawShape(context, shape, center);

            if (index == probe) {
                context.fillStyle = 'rgb(' + currentColor[0] + ',' + currentColor[1] + ',' + currentColor[2] + ')';
            } else {
                context.fillStyle = 'rgb(' + 255 + ',' + 255 + ',' + 255 + ')';
            }
            
            context.fill();
            context.strokeStyle = "black";

            if (index == probe) {
                context.lineWidth = 4;
            } else {
                context.lineWidth = 2;
            }
            context.stroke();
        }
    },

    drawShapesProbeByShape(canvas, shape, currentColor, fixation) {
        const context = canvas.getContext('2d');

        if (fixation) {
            context.font = "60px Arial";
            context.textAlign = "center";
            context.textBaseline = "middle";
            context.fillStyle = 'black';
            context.fillText("+", this.stimuliCanvasWidth / 2, this.stimuliCanvasHeight / 2);
        }

        var center = [this.stimuliCanvasWidth / 2, this.stimuliCanvasHeight / 2];

        context.beginPath();

        this.drawShape(context, shape, center);

        context.fillStyle = 'rgb(' + currentColor[0] + ',' + currentColor[1] + ',' + currentColor[2] + ')';
        context.fill();
        context.strokeStyle = "black";
        context.lineWidth = 2;
        context.stroke();
    }
}