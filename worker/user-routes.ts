import { Hono } from "hono";
import type { Env } from './core-utils';
import { UserEntity, ChatBoardEntity, DocumentEntity, VersionEntity } from "./entities";
import { ok, bad, notFound, isStr } from './core-utils';
import type { ExtractionResult, CloudDocument, DocumentVersion } from "@shared/types";
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  app.get('/api/test', (c) => c.json({ success: true, data: { name: 'DocuFlux API' }}));
  // DOCUMENTS
  app.get('/api/documents', async (c) => {
    const cursor = c.req.query('cursor');
    const limit = c.req.query('limit');
    const page = await DocumentEntity.list(c.env, cursor ?? null, limit ? Number(limit) : 20);
    return ok(c, page);
  });
  app.post('/api/documents', async (c) => {
    const { fileName } = await c.req.json() as { fileName: string };
    if (!fileName) return bad(c, 'fileName required');
    const doc: CloudDocument = {
      id: crypto.randomUUID(),
      fileName,
      currentVersionId: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ownerId: "anonymous"
    };
    return ok(c, await DocumentEntity.create(c.env, doc));
  });
  app.get('/api/documents/:id', async (c) => {
    const doc = new DocumentEntity(c.env, c.req.param('id'));
    if (!await doc.exists()) return notFound(c, 'Document not found');
    return ok(c, await doc.getState());
  });
  // VERSIONS
  app.get('/api/documents/:id/versions', async (c) => {
    const docId = c.req.param('id');
    const versions = await VersionEntity.listByDocument(c.env, docId);
    return ok(c, versions);
  });
  app.post('/api/documents/:id/versions', async (c) => {
    const docId = c.req.param('id');
    const { label, result } = await c.req.json() as { label: string, result: ExtractionResult };
    const docEntity = new DocumentEntity(c.env, docId);
    if (!await docEntity.exists()) return notFound(c, 'Document not found');
    const version: DocumentVersion = {
      id: crypto.randomUUID(),
      documentId: docId,
      label: label || 'Manual Save',
      result,
      createdAt: new Date().toISOString()
    };
    const created = await VersionEntity.createForDocument(c.env, version);
    // Update document's primary version pointer
    await docEntity.patch({
      currentVersionId: created.id,
      updatedAt: created.createdAt
    });
    return ok(c, created);
  });
  app.put('/api/documents/:id/promote', async (c) => {
    const docId = c.req.param('id');
    const { versionId } = await c.req.json() as { versionId: string };
    const docEntity = new DocumentEntity(c.env, docId);
    const verEntity = new VersionEntity(c.env, versionId);
    if (!await docEntity.exists()) return notFound(c, 'Document not found');
    if (!await verEntity.exists()) return notFound(c, 'Version not found');
    await docEntity.patch({
      currentVersionId: versionId,
      updatedAt: new Date().toISOString()
    });
    return ok(c, { success: true });
  });
  // LEGACY ROUTES
  app.get('/api/users', async (c) => {
    await UserEntity.ensureSeed(c.env);
    const page = await UserEntity.list(c.env, c.req.query('cursor') ?? null);
    return ok(c, page);
  });
}