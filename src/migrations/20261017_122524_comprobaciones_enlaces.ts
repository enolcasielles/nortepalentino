import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_comprobaciones_enlaces_coleccion" AS ENUM('negocios', 'rutas', 'recursos');
  CREATE TYPE "public"."enum_comprobaciones_enlaces_campo" AS ENUM('fuente_url', 'web');
  CREATE TYPE "public"."enum_comprobaciones_enlaces_estado" AS ENUM('ok', 'bloqueado', 'error');
  CREATE TABLE "comprobaciones_enlaces" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"coleccion" "enum_comprobaciones_enlaces_coleccion" NOT NULL,
  	"documento" numeric NOT NULL,
  	"campo" "enum_comprobaciones_enlaces_campo" NOT NULL,
  	"nombre" varchar,
  	"url" varchar NOT NULL,
  	"estado" "enum_comprobaciones_enlaces_estado" NOT NULL,
  	"codigo" numeric,
  	"fallos_seguidos" numeric DEFAULT 0,
  	"detalle" varchar,
  	"primer_fallo" timestamp(3) with time zone,
  	"ultima_comprobacion" timestamp(3) with time zone NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "comprobaciones_enlaces_id" integer;
  CREATE INDEX "comprobaciones_enlaces_coleccion_idx" ON "comprobaciones_enlaces" USING btree ("coleccion");
  CREATE INDEX "comprobaciones_enlaces_documento_idx" ON "comprobaciones_enlaces" USING btree ("documento");
  CREATE INDEX "comprobaciones_enlaces_estado_idx" ON "comprobaciones_enlaces" USING btree ("estado");
  CREATE INDEX "comprobaciones_enlaces_updated_at_idx" ON "comprobaciones_enlaces" USING btree ("updated_at");
  CREATE INDEX "comprobaciones_enlaces_created_at_idx" ON "comprobaciones_enlaces" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_comprobaciones_enlaces_fk" FOREIGN KEY ("comprobaciones_enlaces_id") REFERENCES "public"."comprobaciones_enlaces"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_comprobaciones_enlaces_id_idx" ON "payload_locked_documents_rels" USING btree ("comprobaciones_enlaces_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "comprobaciones_enlaces" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "comprobaciones_enlaces" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_comprobaciones_enlaces_fk";
  
  DROP INDEX IF EXISTS "payload_locked_documents_rels_comprobaciones_enlaces_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "comprobaciones_enlaces_id";
  DROP TYPE "public"."enum_comprobaciones_enlaces_coleccion";
  DROP TYPE "public"."enum_comprobaciones_enlaces_campo";
  DROP TYPE "public"."enum_comprobaciones_enlaces_estado";`)
}
