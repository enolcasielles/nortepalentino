import * as migration_20261016_200732_initial from './20261016_200732_initial';

export const migrations = [
  {
    up: migration_20261016_200732_initial.up,
    down: migration_20261016_200732_initial.down,
    name: '20261016_200732_initial'
  },
];
