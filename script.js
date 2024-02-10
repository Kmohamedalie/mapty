'use strict';

// // create a global map variable
// let map, mapEvent;

// workout class 💪
class Workout {
  // date the workout happen
  date = new Date();
  id = Date.now() + ''.slice(-10);
  clicks = 0;

  constructor(coords, distance, duration) {
    this.coords = coords; // [lat, lng]
    this.distance = distance; // in km
    this.duration = duration; // in min
  }

  // method to show the workout type and date
  _setDescription() {
    // prettier-ignore
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
      months[this.date.getMonth()]
    } ${this.date.getDate()}`;
  }

  // number of clicks in each workout
  click() {
    this.clicks++;
  }
}

// Running class 🏃‍♀️
class Running extends Workout {
  type = 'running';

  constructor(coords, distance, duration, cadence) {
    // call the attribute that a common to the parent class
    super(coords, distance, duration);
    this.cadence = cadence;
    // this.type = 'running'
    this.calcPace(); //call the method calcPace in the constructor
    this._setDescription();
  }

  // pace calculation
  calcPace() {
    // min/km
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

// cycling class 🚴‍♀️
class Cycling extends Workout {
  type = 'cycling';

  constructor(coords, distance, duration, elevationGain) {
    // call the attribute that a common to the parent class
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    // this.type = 'cycling'
    this.calcSpeed(); // call the method calcSpeed in the constructor
    this._setDescription();
  }
  // speed calculation
  calcSpeed() {
    // km/h
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}
const run1 = new Running([39, -12], 5.2, 24, 178);
const cycling1 = new Cycling([39, -12], 27, 95, 523);
//console.log(run1, cycling1);

//////////////////////////////////////////////////////////
// Application Architecture
const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

// class App 📱
class App {
  //private instance properties
  #map;
  #mapZoomLevel = 13;
  #mapEvent;
  #workouts = [];

  // constructor lunches immediately by the load page
  constructor() {
    // Get user's position
    this._getPosition();

    // Get data from local storage
    this._getLocalStorage();

    // form to submit data
    // bind the  'this' keyword
    form.addEventListener('submit', this._newWorkout.bind(this)); // object from leaflet
    // change activity type running and cycling
    inputType.addEventListener('change', this._toggleElevationField);
    // move the map focus on the event performed location
    containerWorkouts.addEventListener('click', this._moveToPopup.bind(this));
  }

  // _getPosition()
  _getPosition() {
    // Get geolocation
    if (navigator.geolocation)
      // check if this exist
      // bind the 'this' keyword explicitly
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          // error
          alert('Could not get your position');
        }
      );
  }

  // _loadMap(position)
  _loadMap(position) {
    // success
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    console.log(`https://www.google.com/maps/@${latitude},${longitude}`);

    // create coordinates
    const coords = [latitude, longitude];

    // create map variable and add the latitude and longitude
    this.#map = L.map('map').setView(coords, this.#mapZoomLevel);
    // tiles can be used to change the theme
    L.tileLayer('https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    // Handling clicks on map
    this.#map.on('click', this._showForm.bind(this));

    // persist workout markers when there's data in the local storage
    this.#workouts.forEach(work => {
      this._renderWorkout(work);
      this._renderWorkoutMarker(work);
    });
  }

  // _showForm()
  _showForm(mapE) {
    this.#mapEvent = mapE;
    // show the form to input the mark-popup data
    form.classList.remove('hidden');
    // want the cursor to go to the distance section
    inputDistance.focus();
  }

  // _hideForm()
  _hideForm() {
    // Empty inputs
    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        '';

    // set form display to none
    form.computedStyleMap.display = 'none';
    // add the hidden class
    form.classList.add('hidden');
    // set the display after 1min
    setTimeout(() => (form.computedStyleMap.display = 'grid'), 1000);
  }

  // _toggleElevationField()
  _toggleElevationField() {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }

  // _newWorkout()
  _newWorkout(e) {
    // valid input arrow function
    const validInputs = (...inputs) =>
      inputs.every(inp => Number.isFinite(inp));

    // check if input values are greater than zero
    const allPositive = (...inputs) => inputs.every(inp => inp > 0);

    // prevent default behavior
    e.preventDefault();

    // Get data from the form
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const { lat, lng } = this.#mapEvent.latlng;
    let workout;

    // check if data is valid

    // If workout running, create running object
    if (type === 'running') {
      // change to number and assign to cadence
      const cadence = +inputCadence.value;
      //  Check if data is valid
      if (
        // !Number.isFinite(distance) ||
        // !Number.isFinite(duration) ||
        // !Number.isFinite(cadence)
        !validInputs(distance, duration, cadence) ||
        !allPositive(distance, duration, cadence)
      )
        return alert('Inputs have to be positive numbers!');

      workout = new Running([lat, lng], distance, duration, cadence);
    }

    // If workout cycling, create cycling object
    if (type === 'cycling') {
      const elevation = +inputElevation.value;
      //  Check if data is valid
      if (
        // !Number.isFinite(distance) ||
        // !Number.isFinite(duration) ||
        // !Number.isFinite(cadence)
        !validInputs(distance, duration, elevation) ||
        !allPositive(distance, duration)
      )
        return alert('Inputs have to be positive numbers!');
      workout = new Cycling([lat, lng], distance, duration, elevation);
    }

    // Add new object to workout array
    this.#workouts.push(workout);
    //console.log(workout);

    // Render workout on map as marker
    this._renderWorkoutMarker(workout);

    // Render workout on list
    this._renderWorkout(workout);

    // Hide form + clear input fields
    this._hideForm();

    // set local storage to all workouts
    this._setLocalStorage();
  }

  _renderWorkoutMarker(workout) {
    // add marker and popup
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          closeOnClick: false,
          autoClose: false,
          className: `${workout.type}-popup`, // workout type
        })
      )
      .setPopupContent(
        `${workout.type === 'running' ? '🏃‍♀️' : '🚴‍♀️'}${workout.description}`
      )
      .openPopup();
  }

  // call the method
  _renderWorkout(workout) {
    // dom manipulation of the html
    let html = `
          <li class="workout workout--${workout.type}" data-id=${workout.id}>
            <h2 class="workout__title">${workout.description}</h2>
            <div class="workout__details">
              <span class="workout__icon">${
                workout.type === 'running' ? '🏃‍♀️' : '🚴‍♀️'
              }</span>
              <span class="workout__value">${workout.distance}</span>
              <span class="workout__unit">km</span>
            </div>
            <div class="workout__details">
              <span class="workout__icon">⏱</span>
              <span class="workout__value">${workout.duration}</span>
              <span class="workout__unit">min</span>
            </div>
            `;
    // if running
    if (workout.type === 'running')
      html += `<div class="workout__details">
                <span class="workout__icon">⚡️</span>
                <span class="workout__value">${workout.pace.toFixed(1)}</span>
                <span class="workout__unit">min/km</span>
              </div>
              <div class="workout__details">
                <span class="workout__icon">🦶🏼</span>
                <span class="workout__value">${workout.cadence}</span>
                <span class="workout__unit">spm</span>
              </div>
            </li>`;
    // if cycling
    if (workout.type === 'cycling')
      html += `   <div class="workout__details">
      <span class="workout__icon">⚡️</span>
      <span class="workout__value">${workout.speed.toFixed(1)}</span>
      <span class="workout__unit">km/h</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">⛰️</span>
      <span class="workout__value">${workout.elevationGain}</span>
      <span class="workout__unit">m</span>
    </div>
  </li>`;

    // insert the elements to the html form
    form.insertAdjacentHTML('afterend', html);
  }

  // add popup
  _moveToPopup(e) {
    const workoutEl = e.target.closest('.workout');
    //console.log(workoutEl);

    if (!workoutEl) return;

    const workout = this.#workouts.find(
      work => work.id === workoutEl.dataset.id
    );
    //console.log(workout);
    // set view focus to coordinate and view
    this.#map.setView(workout.coords, this.#mapZoomLevel, {
      animate: true,
      pan: {
        duration: 1,
      },
    });

    // using the workout public interface by using the click method
    // workout.click();
  }

  // create a local storage
  _setLocalStorage() {
    localStorage.setItem('workouts', JSON.stringify(this.#workouts));
  }

  // save the data
  _getLocalStorage() {
    const data = JSON.parse(localStorage.getItem('workouts'));
    //console.log(data);
    // if no data in storage  do nothing
    if (!data) return;
    // if there's a data in the storage set data to it
    this.#workouts = data;
    this.#workouts.forEach(work => {
      this._renderWorkout(work);
    });
  }

  // to reset
  rest() {
    localStorage.removeItem('workouts');
    location.reload();
  }
}

// create object from the app class
const app = new App();
