import { createRequire } from "module";
import { Document } from "@langchain/core/documents";
const require = createRequire(import.meta.url);
const pdfjsLib = require("pdfjs-dist/legacy/build/pdf.mjs");

export const pdfTextExtractor = async (buffer: Uint8Array, source: string): Promise<Document[]> => {
  try {
    const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
    const numPages = pdf.numPages;
    const docs: Document[] = [];

    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const text = content.items.map((item: any) => item.str).join(" ");
      docs.push(
        new Document({
          pageContent: text,
          metadata: {
            source,
            page: i,
          },
        }),
      );
    }

    console.log(`Loaded ${docs.length} pages from ${source}`);
    return docs;
  } catch (error) {
    console.error("Error extracting PDF text:", error);
    return [];
  }
};
