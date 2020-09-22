const fs = require('fs');
const chalk = require('chalk');
const readLine = require('readline');

let commandLineInputs = process.argv; // processing command line inputs
let interactiveMode = false;

// Create & Intialise CarPark
const CarPark = require('./CarPark.js');
const cp = new CarPark();
cp.createCarPark(30, [10, 20]);

//--------------------------------------------------------------------------------------------------

if (commandLineInputs[commandLineInputs.length - 1].endsWith('.txt')) {
  interactiveMode = false;
  fs.readFile(commandLineInputs[2], 'utf-8', function (err, data) {
    if (err) {
      console.log('Error in reading file');
    }
    var arr = data.split('\n');
    for (var i = 0; i < arr.length; i++) {
      processInputs(arr[i]);
    }

    // returning to console once all the inputs are processed
    process.exit(1);
  });
} else {
  interactiveMode = true;
  openInteractiveConsole();
}

//--------------------------------------------------------------------------------------------------

function openInteractiveConsole() {
  const prompts = readLine.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false,
  });

  // option for user to enter commands
  if (interactiveMode) {
    prompts.question('Input: ', function (data) {
      processInputs(data);
    });
  }
}

//--------------------------------------------------------------------------------------------------

function processInputs(input) {
  try {
    function inputIsValid(input) {
      input = input.replace(/\s/g, '');
      // Check curly braces
      let stack = [],
        noOfObjs = 1;
      for (let i = 0; i < input.length; i++) {
        let c = input.charAt(i);
        if (c === '{') {
          stack.push(c);
        }
        if (c === '}') {
          stack.pop();
          noOfObjs--;
        }
        if (c === ':') {
          if (input.charAt(i + 1) === '{') {
            noOfObjs++;
          }
        }
        if (c === '(') {
          stack.push(c);
          noOfObjs++;
        }
        if (c === ')') {
          stack.pop();
        }
      }

      return stack.length === 0 && noOfObjs === 0;
    }

    if (!inputIsValid(input)) {
      throw new Error(`Invalid input`);
    }

    if (input.includes('new_vehicle')) {
      input = input.replace(/\s/g, '');
      const properties = ['vehicle_id', 'vehicle_colour', 'entry_point'];
      let indexOfVehicleId = input.indexOf(properties[0]);
      let indexOfVehicleColour = input.indexOf(properties[1]);
      let indexOfEntryPoint = input.indexOf(properties[2]);
      let lastIndex = input.indexOf('}', indexOfEntryPoint);
      let vehicleId = input.substring(
        indexOfVehicleId + properties[0].length + 2,
        indexOfVehicleColour - 2
      );
      let vehicleColour = input.substring(
        indexOfVehicleColour + properties[1].length + 2,
        indexOfEntryPoint - 2
      );
      let entryPoint = parseInt(
        input.substring(indexOfEntryPoint + properties[2].length + 1, lastIndex)
      );
      console.log(
        chalk.yellow.bold(cp.park(vehicleId, vehicleColour, entryPoint))
      );
    } else if (input.includes('vehicle(')) {
      input = input.replace(/\s/g, '');
      let argumentSubStr = input.substring(
        input.indexOf('(') + 1,
        input.indexOf(')')
      );
      let argumentType = argumentSubStr.substring(
        0,
        argumentSubStr.indexOf(':')
      );
      let argumentValue;
      if (argumentType === 'vehicle_colour' || argumentType === 'vehicle_id') {
        argumentValue = argumentSubStr.substring(
          argumentSubStr.indexOf(':') + 2,
          argumentSubStr.length - 1
        );
      }

      let returnValSubStr = input.substring(
        input.indexOf('){') + 2,
        input.length - 2
      );
      let returnValArr = returnValSubStr.split(' ');

      console.log(
        chalk.yellow.bold(
          cp.executeVehicleFunction(argumentType, argumentValue, returnValArr)
        )
      );
    } else if (input.includes('slot(')) {
      let originalInput = input;
      input = input.replace(/\s/g, '');

      let argumentSubStr = input.substring(
        input.indexOf('(') + 1,
        input.indexOf(')')
      );

      let argumentType = argumentSubStr.substring(
        0,
        argumentSubStr.indexOf(':')
      );

      let argumentValue;
      if (argumentType === 'slot_number') {
        argumentValue = argumentSubStr.substring(
          argumentSubStr.indexOf(':') + 1
        );
      }

      let returnValSubStr = originalInput.substring(
        originalInput.indexOf(') {') + 3,
        originalInput.length - 2
      );
      let returnValArr = returnValSubStr.split(' ');

      console.log(
        chalk.yellow.bold(
          cp.executeSlotFunction(argumentType, argumentValue, returnValArr)
        )
      );
    }
  } catch (err) {
    console.log(chalk.red.bold(err.message));
  }
}
