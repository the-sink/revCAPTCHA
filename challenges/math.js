exports.info = {
    name: "Math",
    description: "Provides a random set of math expressions that must be solved. The answer to the problem is the sum of the answer of all expressions combined.",
    timeout: 15
};

const operators = ["+", "-", "*", "/"];
const minExpressions = 2;
const maxExpressions = 12;

function createExpression(first, operator, second) {
    return `(${first} ${operator} ${second})`;
};

function randomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

function generateProblem() {
    let problem = "";
    let expressions = [];
    let len = randomInt(minExpressions, maxExpressions);

    for (let i = 0; i < len; i++) {
        let nested = Math.random() > 0.5;
        let firstExpression = createExpression(randomInt(1, 99), operators[randomInt(0, 3)], randomInt(1, 99));

        if (nested) {
            i += 1;
            let secondExpression = createExpression(randomInt(1, 99), operators[randomInt(0, 3)], randomInt(1, 99));
            expressions.push(createExpression(firstExpression, operators[randomInt(0, 3)], secondExpression));
        } else {
            expressions.push(firstExpression);
        }
    };

    for (let i = 0; i < expressions.length; i++) {
        problem += expressions[i];
        if (i != expressions.length - 1) {
            problem += " " + operators[randomInt(0, 3)] + " ";
        };
    };
    
    return problem;
};

exports.generate = () => {
    let problemData = {
        instructions: "Provide the sum of all listed expressions combined, as a single integer (round your result).",
        media: ""
    };

    let numProblems = randomInt(2, 4);
    let problems = [];
    let answer = 0;

    for (let i = 0; i < numProblems; i++) {
        let thisProblem = generateProblem();
        problems.push(thisProblem);
        answer += eval(thisProblem);
    };

    answer = Math.round(answer);
    problemData.media = problems.join('\n');
    
    return [problemData, answer];
};