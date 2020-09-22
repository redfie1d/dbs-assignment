'use strict';

const Car = require('./Car.js');

class CarPark {
  constructor() {
    this.maxSlots = 0;
    this.slots = [];
    this.entryPoints = [];
  }

  // n = 30, entryPoints = [10, 20]
  createCarPark(n, entryPoints) {
    this.maxSlots = n;
    for (let i = 0; i < n; i++) {
      this.slots.push(null);
    }
    this.entryPoints = entryPoints;

    // Prevent entry points from being available slots
    entryPoints.forEach((entryPoint) => {
      this.slots[entryPoint - 1] = 'Entry point';
    });
  }

  park(vehicleId, vehicleColour, entryPoint) {
    // Check entry point
    if (!this.entryPoints.includes(entryPoint)) {
      throw new Error('Invalid entry point');
    }

    const car = new Car(vehicleId, vehicleColour);
    const allocatedSlotIndex = this.getNearestAvailableSlotIndex(entryPoint);
    this.slots[allocatedSlotIndex] = car;
    return `Car is allocated lot ${allocatedSlotIndex + 1}`;
  }

  getNearestAvailableSlotIndex(entryPoint) {
    let entryPointIndex = entryPoint - 1;
    let leftSlotIndex = entryPointIndex - 1;
    let rightSlotIndex = entryPointIndex + 1;
    let availableSlotIndex = -1;
    while (
      (availableSlotIndex === -1 && leftSlotIndex >= 0) ||
      rightSlotIndex < this.maxSlots
    ) {
      if (leftSlotIndex >= 0) {
        if (this.slots[leftSlotIndex] === null) {
          availableSlotIndex = leftSlotIndex;
          break;
        }
        leftSlotIndex -= 1;
      }

      if (rightSlotIndex < this.maxSlots) {
        if (this.slots[rightSlotIndex] === null) {
          availableSlotIndex = rightSlotIndex;
          break;
        }
        rightSlotIndex += 1;
      }
    }

    if (availableSlotIndex == -1) {
      throw new Error('Parking lot is full.');
    }
    return availableSlotIndex;
  }

  executeVehicleFunction(argumentType, argumentValue, returnValArr) {
    if (argumentType === 'vehicle_colour') {
      if (returnValArr[0] === 'vehicle_id') {
        return this.getAllVehicleIdsByColour(argumentValue);
      } else if (returnValArr[0] === 'slot_number') {
        return this.getAllSlotNumbersWithColour(argumentValue);
      }
    } else if (argumentType === 'vehicle_id') {
      if (returnValArr[0] === 'slot_number') {
        return this.getSlotNumberByVehicleId(argumentValue);
      }
    }
  }

  getAllVehicleIdsByColour(colour) {
    let resultStr = `{“data”: {“vehicle”:[ `;
    let vehicleColourDoesNotExist = true;

    this.slots.forEach((slot) => {
      if (slot instanceof Car) {
        if (slot.colour === colour) {
          vehicleColourDoesNotExist = false;
          resultStr += `{"vehicle_id":"${slot.numberPlate}"}, `;
        }
      }
    });

    if (vehicleColourDoesNotExist)
      throw new Error(`Vehicles with colour ${colour} does not exist.`);

    resultStr = `${resultStr.substring(0, resultStr.length - 2)} ] }}`;

    return resultStr;
  }

  getAllSlotNumbersWithColour(colour) {
    let resultStr = `{“data”: {“vehicle”:[ `;
    let vehicleColourDoesNotExist = true;

    for (let i = 0; i < this.maxSlots; i++) {
      if (this.slots[i] instanceof Car) {
        if (this.slots[i].colour === colour) {
          vehicleColourDoesNotExist = false;
          resultStr += `{"slot_number":"${i + 1}"}, `;
        }
      }
    }

    if (vehicleColourDoesNotExist)
      throw new Error(`Vehicles with colour ${colour} does not exist.`);

    resultStr = `${resultStr.substring(0, resultStr.length - 2)} ] }}`;

    return resultStr;
  }

  getSlotNumberByVehicleId(vehicleId) {
    let resultStr = `{“data”: {“vehicle”:`;
    let vehicleIdDoesNotExist = true;

    for (let i = 0; i < this.maxSlots; i++) {
      if (this.slots[i] instanceof Car) {
        if (this.slots[i].numberPlate === vehicleId) {
          vehicleIdDoesNotExist = false;
          resultStr += `{"slot_number":"${i + 1}" }, `;
        }
      }
    }

    if (vehicleIdDoesNotExist) throw new Error(`${vehicleId} does not exist.`);

    resultStr = `${resultStr.substring(0, resultStr.length - 2)} }}`;

    return resultStr;
  }

  executeSlotFunction(argumentType, argumentValue, returnValArr) {
    if (argumentType === 'slot_number') {
      const vehicle = this.getVehicleBySlot(argumentValue);
      let resultStr = `{“data”: {"slot":`;

      if (returnValArr.length > 1) {
        resultStr += `{"vehicle_id":"${vehicle.numberPlate}", "vehicle_colour":"${vehicle.colour}"} `;
      } else if (returnValArr[0] === 'vehicle_id') {
        resultStr += `{"vehicle_id":"${vehicle.numberPlate}"} `;
      } else if (returnValArr[0] === 'vehicle_colour') {
        resultStr += `{"vehicle_colour":"${vehicle.colour}"} `;
      }

      resultStr = `${resultStr.substring(0, resultStr.length - 1)} }}`;

      return resultStr;
    }
  }

  getVehicleBySlot(slot) {
    if (slot < 1 || slot > this.maxSlots) {
      throw new Error(`Slot Number ${slot} does not exist.`);
    }

    if (this.slots[slot - 1] instanceof Car) {
      return this.slots[slot - 1];
    } else {
      throw new Error(`Slot Number ${slot} does not have a vehicle.`);
    }
  }

  displaySlots() {
    return this.slots.toString();
  }
}

module.exports = CarPark;
