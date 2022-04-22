'use strict';

const workspaceContainer = document.querySelector('.workspace-container');
const referenceNoteColumn = document.querySelector('.reference-note-column');
const btnPlayPause = document.querySelector('.play-pause-btn');
const btnRecording = document.querySelector('.record-btn');
const btnSettings = document.querySelector('.settings-btn');
const settingsMenu = document.querySelector('.settings-menu');

const AppState = {
  isPlaying: false,
  isRecording: false,
  isSettingsOpen: false,
};

(function () {
  if (navigator.requestMIDIAccess)
    navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);
})();

function onMIDISuccess(midiAccess) {
  midiAccess.addEventListener('statechange', updateMIDIDevices);

  const inputs = midiAccess.inputs;
  inputs.forEach((input) => {
    console.log(input);
    input.addEventListener('midimessage', onMessage);
  });
}

function onMIDIFailure() {
  alert('WebMidi is not supported in this browser');
}

function updateMIDIDevices(event) {
  console.log(event.target);
}

function onMessage(event) {
  console.log(event);
}
