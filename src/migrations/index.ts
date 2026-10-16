import * as migration_20261016_200732_initial from './20261016_200732_initial';
import * as migration_20261016_202457_colecciones_contenido from './20261016_202457_colecciones_contenido';

export const migrations = [
  {
    up: migration_20261016_200732_initial.up,
    down: migration_20261016_200732_initial.down,
    name: '20261016_200732_initial',
  },
  {
    up: migration_20261016_202457_colecciones_contenido.up,
    down: migration_20261016_202457_colecciones_contenido.down,
    name: '20261016_202457_colecciones_contenido'
  },
];
