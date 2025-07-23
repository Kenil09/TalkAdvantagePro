import { initSchema as initContextPackSchema } from './collections/contextpack'
import { initSchema as initDocumentSchema } from './collections/documents'

export const initSchema = async () => {
  await initContextPackSchema()
  await initDocumentSchema()
}
