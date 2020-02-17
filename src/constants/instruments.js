import {Synth} from './../instruments/synth';
import {DrumMachine} from './../instruments/drumMachine';

export const INSTRUMENT_TYPE_SYNTH = 0;
export const INSTRUMENT_TYPE_DRUM_MACHINE = 1;

export const INSTRUMENT_TYPES = [
  {
    name: 'Synth',
    id: INSTRUMENT_TYPE_SYNTH,
    class: Synth,
  },
  {
    name: 'Drum Machine',
    id: INSTRUMENT_TYPE_DRUM_MACHINE,
    class: DrumMachine,
  },
];