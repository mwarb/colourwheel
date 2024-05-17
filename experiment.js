/* experiment variables */
var username;

var numPracticeTrials = 5;
var numberRepeats = 50; 

var availableShapes = ['cross', 'diamond', 'circle', 'triangle', 'arrow', 'flag'];

// parameters for ensuring consistent display sizes.
// use original px per millimeter for measurements to ensure no issue when the pxPerMillimeter is updated later, given a separate function handles resizing of the canvas
var originalPxPerMillimeter = 6.522;
var pxPerMillimeter = 6.522;

var locationAngles = [];
for (let theta = 0; theta < 2 * Math.PI; theta += 2 * Math.PI / 8) {
    locationAngles.push(theta);
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

var debug = false;
var platform = "prolific";

/* create timeline */
var timeline = [];

// function initialisePavlovia() {
//     var pavlovia_init = {
//         type: jsPsychPavlovia,
//         command: "init"
//     };
//     timeline.push(pavlovia_init);
// }

function preloadImages() {
    var preload = {
        type: jsPsychPreload,
        auto_preload: true,
        images: [
            'media/instructions/wm/instruction_b1_s1.png',
            'media/instructions/wm/instruction_b1_s2.png',
            'media/instructions/wm/instruction_b1_s3.png',
            'media/instructions/wm/instruction_b1_s4.png',
            'media/instructions/wm/instruction_b1_s5.png',
            'media/instructions/wm/instruction_b1_s6.png',
            'media/instructions/wm/instruction_b2_s1.png',
            'media/instructions/wm/instruction_b2_s2.png',
            'media/instructions/wm/instruction_b2_s3.png',
            'media/instructions/wm/instruction_b2_s4.png',
            'media/instructions/wm/instruction_b2_s5.png'
        ],
        audio: [
            'media/audio/test.mp3'
        ],
        video: [
            'media/instructions/wm/wm_task_video.mp4'
        ],
        show_detailed_errors: true,
        show_progress_bar: true,
        loading_message: '<div>The experiment is being loaded ...</div>',
    }
    timeline.push(preload);
}

function initialiseExperiment() {
    var welcomeScreen = {
        type: jsPsychHtmlButtonResponse,
        stimulus: function() { return '<div style="font-size:25px;"><b>Is your anonymous ID: </b> "' + jsPsych.data.getURLVariable('participant') + '"?<br><br>If so, please press [Next] to continue.<br><br>If your ID is not right, please contact the researchers via email at pscmwa@leeds.ac.uk.<br><br></div>' },
        choices: ['Next'],
        stimulus_duration: null,
        response_ends_trial: true,
        on_finish: function() {
            username = jsPsych.data.getURLVariable('participant');
            jsPsych.data.addProperties({ ppid: username });
        }
    };
    timeline.push(welcomeScreen)
}

function performCalibration() {
    var preCalibration = {
        type: jsPsychHtmlButtonResponse,
        stimulus: '<div style="font-size:25px;">The next few screens will calibrate the experiment.<br><br>Please press [Next] to continue.<br><br></div>',
        choices: ['Next'],
        stimulus_duration: null,
        response_ends_trial: true
    };
    timeline.push(preCalibration)

    /* measure credit card */
    var creditCard = {
        type: jsPsychResize,
        item_width: 86.60,
        item_height: 53.98,
        prompt: '<div style="font-size:25px;"><br><br>To try and approximate the size of your screen in "real world" coordinates, please put a standard size credit/debit card on the screen. Then using your mouse, click and drag the bottom right corner to resize the box until it is the same size as the credit/debit card. Please be as accurate as possible.<br><br><div>',
        pixels_per_unit: 6.522,
        on_finish: function() {
            pxPerMillimeter = jsPsych.data.get().last(1).values()[0]["final_width_px"] / 86.60;
            jsPsych.data.addProperties({ px_per_mm: pxPerMillimeter });
            console.log(pxPerMillimeter);
            stimuliDisplay.resize(pxPerMillimeter);
        }
    };
    timeline.push(creditCard);

    /* get permission to use microphone and record a clip to calibrate audio volume */
    if (!debug) {
        var speakerCheck = {
            type: jsPsychAudioButtonResponse,
            stimulus: "media/audio/test.mp3",
            choices: ['Continue'],
            prompt: '<div style="font-size:25px;"><br><br>Can you hear the sound of a river?<br><br>Make sure your speakers are on, and adjust your speaker volume until the audio is at a comfortable hearing level. When you can hear the sound of the river comfortably, press [Continue].<br><br></div>',
            response_ends_trial: true
        }
        timeline.push(speakerCheck);
    }

    var initMic = {
        type: jsPsychInitializeMicrophone
    };
    timeline.push(initMic);

    var preMic = {
        type: jsPsychHtmlButtonResponse,
        stimulus: '<div style="font-size:25px;">On the next page, you will be asked to record yourself saying "hello" to calibrate the volume of the microphone.<br><br>When you have recorded it, listen to the playback.<br>If you can hear yourself, click [continue].<br>If you can\'t hear yourself, increase the volume of your microphone and click [Record again]<br><br></div>',
        choices: ['Next'],
        stimulus_duration: null,
        response_ends_trial: true
    };
    timeline.push(preMic)

    var calibrateMic = {
        type: jsPsychHtmlAudioResponse,
        stimulus: '<div style="font-size:25px;"><br>Please say "hello" now, and click [Finished] after.<br></div>',
        allow_playback: true,
        recording_duration: 10000,
        show_done_button: true,
        done_button_label: "Finished",
        playback_text: "Please press the play button to listen to the recording you just made. <br>If you can hear yourself in the recording, click [Finished]. <br>If you can't hear yourself, increase your microphone volume, and then click [Record again] to make the recording again."
    };
    timeline.push(calibrateMic);

    var postMic = {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: '<div style="font-size:25px;">Calibration Complete!</div>',
        choices: "NO_KEYS",
        trial_duration: 2000
    };
    timeline.push(postMic)
}

/* define instructions */
function generateFirstBlockInstructions() {
    return {
        type: jsPsychInstructions,
        pages: [
            '<img src="media/instructions/wm/instruction_b1_s1.png" width="900" height="630"></img>' + '<div style="font-size:25px;"><br></div>',
            '<img src="media/instructions/wm/instruction_b1_s2.png" width="900" height="630"></img>' + '<div style="font-size:25px;"><br></div>',
            '<img src="media/instructions/wm/instruction_b1_s3.png" width="900" height="630"></img>' + '<div style="font-size:25px;"><br></div>',
            '<img src="media/instructions/wm/instruction_b1_s4.png" width="900" height="630"></img>' + '<div style="font-size:25px;"><br></div>',
            '<img src="media/instructions/wm/instruction_b1_s5.png" width="900" height="630"></img>' + '<div style="font-size:25px;"><br></div>',
            '<img src="media/instructions/wm/instruction_b1_s6.png" width="900" height="630"></img>' + '<div style="font-size:25px;"><br></div>',
            'Please watch the video below for an example of a trial and the speed at which you should repeat the number.<br><br><video width="900" height="630" controls> <source src="media/instructions/wm/wm_task_video.mp4" type="video/mp4"></video>' + '<div style="font-size:25px;"><br></div>'
        ],
        show_clickable_nav: true
    }
}

function generateSecondBlockInstructions() {
    return {
        type: jsPsychInstructions,
        pages: [
            '<img src="media/instructions/wm/instruction_b2_s1.png" width="900" height="630"></img>' + '<div style="font-size:25px;"><br></div>',
            '<img src="media/instructions/wm/instruction_b2_s2.png" width="900" height="630"></img>' + '<div style="font-size:25px;"><br></div>',
            '<img src="media/instructions/wm/instruction_b2_s3.png" width="900" height="630"></img>' + '<div style="font-size:25px;"><br></div>',
            '<img src="media/instructions/wm/instruction_b2_s4.png" width="900" height="630"></img>' + '<div style="font-size:25px;"><br></div>',
            '<img src="media/instructions/wm/instruction_b2_s5.png" width="900" height="630"></img>' + '<div style="font-size:25px;"><br></div>'
        ],
        show_clickable_nav: true
    }
}

function generateAllTrials() {
    function getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function getRandomJitter() {
        return [
            (Math.random() * 2) - 1,
            (Math.random() * 2) - 1
        ]
    }

    function generateRandomAngles(num) {
        function checkAngleDifference(angle1, angle2) {
            return 180 - Math.abs(Math.abs(angle1 - angle2) - 180)
        }

        let random_angles = [];
        let unallowable_range = 20;

        for (let i = 0; i < num; i++) {
            while (true) {
                temp_angle = getRandomInt(0, 360);
                let too_close = false;

                for (let j = 0; j < random_angles.length; j++) {
                    let angle_difference = checkAngleDifference(temp_angle, random_angles[j]);
                    if (angle_difference < unallowable_range) {
                        too_close = true;
                        break;
                    }
                }

                if (!too_close) {
                    random_angles.push(temp_angle);
                    break;
                }
            }
        }

        for (let i = 0; i < random_angles.length; i++) {
            random_angles[i] = random_angles[i] * Math.PI / 180;
        }

        return random_angles;
    }

    var spaceWhenReady = {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: '<div style="font-size:25px;">Press Spacebar When Ready</div>',
        choices: " ",
        response_ends_trial: true
    };

    var pretrial = {
        type: jsPsychPretrialResponse,
        shapes: function() { return jsPsych.timelineVariable('shapes') },
        colors: function() { return jsPsych.timelineVariable('colors') },
        locationAngles: function() { return jsPsych.timelineVariable('location_angles') },
        jitters: function() { return jsPsych.timelineVariable('jitters') },
        data: {
            test_part: 'test'
        }
    };

    var colorwheel = {
        type: jsPsychColorwheelResponse,
        shapes: function() { return jsPsych.timelineVariable('shapes') },
        target_angle: function() { return jsPsych.timelineVariable('angles')[jsPsych.timelineVariable('probe')] },
        locationAngles: function() { return jsPsych.timelineVariable('location_angles') },
        jitters: function() { return jsPsych.timelineVariable('jitters') },
        probe: function() { return jsPsych.timelineVariable('probe') }, 
        probeByLocation: function() { return jsPsych.timelineVariable('probe_by_location') }, 
        data: {
            test_part: 'test'
        }
    }

    function generateTrial(trialShapes, trialLocationAngles, trialProbe, trialCondition, experimentPart, probeByLocation) {
        let currentShapes = trialShapes;
        let currentLocationAngles = trialLocationAngles;
        let currentProbe = trialProbe;
        let currentCondition = trialCondition;
        let currentAngles = generateRandomAngles(trialShapes.length);

        let currentColors = [];
        for (const angle of currentAngles) {
            currentColors.push(cieColors.angleToRGB(angle));
        }

        let currentJitters = Array.from({length: trialShapes.length}, (() => getRandomJitter()));
        let currentProbeByLocation = probeByLocation;

        let testProcedure = {
            timeline: [spaceWhenReady, pretrial, colorwheel],
            repetitions: 1,
            timeline_variables: [{
                condition: currentCondition,
                experiment_part: experimentPart,
                shapes: currentShapes,
                angles: currentAngles,
                colors: currentColors,
                probe: currentProbe,
                location_angles: currentLocationAngles,
                probe_by_location: currentProbeByLocation,
                jitters: currentJitters
            }],
            data: {
                condition: function() { return jsPsych.timelineVariable('condition') },
                experiment_part: function() { return jsPsych.timelineVariable('experiment_part') },
                shapes: function() { return jsPsych.timelineVariable('shapes') },
                angles: function() { return jsPsych.timelineVariable('angles') },
                colors: function() { return jsPsych.timelineVariable('colors') },
                probe: function() { return jsPsych.timelineVariable('probe') },
                locationAngles: function() { return jsPsych.timelineVariable('location_angles') },
                probeByLocation: function() { return jsPsych.timelineVariable('probe_by_location') },
                jitters: function() { return jsPsych.timelineVariable("jitters") }
            },
            randomize_order: false
        }

        return testProcedure;
    }

    // make unequal value conditions
    function generateBlock(numTrials, experimentPart, probeByLocation, nItems) {
        currentBlock = []

        // make equal value conditions
        for (let i = 0; i < numTrials; i++) {
            let probe = Array.from({length: nItems}, (v, i) => i);
            shuffleArray(probe);
            probe = probe.slice(0, 1);

            let trialShapes = Array(nItems).fill("square");
            if (!probeByLocation)
            {
                trialShapes = availableShapes.slice()
                shuffleArray(trialShapes);
                trialShapes = trialShapes.slice(0, nItems);
            }

            let trialLocationAngles = locationAngles.slice()
            shuffleArray(trialLocationAngles);
            trialLocationAngles = trialLocationAngles.slice(0, nItems);

            currentBlock.push(generateTrial(trialShapes, trialLocationAngles, probe, 'EqualValue', experimentPart, probeByLocation));
        }

        shuffleArray(currentBlock);
        currentBlock = currentBlock.slice(0, numTrials);

        return currentBlock;
    }

    // generate all trials //

    // generate test trials
    var breaks = {
        type: jsPsychHtmlButtonResponse,
        stimulus: "You are currently in a break!\nPress the [Ready] button to continue.",
        choices: ['Ready'],
        stimulus_duration: null,
        response_ends_trial: true
    };

    function generateBeforePracticeMessage(numItems, probeByLocation) {
        return {
            type: jsPsychHtmlButtonResponse,
            stimulus: `<div style="font-size:25px;">Please remember to repeat the two digit number aloud at a speed of two repetitions per second until you are asked to report the remembered colour. Compliance with this instruction will be checked. <br><br>In this block of trials, there will be ${numItems} items shown. <br><br>First, let\'s do some practice trials. Press [Next] to start.<br><br></div>`,
            choices: ['Next'],
            response_ends_trial: true
        };
    }

    function generateBeforeBlockMessage(numItems, probeByLocation) {
        return {
            type: jsPsychHtmlButtonResponse,
            stimulus: `<div style="font-size:25px;">You will complete the test trials now<br><br> Please remember to repeat the two digit number aloud at a speed of two repetitions per second until you are asked to report the remembered colour. Compliance with this instruction will be checked. <br><br>In this block of trials, there will ${numItems} items shown.<br><br></div>`,
            choices: ['Next'],
            response_ends_trial: true
        };
    }

    function generateSingleBlock(numTrials, experimentPart, numItems, probeByLocation) {
        return [
            generateBeforeBlockMessage(numItems, probeByLocation),
            generateBlock(numTrials, experimentPart, probeByLocation, numItems),
        ];
    }

    var trials = [
        generateFirstBlockInstructions(),
        generateSingleBlock(numPracticeTrials, "practice", 4, true),
        generateSingleBlock(numberRepeats, "test", 4, true),
        breaks,
        generateSingleBlock(numberRepeats, "test", 5, true),
        // breaks,
        // generateSingleBlock(numberRepeats, "test", 6, true),
        breaks,
        generateSecondBlockInstructions(),
        generateSingleBlock(numPracticeTrials, "practice", 4, false),
        generateSingleBlock(numberRepeats, "test", 4, false),
        breaks,
        generateSingleBlock(numberRepeats, "test", 5, false),
        // breaks,
        // generateSingleBlock(numberRepeats, "test", 6, false),
    ];
    trials = trials.flat(Infinity);

    for (var trial of trials) {
        timeline.push(trial);
    }
}

// generate survey
function generatePostExperimentSurvey() {
    var survey = {
        type: jsPsychSurveyText,
        preamble: 'Thank you for completing the experiments! Please complete this questionnaire to finish.',
        questions: [{
            prompt: "Did you use any stategies to perform the task and maximise your score? Please type them in the box below.",
            placeholder: "Enter any strategies used here ...",
            required: true
        }],
        data: {
            test_part: 'survey'
        }
    };
    timeline.push(survey);
}

// generate debrief screen
function generateDebriefScreen() {
    var debrief = {
        type: jsPsychHtmlButtonResponse,
        stimulus: '<div style="font-size:25px;">Thank you for your participation.<br><br>Press [Next] to complete the experiment.<br><br></div>',
        choices: ['Next'],
        stimulus_duration: null,
        response_ends_trial: true
    };
    timeline.push(debrief)
}

// finish connection with pavlovia.org
function finalisePavlovia() {
    var pavlovia_finish = {
        type: jsPsychPavlovia,
        command: "finish",
        participantId: username,
        completedCallback: function() {
            alert('Data successfully submitted! You can now close the experiment.');
        },
        dataFilter: function(data) {
            return jsPsych.data.get().filter([
                { test_part: 'test' },
                { test_part: 'spot_the_word' },
                { test_path: 'survey' }
            ]).csv();
        },
    };
    timeline.push(pavlovia_finish);

    var finished = {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: '<div style="font-size:25px;">Your data has finished uploading! You can close the experiment now. Thank you for your participation.</div>',
        choices: "NO_KEYS",
        trial_duration: 10000
    };
    timeline.push(finished);
}

function finaliseExperiment() {
    var saveData = {
        type: jsPsychPipe,
        action: "save",
        experiment_id: "VAuJ4xgrbes6",
        filename: function() { return `${username}.csv` },
        data_string: ()=>jsPsych.data.get().csv()
    };
    timeline.push(saveData);

    if (platform == "prolific") {
        var finished = {
            type: jsPsychHtmlKeyboardResponse,
            stimulus: `<p>You've finished the last task. Thanks for participating!</p>
              <p>This study aims to investigate the involvement of a brain region called the Hippocampus in Working Memory, our ability to remember information over short durations. Your data will be used to set the task difficulty to compare healthy 'controls' against individuals with Hippocampal damage.</p>
              <p><a href="https://app.prolific.com/submissions/complete?cc=77E7D184">Click here to return to Prolific and finalise your submission.</a>. If the link does not work, the completion code is 77E7D184.</p>`,
            choices: "NO_KEYS"
          }
        timeline.push(finished);
    } else {
        var finished = {
            type: jsPsychHtmlKeyboardResponse,
            stimulus: '<div style="font-size:25px;">Your data has finished uploading! You can close the experiment now. Thank you for your participation.</div>',
            choices: "NO_KEYS"
        };
        timeline.push(finished);
    }
}


// set up 
// if (!debug) initialisePavlovia();
initialiseExperiment();
preloadImages();
performCalibration();

// generate the WM experiment
generateAllTrials();

// post experiment survey
generatePostExperimentSurvey();

// end experiment
generateDebriefScreen();
// if (!debug) finalisePavlovia();
finaliseExperiment();
