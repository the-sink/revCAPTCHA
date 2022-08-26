const assert = require('assert');
const { test } = require('test');
const glob = require('glob');
const path = require('path');

// Currently only tests challenges

glob.sync('./challenges/*.js').forEach((file) => {
    let challenge = require(path.resolve(file));
    let filename = path.basename(file);

    test(`${filename} info dict integrity`, (t) => {
        assert.ok(challenge.info, 'no info dict');
        assert.ok(challenge.info.name, 'no name in info dict');
        assert.ok(challenge.info.description, 'no description in info dict');
        assert.ok(challenge.info.timeout, 'no timeout in info dict');
    });

    test(`${filename} challenge generation`, (t) => {
        let generated_problem = challenge.generate();
        let data = generated_problem[0];
        let answer = generated_problem[1];

        assert.ok(data.media, 'no media returned in generate()');
        assert.ok(data.instructions || challenge.info.instructions, 'no instructions in challenge info or generate() response');
        assert.ok(!data.answer, 'an answer is given in the problemData (do NOT do this, problemData is sent to the client)');
        assert.ok(answer, 'no answer given');
    })
});