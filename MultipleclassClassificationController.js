// -----JS CODE-----
// SingleclassClassificationController.js
// Version: 0.0.1
// Event: Lens Initialized
// Description: Script that makes a decision whether certain class can de considered found or lost based on the probability output of ml component
// Allows to call corresponding callbacks

// @input Component.MLComponent mlComponent 
// @input string outputName {"hint": "Output placeholder name of your Ml model asset"}
// @input int classIndex = 0 {"hint" : "This is an index of desired class in your neural network output"}
//@ui {"widget":"separator"}


// @input float threshold = 0.5  {"widget" : "slider" , "min" : "0", "max" : "1" ,"step" : "0.01", "hint": "If probability is bigger than this value - class is considered as found, if less - as lost"}
//@ui {"widget":"separator"}

//@ui {"label":"Callbacks"}
//@input Component.ScriptComponent[] scriptsWithCallbacks {"hint": "If these scripts have function script.api.onFound or script.api.onLost they will be called correspondingly"}

//@ui {"widget":"separator"}
// @input bool showDebug
// @input Component.ScriptComponent debugScoreBar {"showIf" : "showDebug"}

//@ui {"widget":"separator"}
//@input bool optional
//@input SceneObject loader {"showIf" : "optional"}

//probability parameters
var smoothCoef = 0.1;
var delta = 0.1;

var minThresholdProb = script.threshold - delta;
var maxThresholdProb = script.threshold + delta;

var prevProbabilities = [1.0, 1.0, 1.0, 1.0];

var State = { NONE: 0, FOUND: 1, LOST: 2 };
var states = [State.NONE, State.NONE, State.NONE, State.NONE];

var outputData;

if (checkInputs()) {
    script.mlComponent.onLoadingFinished = wrapFunction(script.mlComponent.onLoadingFinished, onLoadingFinished);
}


function onLoadingFinished() {
    //initializing output data reference
    var output;
    try {
        output = script.mlComponent.getOutput(script.outputName);
    } catch (e) {
        debugPrint(e + ". Please specify correct output name of your model");
        return;
    }
    outputData = output.data;
    if (script.classIndex < 0 || states.length != outputData.length) {
        debugPrint("Error, class index is outside of range");
        return;
    }

    if (script.loader) {
        script.loader.enabled = false;
    }
    script.createEvent("UpdateEvent").bind(onUpdate);
}

function onUpdate() {
    
    var softMaxProbabilities = softMax(outputData); 
    
    var smoothedSoftMaxProbabilities = softMaxProbabilities.map((prob, channel) => prevProbabilities[channel] + smoothCoef * (prob - prevProbabilities[channel]));

    var maxProbability = Math.max(...smoothedSoftMaxProbabilities);

    var maxChannelIndex = smoothedSoftMaxProbabilities.indexOf(maxProbability);

    states.forEach((state, channel) => {
        if (maxProbability < minThresholdProb && state != State.LOST) {
            state = State.LOST;
            invokeOnLostCallbacks(channel);
            invokeOnFoundCallbacks(3);
        } else if ((channel != maxChannelIndex || smoothedSoftMaxProbabilities[channel] < minThresholdProb) && state != State.LOST) {
            state = State.LOST;
            invokeOnLostCallbacks(channel);
        } else if (channel == maxChannelIndex && smoothedSoftMaxProbabilities[channel] > maxThresholdProb && state != State.FOUND) {
            state = State.FOUND;
            invokeOnFoundCallbacks(channel);
        }
    })

    prevProbabilities = smoothedSoftMaxProbabilities;

    if (script.showDebug && script.debugScoreBar && script.debugScoreBar.api.updateValue) {
        script.debugScoreBar.api.updateValue(smoothedSoftMaxProbabilities[script.classIndex]);
    }
}

function invokeOnFoundCallbacks(channel) {
    for (var i = 0; i < script.scriptsWithCallbacks.length; i++) {
        if (script.scriptsWithCallbacks[i] && script.scriptsWithCallbacks[i].api.onFound) {
            script.scriptsWithCallbacks[i].api.onFound(channel);
        }
    }
}

function invokeOnLostCallbacks(channel) {
    for (var i = 0; i < script.scriptsWithCallbacks.length; i++) {
        if (script.scriptsWithCallbacks[i] && script.scriptsWithCallbacks[i].api.onLost) {
            script.scriptsWithCallbacks[i].api.onLost(channel);
        }
    }
}

function checkInputs() {

    if (!script.mlComponent) {
        debugPrint("Error, ML Component is not set");
        return false;
    }

    if (script.showDebug) {
        if (!script.debugScoreBar) {
            debugPrint("debugScoreBar is not set");
            return false;
        }
    } else if (script.debugScoreBar) {
        script.debugScoreBar.getSceneObject().enabled = false;
    }
    return true;

}

function softMax(inputs) {
    var exponentSum = 0;
    
    inputs.forEach((input) => {
       exponentSum += Math.exp(input) 
    });

    const softMaxValues = inputs.map((input) => Math.exp(input)/exponentSum); 
    
    return softMaxValues;
}
//helper scripts

function debugPrint(text) {
    print("SingleclassClassificationHelper: " + text);
}

function wrapFunction(origFunc, newFunc) {
    if (!origFunc) {
        return newFunc;
    }
    return function() {
        origFunc();
        newFunc();
    };
}
