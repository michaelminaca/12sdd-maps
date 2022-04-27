'use strict';

const workspace = document.querySelector('.workspace');
const referenceNoteColumn = document.querySelector('.reference-note-column');
const btnPlayPause = document.querySelector('.play-pause-btn');
const btnRecording = document.querySelector('.record-btn');
const btnSettings = document.querySelector('.settings-btn');
const settingsMenu = document.querySelector('.settings-menu');

const playhead = document.querySelector('.playhead');

const notes = [];
const playbackQueue = [];
let playheadPos;

const AppState = {
  isPlaying: false,
  isRecording: false,
};

class Note {
  constructor(note, velocity, time, duration) {
    this.note = note;
    this.velocity = velocity;
    this.time = time;
    this.duration = duration;
  }
}

// (function () {
//   navigator.requestMIDIAccess
//     ? navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure)
//     : alert('WebMidi is not supported in this browser');
// })();

// function onMIDISuccess(midiAccess) {
//   midiAccess.addEventListener('statechange', (event) =>
//     updateMIDIDevices(event.target)
//   );
//   const inputs = midiAccess.inputs;
//   inputs.forEach((input) =>
//     input.addEventListener('midimessage', () => console.log('midimessage'))
//   );
// }

// function onMIDIFailure() {
//   alert('Failed to connect to midi');
// }

// function updateMIDIDevices(midiAccess) {}

// function onMIDIMessage(event) {
//   console.log('event');
// }

//Set Playhead Position
workspace.addEventListener('click', (event) => {
  const vw = event.clientX * (100 / document.documentElement.clientWidth) - 3;
  playhead.style.transform = `translateX(${vw}vw)`;
  playheadPos = Math.trunc(vw * 365);
  console.log(playheadPos);
});
