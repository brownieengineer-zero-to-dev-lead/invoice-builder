import { useCallback } from 'react';
import { getApi } from '../../api/restApi';
import type { TaxReportSummary } from '../../utils/pdfExports/pnd3PdfExport';
import type { RequestHook } from '../../types/requestHook';
import type { Response } from '../../types/response';
import { useAsyncAction } from '../ayncAction/useAsyncAction';

interface UseWhtTaxReportSummaryParams extends RequestHook<Response<TaxReportSummary[]>> {
  filter?: { businessId?: number; month?: number; year?: number; pndType?: string };
}

export const useWhtTaxReportSummary = ({
  showLoader = true,
  immediate = true,
  filter,
  onDone
}: UseWhtTaxReportSummaryParams) => {
  const asyncFn = useCallback(
    () => getApi().getWhtTaxReportSummary(filter ?? {}),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filter?.businessId, filter?.month, filter?.year, filter?.pndType]
  );
  const { data, execute } = useAsyncAction<Response<TaxReportSummary[]>>(asyncFn, {
    showLoader,
    immediate,
    onDone: onDone as ((d: Response<TaxReportSummary[]>) => void) | undefined
  });
  return { summaries: (data?.data ?? []) as TaxReportSummary[], execute };
};
