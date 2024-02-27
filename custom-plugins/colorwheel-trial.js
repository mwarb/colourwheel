var jsPsychColorwheelResponse = (
    function(jspsych) {
        "use strict";

        const info = {
            name: "colorwheel-response",
            parameters: {
                shapes: {
                    type: jspsych.ParameterType.STRING,
                    array: true,
                    pretty_name: 'Trial shapes',
                    default: 'square',
                    description: 'The shapes that the participant needs to recall the colour of.'
                },
                target_angle: {
                    type: jspsych.ParameterType.FLOAT,
                    pretty_name: 'Probed color angle',
                    default: null,
                    description: 'The color angle of the probed shape.'
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
                },
                probe: {
                    type: jspsych.ParameterType.INT,
                    array: false,
                    pretty_name: 'Probe index',
                    default: null,
                    description: 'The index of the probed shape'
                },
                probeByLocation: {
                    type: jspsych.ParameterType.BOOL,
                    array: false,
                    pretty_name: 'Probe type',
                    default: null,
                    description: 'Whether the probe will be by location (true) or by shape (false)'
                }
            },
        };

        /**
         * **colorwheel-response**
         *
         * Display a colorwheel and require users to select a point in the wheel.
         *
         * @author Matthew Warburton
         */
        class ColorwheelResponsePlugin {
            constructor(jsPsych) {
                this.jsPsych = jsPsych;
            }

            trial(display_element, trial) {
                function drawColorwheel() {
                    startTime = performance.now();
                    const random_rotation = Math.random() * 2 * Math.PI;
                    var hw = new HueWheel(display_element, trial.shapes, trial.target_angle, trial.locationAngles, trial.probe, trial.probeByLocation, random_rotation, onWheelClick, trial.jitters);
                }

                function onWheelClick(hueResponse) {
                    response.rt = hueResponse['response_time'] - startTime;
                    response.response_angle = hueResponse['angle'];
                    response.target_angle = hueResponse['target'];
                    response.random_rotation = hueResponse['rotation'];
                    response.response_error = hueResponse['error'];

                    end_trial();
                }

                var startTime;
                let response = {
                    rt: null,
                    response_angle: null,
                    target_angle: null,
                    random_rotation: null,
                    response_error: null
                };

                drawColorwheel();

                // function to end trial when it is time
                // let end_trial = function() { // This causes an initialization error at stim.audio.addEventListener('ended', end_trial); 
                // function end_trial(){
                const end_trial = () => {
                    // gather the data to store for the trial
                    var trial_data = {}
                    trial_data['rt'] = response.rt;
                    trial_data['response_angle'] = response.response_angle;
                    trial_data['target_angle'] = response.target_angle;
                    trial_data['random_rotation'] = response.random_rotation;
                    trial_data['response_error'] = response.response_error;

                    // clear the display
                    display_element.innerHTML = '';

                    // move on to the next trial
                    this.jsPsych.finishTrial(trial_data);
                }
            }
        }
        ColorwheelResponsePlugin.info = info;

        return ColorwheelResponsePlugin;
    })(jsPsychModule);