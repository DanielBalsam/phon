export const SMALLEST_NOTE_SIZE = 32; // not going to support 64th notes yet
export const MAX_MEASURES = 16;
export const LATCH = 'Latch';

let noteGridId = 0;
export const NoteGridFactory = (measures) => {
  const noteGrid = [];

  for (let i=0; i < 32 * MAX_MEASURES; i++) {
    noteGridId++;
    noteGrid.push({
      notes: [],
      muted: false,
      id: noteGridId,
    });
  }

  return noteGrid;
};

export const NoteFactory = (note, octave) => {
  return {
    note,
    octave,
    velocity: 1,
    muted: false,
  }
}