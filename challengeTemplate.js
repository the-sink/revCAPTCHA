exports.info = {
    name: "", // "Public-facing" name of the chalenge.
    description: "", // Description of what this challenge is/does. Not for instructions, and is not displayed to the user.
    instructions: "", // Instructions on how to complete the challenge problem, should NOT include the problem itself. Alternatively, build instructions in the problemData object in generate() if it needs to change.
    timeout: 15 // Length of time in seconds before the challenge is invalidated, should be set to a reasonable length or stored challenge keys will build up in memory.
};

exports.generate = () => { // Challenges shouldn't need to take any input variables
    let problemData = {
        //instructions: "", // If you don't include instructions in the exports info, ensure it exists in problemData at some point before being returned
        media: "" // Make sure the problem itself exists in problemData, either as text or some type of media file (image, audio, gif, etc). DO NOT set this to a constant variable, or the challenge will be useless
    };
    let answer = ""; // Determine answer in this function based on the generated problem, must be a string or number of some sort (basically anything that can be entered in a text box)

    return [problemData, answer]; // Return problemData and answer in this order
};