import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_negocios_atributos_familia" AS ENUM('admite-ninos', 'cuna', 'trona', 'menu-infantil', 'accesible-carrito', 'jardin-cerrado', 'admite-mascotas', 'parking', 'chimenea');
  CREATE TYPE "public"."enum_negocios_precio_rango" AS ENUM('€', '€€', '€€€', '€€€€');
  CREATE TYPE "public"."enum_negocios_estado" AS ENUM('borrador', 'publicado');
  CREATE TYPE "public"."enum_categorias_negocio_tipo_schema" AS ENUM('Restaurant', 'BarOrPub', 'CafeOrCoffeeShop', 'Store', 'Hotel', 'BedAndBreakfast', 'Campground', 'Hostel', 'LodgingBusiness', 'SportsActivityLocation', 'LocalBusiness');
  CREATE TYPE "public"."enum_categorias_negocio_color_token" AS ENUM('dormir', 'comer', 'activo', 'rutas', 'romanico', 'naturaleza', 'museo');
  CREATE TYPE "public"."enum_categorias_negocio_icono" AS ENUM('hotel', 'casa-rural', 'cama', 'camping', 'restaurante', 'cafeteria', 'bar', 'tienda', 'producto-local', 'turismo-activo', 'bici', 'ruta', 'senda', 'iglesia', 'monumento', 'castillo', 'mirador', 'cascada', 'bosque', 'cumbre', 'fauna', 'museo', 'yacimiento', 'lugar');
  CREATE TYPE "public"."enum_recursos_estado" AS ENUM('borrador', 'publicado');
  CREATE TYPE "public"."enum_tipos_recurso_tipo_schema" AS ENUM('TouristAttraction', 'Church', 'Museum', 'LandmarksOrHistoricalBuildings', 'Mountain', 'Waterfall', 'Park');
  CREATE TYPE "public"."enum_tipos_recurso_color_token" AS ENUM('dormir', 'comer', 'activo', 'rutas', 'romanico', 'naturaleza', 'museo');
  CREATE TYPE "public"."enum_tipos_recurso_icono" AS ENUM('hotel', 'casa-rural', 'cama', 'camping', 'restaurante', 'cafeteria', 'bar', 'tienda', 'producto-local', 'turismo-activo', 'bici', 'ruta', 'senda', 'iglesia', 'monumento', 'castillo', 'mirador', 'cascada', 'bosque', 'cumbre', 'fauna', 'museo', 'yacimiento', 'lugar');
  CREATE TYPE "public"."enum_rutas_temporada" AS ENUM('primavera', 'verano', 'otono', 'invierno');
  CREATE TYPE "public"."enum_rutas_dificultad" AS ENUM('facil', 'moderada', 'dificil');
  CREATE TYPE "public"."enum_rutas_estado" AS ENUM('borrador', 'publicado');
  CREATE TYPE "public"."enum_planes_estado" AS ENUM('borrador', 'publicado');
  CREATE TYPE "public"."enum_landings_ambito" AS ENUM('negocios', 'rutas', 'recursos');
  CREATE TYPE "public"."enum_landings_filtro" AS ENUM('con-ninos');
  CREATE TYPE "public"."enum_redirects_tipo" AS ENUM('exacto', 'prefijo');
  CREATE TYPE "public"."enum_redirects_locale" AS ENUM('es', 'en');
  CREATE TYPE "public"."enum_redirects_origen" AS ENUM('manual', 'automatico');
  CREATE TABLE "municipios_faqs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "municipios_faqs_locales" (
  	"pregunta" varchar,
  	"respuesta" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "municipios" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nombre" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"coordenadas_lat" numeric NOT NULL,
  	"coordenadas_lng" numeric NOT NULL,
  	"altitud_m" numeric,
  	"distancias_km_palencia" numeric,
  	"distancias_km_santander" numeric,
  	"distancias_km_madrid" numeric,
  	"distancias_km_bilbao" numeric,
  	"foto_portada_id" integer,
  	"autor_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "municipios_locales" (
  	"comarca_zona" varchar,
  	"intro" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "nucleos" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nombre" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"municipio_id" integer NOT NULL,
  	"coordenadas_lat" numeric NOT NULL,
  	"coordenadas_lng" numeric NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "negocios_atributos_familia" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_negocios_atributos_familia",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "negocios" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nombre" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"categoria_id" integer NOT NULL,
  	"nucleo_id" integer NOT NULL,
  	"municipio_id" integer,
  	"direccion" varchar,
  	"coordenadas_lat" numeric NOT NULL,
  	"coordenadas_lng" numeric NOT NULL,
  	"telefono" varchar,
  	"email" varchar,
  	"web" varchar,
  	"precio_rango" "enum_negocios_precio_rango",
  	"orden" numeric,
  	"destacado" boolean DEFAULT false,
  	"fuente_url" varchar,
  	"fecha_verificacion" timestamp(3) with time zone,
  	"estado" "enum_negocios_estado" DEFAULT 'borrador' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "negocios_locales" (
  	"descripcion" varchar,
  	"horario_texto" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "negocios_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "categorias_negocio" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tipo_schema" "enum_categorias_negocio_tipo_schema" NOT NULL,
  	"color_token" "enum_categorias_negocio_color_token" NOT NULL,
  	"icono" "enum_categorias_negocio_icono" NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "categorias_negocio_locales" (
  	"nombre" varchar NOT NULL,
  	"nombre_plural" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "recursos" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tipo_id" integer NOT NULL,
  	"nucleo_id" integer NOT NULL,
  	"municipio_id" integer,
  	"coordenadas_lat" numeric NOT NULL,
  	"coordenadas_lng" numeric NOT NULL,
  	"fuente_url" varchar,
  	"fecha_verificacion" timestamp(3) with time zone,
  	"estado" "enum_recursos_estado" DEFAULT 'borrador' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "recursos_locales" (
  	"nombre" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"resumen" varchar,
  	"horario_acceso" varchar,
  	"precio_entrada" varchar,
  	"descripcion" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "recursos_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "tipos_recurso" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tipo_schema" "enum_tipos_recurso_tipo_schema" NOT NULL,
  	"color_token" "enum_tipos_recurso_color_token" NOT NULL,
  	"icono" "enum_tipos_recurso_icono" NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "tipos_recurso_locales" (
  	"nombre" varchar NOT NULL,
  	"nombre_plural" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "rutas_temporada" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_rutas_temporada",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "rutas_faqs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "rutas_faqs_locales" (
  	"pregunta" varchar,
  	"respuesta" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "rutas" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"distancia_km" numeric,
  	"desnivel_m" numeric,
  	"duracion_h" numeric,
  	"dificultad" "enum_rutas_dificultad",
  	"circular" boolean DEFAULT false,
  	"apta_ninos" boolean DEFAULT false,
  	"apta_carrito" boolean DEFAULT false,
  	"inicio_nucleo_id" integer NOT NULL,
  	"inicio_coordenadas_lat" numeric,
  	"inicio_coordenadas_lng" numeric,
  	"gpx_id" integer,
  	"municipio_id" integer,
  	"autor_id" integer,
  	"fuente_url" varchar,
  	"fecha_verificacion" timestamp(3) with time zone,
  	"estado" "enum_rutas_estado" DEFAULT 'borrador' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "rutas_locales" (
  	"nombre" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"resumen" varchar,
  	"premio_final" varchar,
  	"descripcion" varchar,
  	"experiencia_propia" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "rutas_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "archivos_gpx" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"polyline" varchar,
  	"bbox" jsonb,
  	"puntos" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "planes_faqs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "planes_faqs_locales" (
  	"pregunta" varchar,
  	"respuesta" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "planes" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"foto_portada_id" integer,
  	"autor_id" integer,
  	"estado" "enum_planes_estado" DEFAULT 'borrador' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "planes_locales" (
  	"titulo" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"resumen" varchar,
  	"cuerpo" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "planes_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"rutas_id" integer,
  	"negocios_id" integer,
  	"recursos_id" integer
  );
  
  CREATE TABLE "landings_faqs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "landings_faqs_locales" (
  	"pregunta" varchar,
  	"respuesta" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "landings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"ambito" "enum_landings_ambito" NOT NULL,
  	"categoria_id" integer,
  	"municipio_id" integer,
  	"filtro" "enum_landings_filtro",
  	"autor_id" integer,
  	"nombre_interno" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "landings_locales" (
  	"titulo" varchar,
  	"intro" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "autores_enlaces" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"etiqueta" varchar NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "autores" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nombre" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"foto_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "autores_locales" (
  	"bio" varchar,
  	"relacion_con_la_zona" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "redirects" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"desde" varchar NOT NULL,
  	"hacia" varchar NOT NULL,
  	"tipo" "enum_redirects_tipo" DEFAULT 'exacto' NOT NULL,
  	"locale" "enum_redirects_locale",
  	"codigo" numeric DEFAULT 301 NOT NULL,
  	"origen" "enum_redirects_origen" DEFAULT 'manual' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "municipios_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "nucleos_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "negocios_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "categorias_negocio_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "recursos_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "tipos_recurso_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "rutas_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "archivos_gpx_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "planes_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "landings_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "autores_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "redirects_id" integer;
  ALTER TABLE "municipios_faqs" ADD CONSTRAINT "municipios_faqs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."municipios"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "municipios_faqs_locales" ADD CONSTRAINT "municipios_faqs_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."municipios_faqs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "municipios" ADD CONSTRAINT "municipios_foto_portada_id_media_id_fk" FOREIGN KEY ("foto_portada_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "municipios" ADD CONSTRAINT "municipios_autor_id_autores_id_fk" FOREIGN KEY ("autor_id") REFERENCES "public"."autores"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "municipios_locales" ADD CONSTRAINT "municipios_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."municipios"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "nucleos" ADD CONSTRAINT "nucleos_municipio_id_municipios_id_fk" FOREIGN KEY ("municipio_id") REFERENCES "public"."municipios"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "negocios_atributos_familia" ADD CONSTRAINT "negocios_atributos_familia_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."negocios"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "negocios" ADD CONSTRAINT "negocios_categoria_id_categorias_negocio_id_fk" FOREIGN KEY ("categoria_id") REFERENCES "public"."categorias_negocio"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "negocios" ADD CONSTRAINT "negocios_nucleo_id_nucleos_id_fk" FOREIGN KEY ("nucleo_id") REFERENCES "public"."nucleos"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "negocios" ADD CONSTRAINT "negocios_municipio_id_municipios_id_fk" FOREIGN KEY ("municipio_id") REFERENCES "public"."municipios"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "negocios_locales" ADD CONSTRAINT "negocios_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."negocios"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "negocios_rels" ADD CONSTRAINT "negocios_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."negocios"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "negocios_rels" ADD CONSTRAINT "negocios_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "categorias_negocio_locales" ADD CONSTRAINT "categorias_negocio_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."categorias_negocio"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "recursos" ADD CONSTRAINT "recursos_tipo_id_tipos_recurso_id_fk" FOREIGN KEY ("tipo_id") REFERENCES "public"."tipos_recurso"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "recursos" ADD CONSTRAINT "recursos_nucleo_id_nucleos_id_fk" FOREIGN KEY ("nucleo_id") REFERENCES "public"."nucleos"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "recursos" ADD CONSTRAINT "recursos_municipio_id_municipios_id_fk" FOREIGN KEY ("municipio_id") REFERENCES "public"."municipios"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "recursos_locales" ADD CONSTRAINT "recursos_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."recursos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "recursos_rels" ADD CONSTRAINT "recursos_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."recursos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "recursos_rels" ADD CONSTRAINT "recursos_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "tipos_recurso_locales" ADD CONSTRAINT "tipos_recurso_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."tipos_recurso"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "rutas_temporada" ADD CONSTRAINT "rutas_temporada_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."rutas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "rutas_faqs" ADD CONSTRAINT "rutas_faqs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."rutas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "rutas_faqs_locales" ADD CONSTRAINT "rutas_faqs_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."rutas_faqs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "rutas" ADD CONSTRAINT "rutas_inicio_nucleo_id_nucleos_id_fk" FOREIGN KEY ("inicio_nucleo_id") REFERENCES "public"."nucleos"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "rutas" ADD CONSTRAINT "rutas_gpx_id_archivos_gpx_id_fk" FOREIGN KEY ("gpx_id") REFERENCES "public"."archivos_gpx"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "rutas" ADD CONSTRAINT "rutas_municipio_id_municipios_id_fk" FOREIGN KEY ("municipio_id") REFERENCES "public"."municipios"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "rutas" ADD CONSTRAINT "rutas_autor_id_autores_id_fk" FOREIGN KEY ("autor_id") REFERENCES "public"."autores"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "rutas_locales" ADD CONSTRAINT "rutas_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."rutas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "rutas_rels" ADD CONSTRAINT "rutas_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."rutas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "rutas_rels" ADD CONSTRAINT "rutas_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "planes_faqs" ADD CONSTRAINT "planes_faqs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."planes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "planes_faqs_locales" ADD CONSTRAINT "planes_faqs_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."planes_faqs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "planes" ADD CONSTRAINT "planes_foto_portada_id_media_id_fk" FOREIGN KEY ("foto_portada_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "planes" ADD CONSTRAINT "planes_autor_id_autores_id_fk" FOREIGN KEY ("autor_id") REFERENCES "public"."autores"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "planes_locales" ADD CONSTRAINT "planes_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."planes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "planes_rels" ADD CONSTRAINT "planes_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."planes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "planes_rels" ADD CONSTRAINT "planes_rels_rutas_fk" FOREIGN KEY ("rutas_id") REFERENCES "public"."rutas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "planes_rels" ADD CONSTRAINT "planes_rels_negocios_fk" FOREIGN KEY ("negocios_id") REFERENCES "public"."negocios"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "planes_rels" ADD CONSTRAINT "planes_rels_recursos_fk" FOREIGN KEY ("recursos_id") REFERENCES "public"."recursos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "landings_faqs" ADD CONSTRAINT "landings_faqs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "landings_faqs_locales" ADD CONSTRAINT "landings_faqs_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landings_faqs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "landings" ADD CONSTRAINT "landings_categoria_id_categorias_negocio_id_fk" FOREIGN KEY ("categoria_id") REFERENCES "public"."categorias_negocio"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "landings" ADD CONSTRAINT "landings_municipio_id_municipios_id_fk" FOREIGN KEY ("municipio_id") REFERENCES "public"."municipios"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "landings" ADD CONSTRAINT "landings_autor_id_autores_id_fk" FOREIGN KEY ("autor_id") REFERENCES "public"."autores"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "landings_locales" ADD CONSTRAINT "landings_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "autores_enlaces" ADD CONSTRAINT "autores_enlaces_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."autores"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "autores" ADD CONSTRAINT "autores_foto_id_media_id_fk" FOREIGN KEY ("foto_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "autores_locales" ADD CONSTRAINT "autores_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."autores"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "municipios_faqs_order_idx" ON "municipios_faqs" USING btree ("_order");
  CREATE INDEX "municipios_faqs_parent_id_idx" ON "municipios_faqs" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "municipios_faqs_locales_locale_parent_id_unique" ON "municipios_faqs_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "municipios_faqs_locales_parent_id_idx" ON "municipios_faqs_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "municipios_slug_idx" ON "municipios" USING btree ("slug");
  CREATE INDEX "municipios_foto_portada_idx" ON "municipios" USING btree ("foto_portada_id");
  CREATE INDEX "municipios_autor_idx" ON "municipios" USING btree ("autor_id");
  CREATE INDEX "municipios_updated_at_idx" ON "municipios" USING btree ("updated_at");
  CREATE INDEX "municipios_created_at_idx" ON "municipios" USING btree ("created_at");
  CREATE UNIQUE INDEX "municipios_locales_locale_parent_id_unique" ON "municipios_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "municipios_locales_parent_id_idx" ON "municipios_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "nucleos_slug_idx" ON "nucleos" USING btree ("slug");
  CREATE INDEX "nucleos_municipio_idx" ON "nucleos" USING btree ("municipio_id");
  CREATE INDEX "nucleos_updated_at_idx" ON "nucleos" USING btree ("updated_at");
  CREATE INDEX "nucleos_created_at_idx" ON "nucleos" USING btree ("created_at");
  CREATE INDEX "negocios_atributos_familia_order_idx" ON "negocios_atributos_familia" USING btree ("order");
  CREATE INDEX "negocios_atributos_familia_parent_idx" ON "negocios_atributos_familia" USING btree ("parent_id");
  CREATE UNIQUE INDEX "negocios_slug_idx" ON "negocios" USING btree ("slug");
  CREATE INDEX "negocios_categoria_idx" ON "negocios" USING btree ("categoria_id");
  CREATE INDEX "negocios_nucleo_idx" ON "negocios" USING btree ("nucleo_id");
  CREATE INDEX "negocios_municipio_idx" ON "negocios" USING btree ("municipio_id");
  CREATE INDEX "negocios_estado_idx" ON "negocios" USING btree ("estado");
  CREATE INDEX "negocios_updated_at_idx" ON "negocios" USING btree ("updated_at");
  CREATE INDEX "negocios_created_at_idx" ON "negocios" USING btree ("created_at");
  CREATE UNIQUE INDEX "negocios_locales_locale_parent_id_unique" ON "negocios_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "negocios_locales_parent_id_idx" ON "negocios_locales" USING btree ("_parent_id");
  CREATE INDEX "negocios_rels_order_idx" ON "negocios_rels" USING btree ("order");
  CREATE INDEX "negocios_rels_parent_idx" ON "negocios_rels" USING btree ("parent_id");
  CREATE INDEX "negocios_rels_path_idx" ON "negocios_rels" USING btree ("path");
  CREATE INDEX "negocios_rels_media_id_idx" ON "negocios_rels" USING btree ("media_id");
  CREATE INDEX "categorias_negocio_updated_at_idx" ON "categorias_negocio" USING btree ("updated_at");
  CREATE INDEX "categorias_negocio_created_at_idx" ON "categorias_negocio" USING btree ("created_at");
  CREATE UNIQUE INDEX "categorias_negocio_slug_idx" ON "categorias_negocio_locales" USING btree ("slug","_locale");
  CREATE UNIQUE INDEX "categorias_negocio_locales_locale_parent_id_unique" ON "categorias_negocio_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "categorias_negocio_locales_parent_id_idx" ON "categorias_negocio_locales" USING btree ("_parent_id");
  CREATE INDEX "recursos_tipo_idx" ON "recursos" USING btree ("tipo_id");
  CREATE INDEX "recursos_nucleo_idx" ON "recursos" USING btree ("nucleo_id");
  CREATE INDEX "recursos_municipio_idx" ON "recursos" USING btree ("municipio_id");
  CREATE INDEX "recursos_estado_idx" ON "recursos" USING btree ("estado");
  CREATE INDEX "recursos_updated_at_idx" ON "recursos" USING btree ("updated_at");
  CREATE INDEX "recursos_created_at_idx" ON "recursos" USING btree ("created_at");
  CREATE UNIQUE INDEX "recursos_slug_idx" ON "recursos_locales" USING btree ("slug","_locale");
  CREATE UNIQUE INDEX "recursos_locales_locale_parent_id_unique" ON "recursos_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "recursos_locales_parent_id_idx" ON "recursos_locales" USING btree ("_parent_id");
  CREATE INDEX "recursos_rels_order_idx" ON "recursos_rels" USING btree ("order");
  CREATE INDEX "recursos_rels_parent_idx" ON "recursos_rels" USING btree ("parent_id");
  CREATE INDEX "recursos_rels_path_idx" ON "recursos_rels" USING btree ("path");
  CREATE INDEX "recursos_rels_media_id_idx" ON "recursos_rels" USING btree ("media_id");
  CREATE INDEX "tipos_recurso_updated_at_idx" ON "tipos_recurso" USING btree ("updated_at");
  CREATE INDEX "tipos_recurso_created_at_idx" ON "tipos_recurso" USING btree ("created_at");
  CREATE UNIQUE INDEX "tipos_recurso_slug_idx" ON "tipos_recurso_locales" USING btree ("slug","_locale");
  CREATE UNIQUE INDEX "tipos_recurso_locales_locale_parent_id_unique" ON "tipos_recurso_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "tipos_recurso_locales_parent_id_idx" ON "tipos_recurso_locales" USING btree ("_parent_id");
  CREATE INDEX "rutas_temporada_order_idx" ON "rutas_temporada" USING btree ("order");
  CREATE INDEX "rutas_temporada_parent_idx" ON "rutas_temporada" USING btree ("parent_id");
  CREATE INDEX "rutas_faqs_order_idx" ON "rutas_faqs" USING btree ("_order");
  CREATE INDEX "rutas_faqs_parent_id_idx" ON "rutas_faqs" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "rutas_faqs_locales_locale_parent_id_unique" ON "rutas_faqs_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "rutas_faqs_locales_parent_id_idx" ON "rutas_faqs_locales" USING btree ("_parent_id");
  CREATE INDEX "rutas_inicio_nucleo_idx" ON "rutas" USING btree ("inicio_nucleo_id");
  CREATE INDEX "rutas_gpx_idx" ON "rutas" USING btree ("gpx_id");
  CREATE INDEX "rutas_municipio_idx" ON "rutas" USING btree ("municipio_id");
  CREATE INDEX "rutas_autor_idx" ON "rutas" USING btree ("autor_id");
  CREATE INDEX "rutas_estado_idx" ON "rutas" USING btree ("estado");
  CREATE INDEX "rutas_updated_at_idx" ON "rutas" USING btree ("updated_at");
  CREATE INDEX "rutas_created_at_idx" ON "rutas" USING btree ("created_at");
  CREATE UNIQUE INDEX "rutas_slug_idx" ON "rutas_locales" USING btree ("slug","_locale");
  CREATE UNIQUE INDEX "rutas_locales_locale_parent_id_unique" ON "rutas_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "rutas_locales_parent_id_idx" ON "rutas_locales" USING btree ("_parent_id");
  CREATE INDEX "rutas_rels_order_idx" ON "rutas_rels" USING btree ("order");
  CREATE INDEX "rutas_rels_parent_idx" ON "rutas_rels" USING btree ("parent_id");
  CREATE INDEX "rutas_rels_path_idx" ON "rutas_rels" USING btree ("path");
  CREATE INDEX "rutas_rels_media_id_idx" ON "rutas_rels" USING btree ("media_id");
  CREATE INDEX "archivos_gpx_updated_at_idx" ON "archivos_gpx" USING btree ("updated_at");
  CREATE INDEX "archivos_gpx_created_at_idx" ON "archivos_gpx" USING btree ("created_at");
  CREATE UNIQUE INDEX "archivos_gpx_filename_idx" ON "archivos_gpx" USING btree ("filename");
  CREATE INDEX "planes_faqs_order_idx" ON "planes_faqs" USING btree ("_order");
  CREATE INDEX "planes_faqs_parent_id_idx" ON "planes_faqs" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "planes_faqs_locales_locale_parent_id_unique" ON "planes_faqs_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "planes_faqs_locales_parent_id_idx" ON "planes_faqs_locales" USING btree ("_parent_id");
  CREATE INDEX "planes_foto_portada_idx" ON "planes" USING btree ("foto_portada_id");
  CREATE INDEX "planes_autor_idx" ON "planes" USING btree ("autor_id");
  CREATE INDEX "planes_estado_idx" ON "planes" USING btree ("estado");
  CREATE INDEX "planes_updated_at_idx" ON "planes" USING btree ("updated_at");
  CREATE INDEX "planes_created_at_idx" ON "planes" USING btree ("created_at");
  CREATE UNIQUE INDEX "planes_slug_idx" ON "planes_locales" USING btree ("slug","_locale");
  CREATE UNIQUE INDEX "planes_locales_locale_parent_id_unique" ON "planes_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "planes_locales_parent_id_idx" ON "planes_locales" USING btree ("_parent_id");
  CREATE INDEX "planes_rels_order_idx" ON "planes_rels" USING btree ("order");
  CREATE INDEX "planes_rels_parent_idx" ON "planes_rels" USING btree ("parent_id");
  CREATE INDEX "planes_rels_path_idx" ON "planes_rels" USING btree ("path");
  CREATE INDEX "planes_rels_rutas_id_idx" ON "planes_rels" USING btree ("rutas_id");
  CREATE INDEX "planes_rels_negocios_id_idx" ON "planes_rels" USING btree ("negocios_id");
  CREATE INDEX "planes_rels_recursos_id_idx" ON "planes_rels" USING btree ("recursos_id");
  CREATE INDEX "landings_faqs_order_idx" ON "landings_faqs" USING btree ("_order");
  CREATE INDEX "landings_faqs_parent_id_idx" ON "landings_faqs" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "landings_faqs_locales_locale_parent_id_unique" ON "landings_faqs_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "landings_faqs_locales_parent_id_idx" ON "landings_faqs_locales" USING btree ("_parent_id");
  CREATE INDEX "landings_ambito_idx" ON "landings" USING btree ("ambito");
  CREATE INDEX "landings_categoria_idx" ON "landings" USING btree ("categoria_id");
  CREATE INDEX "landings_municipio_idx" ON "landings" USING btree ("municipio_id");
  CREATE INDEX "landings_autor_idx" ON "landings" USING btree ("autor_id");
  CREATE INDEX "landings_updated_at_idx" ON "landings" USING btree ("updated_at");
  CREATE INDEX "landings_created_at_idx" ON "landings" USING btree ("created_at");
  CREATE UNIQUE INDEX "landings_locales_locale_parent_id_unique" ON "landings_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "landings_locales_parent_id_idx" ON "landings_locales" USING btree ("_parent_id");
  CREATE INDEX "autores_enlaces_order_idx" ON "autores_enlaces" USING btree ("_order");
  CREATE INDEX "autores_enlaces_parent_id_idx" ON "autores_enlaces" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "autores_slug_idx" ON "autores" USING btree ("slug");
  CREATE INDEX "autores_foto_idx" ON "autores" USING btree ("foto_id");
  CREATE INDEX "autores_updated_at_idx" ON "autores" USING btree ("updated_at");
  CREATE INDEX "autores_created_at_idx" ON "autores" USING btree ("created_at");
  CREATE UNIQUE INDEX "autores_locales_locale_parent_id_unique" ON "autores_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "autores_locales_parent_id_idx" ON "autores_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "redirects_desde_idx" ON "redirects" USING btree ("desde");
  CREATE INDEX "redirects_updated_at_idx" ON "redirects" USING btree ("updated_at");
  CREATE INDEX "redirects_created_at_idx" ON "redirects" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_municipios_fk" FOREIGN KEY ("municipios_id") REFERENCES "public"."municipios"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_nucleos_fk" FOREIGN KEY ("nucleos_id") REFERENCES "public"."nucleos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_negocios_fk" FOREIGN KEY ("negocios_id") REFERENCES "public"."negocios"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_categorias_negocio_fk" FOREIGN KEY ("categorias_negocio_id") REFERENCES "public"."categorias_negocio"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_recursos_fk" FOREIGN KEY ("recursos_id") REFERENCES "public"."recursos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_tipos_recurso_fk" FOREIGN KEY ("tipos_recurso_id") REFERENCES "public"."tipos_recurso"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_rutas_fk" FOREIGN KEY ("rutas_id") REFERENCES "public"."rutas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_archivos_gpx_fk" FOREIGN KEY ("archivos_gpx_id") REFERENCES "public"."archivos_gpx"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_planes_fk" FOREIGN KEY ("planes_id") REFERENCES "public"."planes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_landings_fk" FOREIGN KEY ("landings_id") REFERENCES "public"."landings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_autores_fk" FOREIGN KEY ("autores_id") REFERENCES "public"."autores"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_redirects_fk" FOREIGN KEY ("redirects_id") REFERENCES "public"."redirects"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_municipios_id_idx" ON "payload_locked_documents_rels" USING btree ("municipios_id");
  CREATE INDEX "payload_locked_documents_rels_nucleos_id_idx" ON "payload_locked_documents_rels" USING btree ("nucleos_id");
  CREATE INDEX "payload_locked_documents_rels_negocios_id_idx" ON "payload_locked_documents_rels" USING btree ("negocios_id");
  CREATE INDEX "payload_locked_documents_rels_categorias_negocio_id_idx" ON "payload_locked_documents_rels" USING btree ("categorias_negocio_id");
  CREATE INDEX "payload_locked_documents_rels_recursos_id_idx" ON "payload_locked_documents_rels" USING btree ("recursos_id");
  CREATE INDEX "payload_locked_documents_rels_tipos_recurso_id_idx" ON "payload_locked_documents_rels" USING btree ("tipos_recurso_id");
  CREATE INDEX "payload_locked_documents_rels_rutas_id_idx" ON "payload_locked_documents_rels" USING btree ("rutas_id");
  CREATE INDEX "payload_locked_documents_rels_archivos_gpx_id_idx" ON "payload_locked_documents_rels" USING btree ("archivos_gpx_id");
  CREATE INDEX "payload_locked_documents_rels_planes_id_idx" ON "payload_locked_documents_rels" USING btree ("planes_id");
  CREATE INDEX "payload_locked_documents_rels_landings_id_idx" ON "payload_locked_documents_rels" USING btree ("landings_id");
  CREATE INDEX "payload_locked_documents_rels_autores_id_idx" ON "payload_locked_documents_rels" USING btree ("autores_id");
  CREATE INDEX "payload_locked_documents_rels_redirects_id_idx" ON "payload_locked_documents_rels" USING btree ("redirects_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "municipios_faqs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "municipios_faqs_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "municipios" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "municipios_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "nucleos" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "negocios_atributos_familia" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "negocios" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "negocios_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "negocios_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "categorias_negocio" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "categorias_negocio_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "recursos" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "recursos_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "recursos_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "tipos_recurso" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "tipos_recurso_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "rutas_temporada" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "rutas_faqs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "rutas_faqs_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "rutas" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "rutas_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "rutas_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "archivos_gpx" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "planes_faqs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "planes_faqs_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "planes" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "planes_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "planes_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "landings_faqs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "landings_faqs_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "landings" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "landings_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "autores_enlaces" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "autores" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "autores_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "redirects" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "municipios_faqs" CASCADE;
  DROP TABLE "municipios_faqs_locales" CASCADE;
  DROP TABLE "municipios" CASCADE;
  DROP TABLE "municipios_locales" CASCADE;
  DROP TABLE "nucleos" CASCADE;
  DROP TABLE "negocios_atributos_familia" CASCADE;
  DROP TABLE "negocios" CASCADE;
  DROP TABLE "negocios_locales" CASCADE;
  DROP TABLE "negocios_rels" CASCADE;
  DROP TABLE "categorias_negocio" CASCADE;
  DROP TABLE "categorias_negocio_locales" CASCADE;
  DROP TABLE "recursos" CASCADE;
  DROP TABLE "recursos_locales" CASCADE;
  DROP TABLE "recursos_rels" CASCADE;
  DROP TABLE "tipos_recurso" CASCADE;
  DROP TABLE "tipos_recurso_locales" CASCADE;
  DROP TABLE "rutas_temporada" CASCADE;
  DROP TABLE "rutas_faqs" CASCADE;
  DROP TABLE "rutas_faqs_locales" CASCADE;
  DROP TABLE "rutas" CASCADE;
  DROP TABLE "rutas_locales" CASCADE;
  DROP TABLE "rutas_rels" CASCADE;
  DROP TABLE "archivos_gpx" CASCADE;
  DROP TABLE "planes_faqs" CASCADE;
  DROP TABLE "planes_faqs_locales" CASCADE;
  DROP TABLE "planes" CASCADE;
  DROP TABLE "planes_locales" CASCADE;
  DROP TABLE "planes_rels" CASCADE;
  DROP TABLE "landings_faqs" CASCADE;
  DROP TABLE "landings_faqs_locales" CASCADE;
  DROP TABLE "landings" CASCADE;
  DROP TABLE "landings_locales" CASCADE;
  DROP TABLE "autores_enlaces" CASCADE;
  DROP TABLE "autores" CASCADE;
  DROP TABLE "autores_locales" CASCADE;
  DROP TABLE "redirects" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_municipios_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_nucleos_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_negocios_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_categorias_negocio_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_recursos_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_tipos_recurso_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_rutas_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_archivos_gpx_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_planes_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_landings_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_autores_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_redirects_fk";
  
  DROP INDEX "payload_locked_documents_rels_municipios_id_idx";
  DROP INDEX "payload_locked_documents_rels_nucleos_id_idx";
  DROP INDEX "payload_locked_documents_rels_negocios_id_idx";
  DROP INDEX "payload_locked_documents_rels_categorias_negocio_id_idx";
  DROP INDEX "payload_locked_documents_rels_recursos_id_idx";
  DROP INDEX "payload_locked_documents_rels_tipos_recurso_id_idx";
  DROP INDEX "payload_locked_documents_rels_rutas_id_idx";
  DROP INDEX "payload_locked_documents_rels_archivos_gpx_id_idx";
  DROP INDEX "payload_locked_documents_rels_planes_id_idx";
  DROP INDEX "payload_locked_documents_rels_landings_id_idx";
  DROP INDEX "payload_locked_documents_rels_autores_id_idx";
  DROP INDEX "payload_locked_documents_rels_redirects_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "municipios_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "nucleos_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "negocios_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "categorias_negocio_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "recursos_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "tipos_recurso_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "rutas_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "archivos_gpx_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "planes_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "landings_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "autores_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "redirects_id";
  DROP TYPE "public"."enum_negocios_atributos_familia";
  DROP TYPE "public"."enum_negocios_precio_rango";
  DROP TYPE "public"."enum_negocios_estado";
  DROP TYPE "public"."enum_categorias_negocio_tipo_schema";
  DROP TYPE "public"."enum_categorias_negocio_color_token";
  DROP TYPE "public"."enum_categorias_negocio_icono";
  DROP TYPE "public"."enum_recursos_estado";
  DROP TYPE "public"."enum_tipos_recurso_tipo_schema";
  DROP TYPE "public"."enum_tipos_recurso_color_token";
  DROP TYPE "public"."enum_tipos_recurso_icono";
  DROP TYPE "public"."enum_rutas_temporada";
  DROP TYPE "public"."enum_rutas_dificultad";
  DROP TYPE "public"."enum_rutas_estado";
  DROP TYPE "public"."enum_planes_estado";
  DROP TYPE "public"."enum_landings_ambito";
  DROP TYPE "public"."enum_landings_filtro";
  DROP TYPE "public"."enum_redirects_tipo";
  DROP TYPE "public"."enum_redirects_locale";
  DROP TYPE "public"."enum_redirects_origen";`)
}
