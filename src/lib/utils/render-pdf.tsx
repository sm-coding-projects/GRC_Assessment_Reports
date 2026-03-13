import { pdf } from "@react-pdf/renderer";
import { PdfTemplate, type PdfTemplateProps } from "@/components/reports/pdf-template";

export async function renderPdf(props: PdfTemplateProps): Promise<Blob> {
  return pdf(<PdfTemplate {...props} />).toBlob();
}
