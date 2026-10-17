import * as migration_20261016_200732_initial from './20261016_200732_initial';
import * as migration_20261016_202457_colecciones_contenido from './20261016_202457_colecciones_contenido';
import * as migration_20261016_221342_storage_campos_blob from './20261016_221342_storage_campos_blob';
import * as migration_20261016_224420_api_keys_usuarios from './20261016_224420_api_keys_usuarios';
import * as migration_20261017_004633_blog_articulos from './20261017_004633_blog_articulos';

export const migrations = [
  {
    up: migration_20261016_200732_initial.up,
    down: migration_20261016_200732_initial.down,
    name: '20261016_200732_initial',
  },
  {
    up: migration_20261016_202457_colecciones_contenido.up,
    down: migration_20261016_202457_colecciones_contenido.down,
    name: '20261016_202457_colecciones_contenido',
  },
  {
    up: migration_20261016_221342_storage_campos_blob.up,
    down: migration_20261016_221342_storage_campos_blob.down,
    name: '20261016_221342_storage_campos_blob',
  },
  {
    up: migration_20261016_224420_api_keys_usuarios.up,
    down: migration_20261016_224420_api_keys_usuarios.down,
    name: '20261016_224420_api_keys_usuarios',
  },
  {
    up: migration_20261017_004633_blog_articulos.up,
    down: migration_20261017_004633_blog_articulos.down,
    name: '20261017_004633_blog_articulos'
  },
];
