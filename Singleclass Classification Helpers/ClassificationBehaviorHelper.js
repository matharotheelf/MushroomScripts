// ClassificationBehaviorHelper.js
// Version: 0.0.1
// Event: Lens Initialized
// Description: This is one of the singleclass classification helper scripts that allows to send custom behavior script trigger when class is found or lost
// @ui {"label" : "Send Custom Behavior Triggers:"}

// @input string[] onFoundTriggers
// @input string[] onLostTriggers
// @input int channel


script.api.onFound = function(foundChannel) {
    if(foundChannel == script.channel) {
        callBehaviorArray(script.onFoundTriggers);
    }
};

script.api.onLost = function(lostChannel) {
    if(lostChannel == script.channel) {
        callBehaviorArray(script.onLostTriggers);
    }
};

function callBehaviorArray(arr) {
    if (!arr.length) {
        return;
    }
    
    for (var i = 0; i < arr.length; i++) {
        if (global.behaviorSystem) {
            global.behaviorSystem.sendCustomTrigger(arr[i]);    
        } else {
            print("ClassificationBehaviorHelper: ERROR, behaviorSystem not found. Please make sure at least one script is using Behavior.");
        }
    }
}

