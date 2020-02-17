import Reverb from 'soundbank-reverb';

import NOTES_MAP from '../constants/notes_map';
import {INSTRUMENT_TYPE_SYNTH} from '../constants/instruments';


let oscId = 0;
export const OscillatorFactory = (waveform) => {
  oscId++;
  return {
    type: waveform,
    transforms: {
      transpose: 0,
    },
    id: oscId,
  };
};
export const OSCILLATOR_TYPES = [
  {
    name: 'Sine',
    value: 'sine',
  },
  {
    name: 'Square',
    value: 'square',
  },
  {
    name: 'Triangle',
    value: 'triangle',
  },
  {
    name: 'Sawtooth',
    value: 'sawtooth',
  }
];
let soundId = 0;

export class Synth {
  constructor(
    context,
    compressor,
    oscillators=[
      'sine',
    ],
  ) {
    this.type = INSTRUMENT_TYPE_SYNTH;
    this.context = context;
    this.compressor = compressor;
    this.oscillators = oscillators.map(osc => new OscillatorFactory(osc));
    this.sounds = [];
  }

  addNewOscillator() {
    const oscillator = new OscillatorFactory(OSCILLATOR_TYPES[0].value);
    this.oscillators.push(oscillator);
  }

  getNewSound(waveform) {
    const sound = {
      oscillator: this.context.createOscillator(),
      gainNode: this.context.createGain(),
      panNode: this.context.createStereoPanner(),
      reverb: Reverb(this.context),
    };

    sound.oscillator.connect(sound.panNode);
    sound.panNode.connect(sound.gainNode);
    sound.gainNode.connect(sound.reverb);
    sound.reverb.connect(this.compressor);
    sound.oscillator.type = waveform;

    soundId++;
    sound.id = soundId;

    return sound;
  }

  play({
    note,
    attack=0,
    release=0,
    sustain=0,
    volume=1,
    pan=0,
    delay=0,
    numberOfDelayGrains=0,
    reverb,
    startTime,
  }) {
    this.oscillators.forEach((osc) => {
      const sound = this.getNewSound(osc.type);
      this.sounds.push(sound);

      if(!startTime) startTime = this.context.currentTime;
      let octave = note.octave + +osc.transforms.transpose;

      const frequency = NOTES_MAP[note.note][octave];
      if (!frequency) return;
      sound.oscillator.frequency.value = frequency;
      sound.gainNode.gain.setValueAtTime(
        0.01,
        startTime,
      );
      sound.panNode.pan.setValueAtTime(
        pan * 1,
        startTime,
      )
      sound.oscillator.start(
        startTime
      );
      sound.reverb.time = reverb.size.duration;
      sound.reverb.wet.setValueAtTime(
        reverb.wet,
        startTime
      )
      sound.reverb.dry.setValueAtTime(
        reverb.dry,
        startTime
      )

      if (attack) {
        sound.gainNode.gain.exponentialRampToValueAtTime(
          (0.1 * note.velocity * volume) / this.oscillators.length,
          startTime + attack,
        );

        startTime = startTime + attack;
      } else {
        sound.gainNode.gain.setValueAtTime(
          (0.1 * note.velocity * volume) / this.oscillators.length,
          startTime,
        );
      }

      this.sustainNote(sound, startTime, sustain, release)
    });

    if (delay && numberOfDelayGrains) {
      for (let i=2; i < numberOfDelayGrains; i++) {
        const newVolume = volume * (1 / i);
        const newStartTime = startTime + (delay * (i - 1));

        if (newVolume < 0.01) continue;

        this.play({
          note,
          attack,
          release,
          sustain,
          pan,
          reverb,
          delay: 0,
          numberOfDelayGrains: 0,
          volume: newVolume,
          startTime: newStartTime,
        })
      }
    }
  }

  sustainNote(sound, startTime, sustain, release) {
    const currentTime = this.context.currentTime;
    const endTime = startTime + sustain;

    if (currentTime >= endTime) {
      this.stop(
        sound,
        release,
      );
    } else {
      window.requestAnimationFrame(() => {
        this.sustainNote(sound, startTime, sustain, release);
      });
    }
  }

  stop(sound, release) {
    const currentTime = this.context.currentTime;
    const endTime = currentTime + release;
    sound.gainNode.gain.setValueAtTime(
      sound.gainNode.gain.value,
      currentTime
    );
    sound.gainNode.gain.exponentialRampToValueAtTime(0.0001, endTime);
    sound.oscillator.stop(currentTime + release + 0.5);

    const index = this.sounds.find(s => s.id === sound.id);

    if (index !== -1) this.sounds.splice(index, 1);
  }
}