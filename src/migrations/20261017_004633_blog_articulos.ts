import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_articulos_estado" AS ENUM('borrador', 'publicado');
  ALTER TYPE "public"."enum_landings_ambito" ADD VALUE 'articulos';
  CREATE TABLE "articulos_faqs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "articulos_faqs_locales" (
  	"pregunta" varchar,
  	"respuesta" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "articulos" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"foto_portada_id" integer,
  	"autor_id" integer,
  	"fecha_publicacion" timestamp(3) with time zone,
  	"estado" "enum_articulos_estado" DEFAULT 'borrador' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "articulos_locales" (
  	"titulo" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"resumen" varchar,
  	"cuerpo" jsonb,
  	"busqueda_objetivo" varchar,
  	"seo_titulo" varchar,
  	"seo_descripcion" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "articulos_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar,
  	"locale" "_locales"
  );
  
  CREATE TABLE "articulos_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"locale" "_locales",
  	"negocios_id" integer,
  	"rutas_id" integer,
  	"recursos_id" integer,
  	"municipios_id" integer,
  	"articulos_id" integer
  );
  
  ALTER TABLE "planes_faqs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "planes_faqs_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "planes" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "planes_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "planes_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "planes_faqs" CASCADE;
  DROP TABLE "planes_faqs_locales" CASCADE;
  DROP TABLE "planes" CASCADE;
  DROP TABLE "planes_locales" CASCADE;
  DROP TABLE "planes_rels" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_planes_fk";
  
  DROP INDEX IF EXISTS "payload_locked_documents_rels_planes_id_idx";
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "articulos_id" integer;
  ALTER TABLE "articulos_faqs" ADD CONSTRAINT "articulos_faqs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articulos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articulos_faqs_locales" ADD CONSTRAINT "articulos_faqs_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articulos_faqs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articulos" ADD CONSTRAINT "articulos_foto_portada_id_media_id_fk" FOREIGN KEY ("foto_portada_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articulos" ADD CONSTRAINT "articulos_autor_id_autores_id_fk" FOREIGN KEY ("autor_id") REFERENCES "public"."autores"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articulos_locales" ADD CONSTRAINT "articulos_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articulos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articulos_texts" ADD CONSTRAINT "articulos_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."articulos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articulos_rels" ADD CONSTRAINT "articulos_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."articulos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articulos_rels" ADD CONSTRAINT "articulos_rels_negocios_fk" FOREIGN KEY ("negocios_id") REFERENCES "public"."negocios"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articulos_rels" ADD CONSTRAINT "articulos_rels_rutas_fk" FOREIGN KEY ("rutas_id") REFERENCES "public"."rutas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articulos_rels" ADD CONSTRAINT "articulos_rels_recursos_fk" FOREIGN KEY ("recursos_id") REFERENCES "public"."recursos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articulos_rels" ADD CONSTRAINT "articulos_rels_municipios_fk" FOREIGN KEY ("municipios_id") REFERENCES "public"."municipios"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articulos_rels" ADD CONSTRAINT "articulos_rels_articulos_fk" FOREIGN KEY ("articulos_id") REFERENCES "public"."articulos"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "articulos_faqs_order_idx" ON "articulos_faqs" USING btree ("_order");
  CREATE INDEX "articulos_faqs_parent_id_idx" ON "articulos_faqs" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "articulos_faqs_locales_locale_parent_id_unique" ON "articulos_faqs_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "articulos_faqs_locales_parent_id_idx" ON "articulos_faqs_locales" USING btree ("_parent_id");
  CREATE INDEX "articulos_foto_portada_idx" ON "articulos" USING btree ("foto_portada_id");
  CREATE INDEX "articulos_autor_idx" ON "articulos" USING btree ("autor_id");
  CREATE INDEX "articulos_estado_idx" ON "articulos" USING btree ("estado");
  CREATE INDEX "articulos_updated_at_idx" ON "articulos" USING btree ("updated_at");
  CREATE INDEX "articulos_created_at_idx" ON "articulos" USING btree ("created_at");
  CREATE UNIQUE INDEX "articulos_slug_idx" ON "articulos_locales" USING btree ("slug","_locale");
  CREATE UNIQUE INDEX "articulos_locales_locale_parent_id_unique" ON "articulos_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "articulos_locales_parent_id_idx" ON "articulos_locales" USING btree ("_parent_id");
  CREATE INDEX "articulos_texts_order_parent" ON "articulos_texts" USING btree ("order","parent_id");
  CREATE INDEX "articulos_texts_locale_parent" ON "articulos_texts" USING btree ("locale","parent_id");
  CREATE INDEX "articulos_rels_order_idx" ON "articulos_rels" USING btree ("order");
  CREATE INDEX "articulos_rels_parent_idx" ON "articulos_rels" USING btree ("parent_id");
  CREATE INDEX "articulos_rels_path_idx" ON "articulos_rels" USING btree ("path");
  CREATE INDEX "articulos_rels_locale_idx" ON "articulos_rels" USING btree ("locale");
  CREATE INDEX "articulos_rels_negocios_id_idx" ON "articulos_rels" USING btree ("negocios_id","locale");
  CREATE INDEX "articulos_rels_rutas_id_idx" ON "articulos_rels" USING btree ("rutas_id","locale");
  CREATE INDEX "articulos_rels_recursos_id_idx" ON "articulos_rels" USING btree ("recursos_id","locale");
  CREATE INDEX "articulos_rels_municipios_id_idx" ON "articulos_rels" USING btree ("municipios_id","locale");
  CREATE INDEX "articulos_rels_articulos_id_idx" ON "articulos_rels" USING btree ("articulos_id","locale");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_articulos_fk" FOREIGN KEY ("articulos_id") REFERENCES "public"."articulos"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_articulos_id_idx" ON "payload_locked_documents_rels" USING btree ("articulos_id");
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "planes_id";
  DROP TYPE "public"."enum_planes_estado";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_planes_estado" AS ENUM('borrador', 'publicado');
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
  
  ALTER TABLE "articulos_faqs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "articulos_faqs_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "articulos" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "articulos_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "articulos_texts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "articulos_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "articulos_faqs" CASCADE;
  DROP TABLE "articulos_faqs_locales" CASCADE;
  DROP TABLE "articulos" CASCADE;
  DROP TABLE "articulos_locales" CASCADE;
  DROP TABLE "articulos_texts" CASCADE;
  DROP TABLE "articulos_rels" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_articulos_fk";
  
  ALTER TABLE "landings" ALTER COLUMN "ambito" SET DATA TYPE text;
  DROP TYPE "public"."enum_landings_ambito";
  CREATE TYPE "public"."enum_landings_ambito" AS ENUM('negocios', 'rutas', 'recursos');
  ALTER TABLE "landings" ALTER COLUMN "ambito" SET DATA TYPE "public"."enum_landings_ambito" USING "ambito"::"public"."enum_landings_ambito";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_articulos_id_idx";
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "planes_id" integer;
  ALTER TABLE "planes_faqs" ADD CONSTRAINT "planes_faqs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."planes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "planes_faqs_locales" ADD CONSTRAINT "planes_faqs_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."planes_faqs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "planes" ADD CONSTRAINT "planes_foto_portada_id_media_id_fk" FOREIGN KEY ("foto_portada_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "planes" ADD CONSTRAINT "planes_autor_id_autores_id_fk" FOREIGN KEY ("autor_id") REFERENCES "public"."autores"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "planes_locales" ADD CONSTRAINT "planes_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."planes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "planes_rels" ADD CONSTRAINT "planes_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."planes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "planes_rels" ADD CONSTRAINT "planes_rels_rutas_fk" FOREIGN KEY ("rutas_id") REFERENCES "public"."rutas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "planes_rels" ADD CONSTRAINT "planes_rels_negocios_fk" FOREIGN KEY ("negocios_id") REFERENCES "public"."negocios"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "planes_rels" ADD CONSTRAINT "planes_rels_recursos_fk" FOREIGN KEY ("recursos_id") REFERENCES "public"."recursos"("id") ON DELETE cascade ON UPDATE no action;
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
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_planes_fk" FOREIGN KEY ("planes_id") REFERENCES "public"."planes"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_planes_id_idx" ON "payload_locked_documents_rels" USING btree ("planes_id");
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "articulos_id";
  DROP TYPE "public"."enum_articulos_estado";`)
}
