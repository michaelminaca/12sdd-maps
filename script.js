'use strict';

const btnPlayPause = document.querySelector('.play-pause-btn');
const btnRecord = document.querySelector('.record-btn');
const playhead = document.querySelector('.playhead');
const workspace = document.querySelector('.workspace');
const notesContainer = document.querySelector('.notes-elements');
const welcomeMessage = document.querySelector('.welcome-message');

const notes = [];
const playbackQueue = [];
let playheadPos = 0;
let playbackInterval = null;

let id = 0;

const WORKSPACE_WIDTH = 96;
const TOTAL_UNITS = 2000;
const MS_PER_UNIT = 10;
const UNITS_PER_VW = TOTAL_UNITS / WORKSPACE_WIDTH;

const AppState = {
  isActive: false,
  isPlaying: false,
  isRecording: false,
};

class Note {
  constructor(note, velocity, startTime, endTime, id) {
    this.note = note;
    this.velocity = velocity;
    this.startTime = startTime;
    this.endTime = endTime;
    this.id = id;
  }
}

const sampler = new Tone.Sampler({
  urls: {
    C4: 'C4.mp3',
    'D#4': 'Ds4.mp3',
    'F#4': 'Fs4.mp3',
    A4: 'A4.mp3',
  },
  release: 1,
  baseUrl: 'https://tonejs.github.io/audio/salamander/',
}).toDestination();

Tone.loaded().then(() => {
  navigator.requestMIDIAccess
    ? navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure)
    : alert('WebMidi is not supported in this browser');
});

const keypressHandler = function (event) {
  if (event.keyCode === 32) return playbackHandler();
};

const playbackHandler = function () {
  if (!AppState.isPlaying && !AppState.isRecording) return startPlayback();
  if (AppState.isPlaying && !AppState.isRecording) return stopPlayback();
};

const recordHandler = function () {
  if (!AppState.isRecording && AppState.isPlaying) {
    clearInterval(playbackInterval);
    return startRecording();
  }
  if (!AppState.isRecording && !AppState.isPlaying) return startRecording();
  return stopRecording();
};

function onMIDISuccess(midiAccess) {
  midiAccess.addEventListener('statechange', (event) =>
    updateMIDIDevices(event.target)
  );
  updateMIDIDevices(midiAccess);
}

function onMIDIFailure() {
  alert('Failed to connect to midi');
}

function updateMIDIDevices(midiAccess) {
  const inputs = midiAccess.inputs;
  inputs.forEach((input) =>
    input.addEventListener('midimessage', onMIDIMessage)
  );
}

const onMIDIMessage = function (event) {
  if (event.data[1] >= 36 && event.data[1] <= 96 && AppState.isActive) {
    toggleNote(event.data);
    if (AppState.isRecording) {
      addNoteToArray(event.data);
    }
  }
};

const toggleNote = function (midiNoteData) {
  if (midiNoteData[0] === 144) {
    sampler.triggerAttack(
      midiToNoteConversion(midiNoteData[1]),
      '0',
      midiNoteData[2] / 128
    );
    return;
  }
  if (midiNoteData[0] === 128) {
    sampler.triggerRelease(midiToNoteConversion(midiNoteData[1]));
    return;
  }
};

const drawNote = function (note) {
  const htmlNote = document.createElement('div');
  htmlNote.classList.add('recorded-note');
  htmlNote.style.top = `${9 + (90 / 61) * Math.abs(note.note - 96)}vh`;
  htmlNote.style.width = `${(note.endTime - note.startTime) / UNITS_PER_VW}vw`;
  htmlNote.style.left = `${note.startTime / UNITS_PER_VW + 3}vw`;
  htmlNote.dataset.id = note.id;
  notesContainer.appendChild(htmlNote);
};

const addNoteToArray = function (midiNoteData) {
  if (midiNoteData[0] === 144 && midiNoteData[2] > 0) {
    if (playheadPos >= notes[notes.length - 1]) {
      notes.push(new Note(midiNoteData[1], midiNoteData[2], playheadPos));
      notes[notes.length - 1].id = id;
      id++;
    } else if (playheadPos <= notes[0]) {
      notes.unshift(new Note(midiNoteData[1], midiNoteData[2], playheadPos));
      notes[0].id = id;
      id++;
    } else {
      notes.splice(
        findNotePosition(notes, playheadPos),
        0,
        new Note(midiNoteData[1], midiNoteData[2], playheadPos)
      );
      notes[findNotePosition(notes, playheadPos)].id = id;
      id++;
    }
  }
  if (midiNoteData[0] === 128 || midiNoteData[2] == 0) {
    notes.forEach((note) => {
      if (note.note === midiNoteData[1] && note.endTime == null) {
        note.endTime = playheadPos;
        drawNote(note);
        return;
      }
    });
  }
  analyseNotes(notes);
};

const findNotePosition = function (array, target) {
  let lowerBound = 0;
  let upperBound = notes.length - 1;
  while (lowerBound <= upperBound) {
    let mid = Math.floor((lowerBound + upperBound) / 2);
    if (array[mid].startTime === target) {
      return mid;
    } else if (array[mid].startTime > target) {
      upperBound = mid - 1;
    } else {
      lowerBound = mid + 1;
    }
  }
  return lowerBound;
};

const setPlayheadPosition = function (mouseX) {
  playheadPos = calcPlayheadPosition(mouseX);
  playhead.style.transform = `translateX(${playheadPos / UNITS_PER_VW}vw)`;
};

const calcPlayheadPosition = function (mouseX) {
  const vw = (mouseX * 100) / document.documentElement.clientWidth - 3;
  if (vw >= 0 && vw <= WORKSPACE_WIDTH)
    return Math.round(
      ((mouseX * 100) / document.documentElement.clientWidth - 3) * UNITS_PER_VW
    );
  if (vw < 0) return 0;
  return Math.round(WORKSPACE_WIDTH * UNITS_PER_VW);
};

const movePlayhead = function () {
  setNoteTimeouts();
  playbackInterval = setInterval(function () {
    if (playheadPos < TOTAL_UNITS) {
      playheadPos += 1;
    }
    if (playheadPos >= TOTAL_UNITS) {
      playheadPos = 0;
      notes.forEach((note) => {
        if (note.endTime == undefined) {
          note.endTime = TOTAL_UNITS;
          drawNote(note);
        }
      });
    }
    playhead.style.transform = `translateX(${playheadPos / UNITS_PER_VW}vw)`;
  }, 10);
};

const setNoteTimeouts = function () {
  notes.forEach((note) => {
    if (note.startTime > playheadPos) {
      playbackQueue.push(
        setTimeout(function () {
          playNote(note);
        }, MS_PER_UNIT * (note.startTime - playheadPos))
      );
    }
  });
};

const stopMovingPlayhead = function () {
  clearInterval(playbackInterval);
  playbackQueue.forEach((timeout) => {
    clearTimeout(timeout);
  });
};

const startPlayback = function () {
  AppState.isPlaying = true;
  movePlayhead();
};

const stopPlayback = function () {
  AppState.isPlaying = false;
  stopMovingPlayhead();
};

const startRecording = function () {
  AppState.isPlaying = false;
  AppState.isRecording = true;
  btnRecord.classList.add('recording');
  movePlayhead();
};

const stopRecording = function () {
  AppState.isRecording = false;
  btnRecord.classList.remove('recording');
  stopMovingPlayhead();
};

const playNote = function (note) {
  sampler.triggerAttack(
    midiToNoteConversion(note.note),
    0,
    note.velocity / 128
  );
  setTimeout(() => {
    sampler.triggerRelease(midiToNoteConversion(note.note));
  }, (note.endTime - note.startTime) * MS_PER_UNIT);
};

const midiToNoteConversion = function (midi) {
  const CHROMATIC = [
    'C',
    'Db',
    'D',
    'Eb',
    'E',
    'F',
    'Gb',
    'G',
    'Ab',
    'A',
    'Bb',
    'B',
  ];

  if (isNaN(midi) || midi < 0 || midi > 127) return null;
  const name = CHROMATIC[midi % 12];
  const oct = Math.floor(midi / 12) - 1;
  return name + oct;
};

document.addEventListener('keydown', (event) => {
  keypressHandler(event);
});

workspace.addEventListener('click', (event) => {
  if (!AppState.isPlaying && !AppState.isRecording && AppState.isActive)
    setPlayheadPosition(event.clientX);
});

btnPlayPause.addEventListener('click', () => {
  btnPlayPause.blur();
  playbackHandler();
});

btnRecord.addEventListener('click', () => {
  btnRecord.blur();
  recordHandler();
});

document.querySelector('body').addEventListener('click', async () => {
  welcomeMessage.style.display = 'none';
  AppState.isActive = true;
  await Tone.start();
});
