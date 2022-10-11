(() => {
    //variable to hold previous variables used to prevent errors in global scope... darn closures
    const PREVIOUS_VARIABLES = [];
    
    //function that generates a unique ID, this is not my code
    function uuidv4() {
        return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
            (
                c ^
                (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
            ).toString(16)
        );
    }

    function executeJavaScript(code) {
        let executeElement = document.getElementById('executeCode');
        let codeOutputElement = document.getElementById('codeOutput');
        let scriptNode = document.createElement('script');
        let outputVariables = [];

        //remove current script element in DOM
        if (executeElement.hasChildNodes()) {
            executeElement.children[0].remove();
        }

        //splits code into an array by new lines
        let codeArray = code.trim().split(/\n+/);
        codeArray = codeArray.filter((line) => {
            //test if code is comment or empty line and filters it out
            if (!(line.includes('//') || line.trim().length === 0)) {
                return line;
            }
        });

        //tests if the code has any variables to watch for the output div in the HTML
        let codeToExecute = codeArray.map((line) => {
            if (/ = /.test(line)) {
                //"elegant" way to isolate the variable name from the line of code
                let variable = line.substring(line.indexOf(" ")).trim();
                variable = variable.split(" ")[0];
                outputVariables.push(variable);

                //checks to see if the variable has been used before so it doesn't have to redeclare it
                PREVIOUS_VARIABLES.includes(variable)
                ? line = `${line.substring(line.indexOf(" ")).trim()}`
                : PREVIOUS_VARIABLES.push(variable);
            }
            return line;
        });

        //reducer to return the codeToExecute array back into a single string with a way to update the table with the output 
        let executeReducer = (acc, curr, index, array) => {
            if (array.length - 1 === index) {
                let domUpdateCode = '';
                if (outputVariables.length > 0) {
                    //go through each variable and create table rows with data for them
                    outputVariables.forEach((v, i) => {
                        let id = uuidv4();
                        id = id.split('').filter(char => char !== '-').join('');
                        domUpdateCode += `let row${id} = document.createElement('tr');\nlet dataName${id} = document.createElement('td');\nlet dataValue${id} = document.createElement('td');\ndataName${id}.innerText = 'Value ${i + 1}:';\ndataValue${id}.innerText = ${v};\nrow${id}.appendChild(dataName${id});\nrow${id}.appendChild(dataValue${id});\ndocument.getElementById('codeOutput').appendChild(row${id});\n`
                    });
                }
                return `${acc}\n${curr}\n${domUpdateCode}`;
            }
            return `${acc}\n${curr}`;
        }

        scriptNode.innerHTML = codeToExecute.reduce(executeReducer);

        if (codeOutputElement.children.length > 0) {
            let len = codeOutputElement.children.length;
            for (let i = 0; i < len; i++) {
                codeOutputElement.children[0].remove();
            }
        }
        executeElement.appendChild(scriptNode);
    }

    function handleCopyCode(e) {
        e.preventDefault();
        let code = e.target.parentElement.children[0].innerText;
        document.getElementById('codeEditor').value = code;
    }

    function handleCompileCode(e) {
        e.preventDefault();
        let code = document.getElementById('codeEditor').value;

        code.trim().length > 0 ? executeJavaScript(code) : alert('Enter Valid Code!');
    }

    //generic function to bind events
    function bindEvent(element, func, event) {
        if (document.addEventListener) {
            element.addEventListener(event, func, "false");
        } else if (document.attachEvent) {
            element.attachEvent(`on${event}`, func);
        }
    }

    let javascriptBtn = document.getElementById('compileCode');
    let runCodeBtns = document.getElementsByClassName('run-code-btn');

    for (let i = 0; i < runCodeBtns.length; i++) {
        const element = runCodeBtns[i];
        bindEvent(element, handleCopyCode, 'click');
    }

    bindEvent(javascriptBtn, handleCompileCode, 'click');
})();