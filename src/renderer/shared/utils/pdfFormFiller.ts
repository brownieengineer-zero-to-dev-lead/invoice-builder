import { PDFDocument } from 'pdf-lib';
import { saveAs } from 'file-saver';
import sarabunRegularUrl from '../../assets/sarabun/Sarabun-Regular.ttf';

export type PdfFieldValues = Record<string, string | boolean | number | undefined | null>;

const loadSarabunFont = async (): Promise<Uint8Array> => {
  const res = await fetch(sarabunRegularUrl);
  return new Uint8Array(await res.arrayBuffer());
};

export const fillPdfForm = async (
  templateUrl: string,
  fieldValues: PdfFieldValues
): Promise<Uint8Array> => {
  const [existingPdfBytes, fontBytes, fontkitModule] = await Promise.all([
    fetch(templateUrl).then(r => r.arrayBuffer()),
    loadSarabunFont(),
    import('@pdf-lib/fontkit'),
  ]);
  const fontkit = fontkitModule.default ?? fontkitModule;

  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pdfDoc.registerFontkit(fontkit as any);
  const font = await pdfDoc.embedFont(fontBytes);
  const form = pdfDoc.getForm();

  for (const [name, value] of Object.entries(fieldValues)) {
    if (value === null || value === undefined) continue;

    try {
      if (typeof value === 'boolean') {
        const field = form.getCheckBox(name);
        if (value) field.check();
        else field.uncheck();
      } else {
        const field = form.getTextField(name);
        field.setText(String(value));
        field.updateAppearances(font);
      }
    } catch {
      // field not found in template — skip
    }
  }

  form.flatten();
  return pdfDoc.save();
};

export const mergePdfs = async (pdfBytesArray: Uint8Array[]): Promise<Uint8Array> => {
  const mergedDoc = await PDFDocument.create();
  for (const pdfBytes of pdfBytesArray) {
    const doc = await PDFDocument.load(pdfBytes);
    const pages = await mergedDoc.copyPages(doc, doc.getPageIndices());
    pages.forEach(p => mergedDoc.addPage(p));
  }
  return mergedDoc.save();
};

export const downloadPdf = (bytes: Uint8Array, filename: string) => {
  const blob = new Blob([bytes], { type: 'application/pdf' });
  saveAs(blob, filename);
};
