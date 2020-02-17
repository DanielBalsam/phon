export const SOLO_TYPE_NO_RESET = 0;
export const SOLO_TYPE_RESET_ON_LOOP = 1;

export const GlobalConfigFactory = () => {
  return {
    tempo: 120,
    paused: true,
    soloChannelId: null,
    soloType: SOLO_TYPE_RESET_ON_LOOP,
  }
}

export const BeatFactory = () => {
  return {
    channels: [],
    channelNumber: 0,
    measures: 1,
  }
}

let channelId = '' + Math.random();
export const ChannelFactory = () => {
  channelId++;
  return {
    name: 'Default',
    instrument: null,
    notes: null,
    gridSize: null,
    attack: null,
    sustain: null,
    release: null,
    delayGrain: null,
    id: channelId,
    muted: false,
    queueMuted: null,
    volume: 1,
    pan: 0,
    effects: {
      transpose: {
        octaves: 0,
      },
      reverb: {
        wet: 0,
        dry: 1,
        size: null,
      }
    },
  }
}