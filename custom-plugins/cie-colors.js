var cieColors = {

    angleToRGB(angle) {
        // angle in radians
        var lab = [60, 20, 38];
        var labRadius = 60;

        var L, A, B;

        L = lab[0];
        A = lab[1] + labRadius * Math.cos(angle);
        B = lab[2] + labRadius * Math.sin(angle);

        // console.log("l: " + l + ", a: " + a + ", b: " + b);

        var x, y, z;

        // convert to xyz
        y = (L + 16) / 115;
        x = y + A / 500;
        z = y - B / 200;

        // console.log("x: " + x + ", y: " + y + ", z: " + z);

        // filter x, y, z with threshold 0.008856
        const threshold = 0.008856;
        if (x ** 3 > threshold) {
            x = x ** 3;
        } else {
            x = (x - 16 / 116) / 7.787;
        }

        if (y ** 3 > threshold) {
            y = y ** 3;
        } else {
            y = (y - 16 / 116) / 7.787;
        }

        if (z ** 3 > threshold) {
            z = z ** 3;
        } else {
            z = (z - 16 / 116) / 7.787;
        }

        // console.log("x: " + x + ", y: " + y + ", z: " + z);

        // rescale
        const refX = 95.047;
        const refY = 100;
        const refZ = 108.883;

        x = refX * x / 100;
        y = refY * y / 100;
        z = refZ * z / 100;

        // console.log("x: " + x + ", y: " + y + ", z: " + z);

        // convert to rgb
        var newR = x * 3.2406 + y * -1.5372 + z * -0.4986
        var newG = x * -0.9689 + y * 1.8758 + z * 0.0415
        var newB = x * 0.0557 + y * -0.2040 + z * 1.0570

        // console.log("r: " + newR + ", g: " + newG + ", b: " + newB);

        // gamma correction
        const rgbThreshold = 0.0031308;
        if (newR > rgbThreshold) {
            newR = 1.055 * newR ** (1 / 2.4) - 0.055;
        } else {
            newR = 12.92 * newR;
        }

        if (newG > rgbThreshold) {
            newG = 1.055 * newG ** (1 / 2.4) - 0.055;
        } else {
            newG = 12.92 * newG;
        }

        if (newB > rgbThreshold) {
            newB = 1.055 * newB ** (1 / 2.4) - 0.055;
        } else {
            newB = 12.92 * newB;
        }

        // console.log("r: " + newR + ", g: " + newG + ", b: " + newB);

        // trim to [0, 255]
        newR = Math.max(0, Math.min(1, newR)) * 255;
        newG = Math.max(0, Math.min(1, newG)) * 255;
        newB = Math.max(0, Math.min(1, newB)) * 255;

        // console.log("r: " + newR + ", g: " + newG + ", b: " + newB);

        return [newR, newG, newB];
    }
}