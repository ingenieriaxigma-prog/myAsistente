/**
 * Extrae texto de PDFs usando pdf-parse.
 * Dependencia existente en el proyecto (pdf-parse).
 */
export async function extractPdfText(buffer: Uint8Array | ArrayBuffer): Promise<string> {
  const pdfParseModule = await import('pdf-parse');
  // pdf-parse puede exportar default o el módulo completo, se maneja aquí.
  const pdfParse = (pdfParseModule as any).default ?? pdfParseModule;
  const data = await pdfParse(buffer);
  return typeof data.text === 'string' ? data.text : '';
}

