// ClassificationExampleHelper.js
// Version: 0.0.1
// Event: Lens Initialized
// Description: This is one of the singleclass classification helper scripts that shows text when the class is found or lost

//@ui {"widget":"separator"}
// @input Component.Text text
// @input string[] channelText

if (!script.text) {
    debugPrint("Warning, Text component is not set");
    return;
}

script.api.onFound = function(foundChannel) {
    script.text.text = script.channelText[foundChannel];
};

//script.api.onLost = function(lostChannel) {
//    if(lostChannel == script.channel) {
//        script.text.text = "Searching...";
//    }
//};

function debugPrint(text) {
    print("ClassificationExampleHelper: " + text);
}
