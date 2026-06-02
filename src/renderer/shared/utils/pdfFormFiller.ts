import { PDFDocument, PDFFont, PDFForm, PDFName } from 'pdf-lib';
import thSarabunNewUrl from '../../assets/sarabun-new/THSarabunNew Bold.ttf';


export type PdfFieldValues = Record<string, string | boolean | number | undefined | null>;

const loadFont = async (): Promise<Uint8Array> => {
  const res = await fetch(thSarabunNewUrl);
  return new Uint8Array(await res.arrayBuffer());
};

const DEFAULT_FONT_SIZE = 14

export const loadPDF = async (templateUrl: string): Promise<PDFDocument> => {
  const existingPdfBytes = await fetch(templateUrl).then(r => r.arrayBuffer());
  return PDFDocument.load(existingPdfBytes);
};

export const fillForm = async (
  pdf: PDFDocument,
  fieldValues: PdfFieldValues,
  fontSizes?: Record<string, number>,
): Promise<void> => {
  const [fontBytes, fontkitModule] = await Promise.all([loadFont(), import('@pdf-lib/fontkit')]);
  const fontkit = fontkitModule.default ?? fontkitModule;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pdf.registerFontkit(fontkit as any);
  const font = await pdf.embedFont(fontBytes);
  const form = pdf.getForm();

  for (const [name, value] of Object.entries(fieldValues)) {
    if (value == null) continue;
    try {
      if (typeof value === 'boolean') { fillCheckBox(form, name, value); continue; }
      if (typeof value === 'number') { fillRadioGroup(form, name, value); continue; }
      fillTextField(form, name, String(value), font, fontSizes);
    } catch {
      // field not found in template — skip
    }
  }
};

export const getUrlFromPDF = async (pdf: PDFDocument, mode: 'preview' | 'export'): Promise<string> => {
  if (mode === 'preview') pdf.getForm().flatten();
  const bytes = await pdf.save();
  const blob = new Blob([bytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  return url
};

export const mergePdfDocs = async (docs: PDFDocument[]): Promise<PDFDocument> => {
  const mergedDoc = await PDFDocument.create();
  for (const doc of docs) {
    const pages = await mergedDoc.copyPages(doc, doc.getPageIndices());
    pages.forEach(p => mergedDoc.addPage(p));
  }
  return mergedDoc;
};

function fillCheckBox(form: PDFForm, name: string, value: boolean): void {
  const field = form.getCheckBox(name);
  value ? field.check() : field.uncheck();
}

function fillRadioGroup(form: PDFForm, name: string, selectedIndex: number): void {
  const rg = form.getRadioGroup(name);
  const widgets = rg.acroField.getWidgets();
  widgets.forEach((widget, i) => {
    if (i === selectedIndex) {
      const onValue = widget.getOnValue();
      if (onValue) {
        widget.setAppearanceState(onValue);
        rg.acroField.setValue(onValue);
      }
    } else {
      widget.setAppearanceState(PDFName.of('Off'));
    }
  });
}

function fillTextField(
  form: PDFForm,
  name: string,
  value: string,
  font: PDFFont,
  fontSizes?: Record<string, number>,
): void {
  const field = form.getTextField(name);
  field.setText(value);
  field.setFontSize(fontSizes?.[name] ?? DEFAULT_FONT_SIZE);
  field.updateAppearances(font);
}
