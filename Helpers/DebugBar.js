
// @input bool advanced = true
// @input Component.Text debugText  {"showIf": "advanced"}
// @input Component.Text debugValue  {"showIf": "advanced"}
// @input Component.Image debugImage  {"showIf": "advanced"}

script.debugMaterial = script.debugImage.mainMaterial.clone();
script.debugImage.mainMaterial = script.debugMaterial;

script.api.updateValue = updateValue;
script.api.updateText = updateText;

function updateValue(value) {
    if (script.debugImage && script.debugMaterial) {
        script.debugMaterial.mainPass.percentage = value;
    } else {
        debugPrint("Please link debug image with material");
    }

    if (script.debugValue) {
        script.debugValue.text = value.toFixed(3).toString();
    } else {
        debugPrint("Please link debugValue Text Component");
    }
}

function updateText(text) {
    if (script.debugText) {
        script.debugText.text = text;
    } else {
        debugPrint("Please link debugText Text Component");
    }
}

//helper functions
function debugPrint(text) {
    print("Debug Panel:" + text);
}