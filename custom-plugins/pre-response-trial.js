var jsPsychPretrialResponse = (
    function(jspsych) {
        "use strict";

        const info = {
            name: "pretrial-response",
            parameters: {
                shapes: {
                    type: jspsych.ParameterType.STRING,
                    array: true,
                    pretty_name: 'Trial shapes',
                    default: null,
                    description: 'The shapes to be shown, from top left clockwise.'
                },
                colors: {
                    type: jspsych.ParameterType.INT,
                    array: true,
                    pretty_name: 'Trial colors',
                    default: null,
                    description: 'The colors to be shown, from top left clockwise.'
                },
                locationAngles: {
                    type: jspsych.ParameterType.FLOAT,
                    array: true,
                    pretty_name: 'Trial location angles',
                    default: null,
                    description: 'The angles around the stimuli circle, in radians.'
                },
                jitters: {
                    type: jspsych.ParameterType.INT,
                    array: true,
                    pretty_name: 'Trial 2d jitters',
                    default: null,
                    description: 'The jitters to add to the stimuli positions.'
                }
            },
        };

        class PretrialResponsePlugin {
            constructor(jsPsych) {
                this.jsPsych = jsPsych;
            }

            trial(display_element, trial) {
                var new_html = '<div id="shape-stimulus">' +
                    '<canvas id="jspsych-canvas-stimulus" height="' +
                    stimuliDisplay.stimuliCanvasHeight +
                    '" width="' +
                    stimuliDisplay.stimuliCanvasHeight +
                    '"></canvas>' +
                    "</div>";
                display_element.innerHTML = new_html;
                let canvas = document.getElementById("jspsych-canvas-stimulus");
                const ctx = canvas.getContext('2d');

                let chunks = [];
                let mediaRecorder = null;
                let audioBlob = null;
                let audioResponse = null;

                function delay(duration) {
                    return new Promise((resolve) => {
                        setTimeout(() => resolve(), duration);
                    });
                }

                function clearHtml(context) {
                    context.clearRect(0, 0, canvas.width, canvas.height);
                }

                function record() {
                    //check if browser supports getUserMedia
                    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                        alert('Your browser does not support recording!');
                        return;
                    }

                    // browser supports getUserMedia
                    // change image in button
                    if (!mediaRecorder) {
                        // start recording
                        navigator.mediaDevices.getUserMedia({
                                audio: true,
                            })
                            .then((stream) => {
                                mediaRecorder = new MediaRecorder(stream, {
                                    audioBitsPerSecond: 5512 * 2,
                                });
                                mediaRecorder.start();
                                mediaRecorder.ondataavailable = mediaRecorderDataAvailable;
                                mediaRecorder.onstop = mediaRecorderStop;
                            })
                            .catch((err) => {
                                alert(`The following error occurred: ${err}`);
                            });
                    } else {
                        // stop recording
                        mediaRecorder.stop();
                    }
                }

                function mediaRecorderDataAvailable(e) {
                    chunks.push(e.data);
                }

                function mediaRecorderStop() {
                    //create the Blob from the chunks
                    audioBlob = new Blob(chunks, { type: "audio/webm" });
                    const audioURL = window.URL.createObjectURL(audioBlob);
                    const reader = new FileReader();
                    reader.readAsDataURL(audioBlob);
                    reader.onloadend = function() {
                        const base64 = reader.result.split(",")[1];
                        audioResponse = base64;
                        end_trial();
                    };
                    //reset to default
                    mediaRecorder = null;
                    chunks = [];
                }

                function showFixation(context) {
                    context.font = "60px Arial";
                    context.textAlign = "center";
                    context.textBaseline = "middle";
                    context.fillStyle = 'black';
                    context.fillText("+", stimuliDisplay.stimuliCanvasWidth / 2, stimuliDisplay.stimuliCanvasHeight / 2);
                }

                function showNumber(context) {
                    function getRandomInt(min, max) {
                        min = Math.ceil(min);
                        max = Math.floor(max);
                        return Math.floor(Math.random() * (max - min + 1)) + min;
                    }
                    let suppressionNumber = getRandomInt(20, 99);

                    context.font = "60px Arial";
                    context.textAlign = "center";
                    context.textBaseline = "middle";
                    context.fillStyle = 'black';
                    context.fillText(suppressionNumber, stimuliDisplay.stimuliCanvasWidth / 2, stimuliDisplay.stimuliCanvasHeight / 2);
                }

                // run trial timeline
                Promise.resolve()
                    .then(() => clearHtml(ctx))
                    .then(() => delay(1000))
                    .then(() => showNumber(ctx))
                    .then(() => record())
                    .then(() => delay(1000))
                    .then(() => clearHtml(ctx))
                    .then(() => showFixation(ctx))
                    .then(() => delay(500))
                    .then(() => stimuliDisplay.drawShapes(canvas, trial.shapes, trial.colors, trial.locationAngles, Array.from({ length: trial.colors.length }, (v, i) => i), true, trial.jitters))
                    .then(() => delay(100 * trial.colors.length))
                    .then(() => clearHtml(ctx))
                    .then(() => showFixation(ctx))
                    .then(() => delay(1000))
                    .then(() => record());


                // function to end trial when it is time
                // let end_trial = function() { // This causes an initialization error at stim.audio.addEventListener('ended', end_trial); 
                // function end_trial(){
                const end_trial = () => {
                    // gather the data to store for the trial
                    var trial_data = {}
                    trial_data['audio_response'] = audioResponse;

                    // clear the display
                    display_element.innerHTML = '';

                    // move on to the next trial
                    this.jsPsych.finishTrial(trial_data);
                }
            }
        }
        PretrialResponsePlugin.info = info;

        return PretrialResponsePlugin;
    })(jsPsychModule);