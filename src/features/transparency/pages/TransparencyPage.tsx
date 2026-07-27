import DownloadIcon from "@mui/icons-material/Download";
import { Box, Button, Grid, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useParams } from "react-router-dom";
import { transparencyApi } from "@/features/transparency/api";
import { formatDate, formatMoney } from "@/shared/utils/format";
import { MetricCard } from "@/shared/ui/MetricCard";
import { PageHeader } from "@/shared/ui/PageHeader";
import { PublicPageFrame } from "@/shared/ui/PublicPageFrame";
import { QueryState } from "@/shared/ui/QueryState";
import { SectionPaper } from "@/shared/ui/SectionPaper";
import { StatusChip } from "@/shared/ui/StatusChip";
import { TamLuMap } from "@/shared/maps/TamLuMap";
import { useToast } from "@/shared/ui/toast";

const colors = ["var(--color-green-700)", "var(--color-green-600)", "var(--color-green-200)", "var(--color-cream-100)"];

export function TransparencyPage() {
  const { id = "" } = useParams();
  const showToast = useToast((state) => state.showToast);
  const financials = useQuery({ queryKey: ["transparency", id, "financials"], queryFn: () => transparencyApi.financials(id), enabled: Boolean(id) });
  const inventory = useQuery({ queryKey: ["transparency", id, "inventory"], queryFn: () => transparencyApi.inventory(id), enabled: Boolean(id) });
  const map = useQuery({ queryKey: ["transparency", id, "map"], queryFn: () => transparencyApi.map(id), enabled: Boolean(id), refetchInterval: 60000 });
  const evidence = useQuery({ queryKey: ["transparency", id, "evidence"], queryFn: () => transparencyApi.evidence(id), enabled: Boolean(id) });

  const displayRemainingBalance = (financials.data?.totalIncome ?? 0) - (financials.data?.totalExpense ?? 0);
  const breakdown = Object.entries(financials.data?.categoryBreakdown ?? {}).map(([name, value]) => ({ name, value }));
  const markers = inventory.data?.warehouses.map((warehouse) => ({
    id: warehouse.id,
    title: warehouse.name,
    subtitle: warehouse.address,
    latitude: warehouse.latitude,
    longitude: warehouse.longitude,
    type: "warehouse" as const,
  })) ?? [];

  const exportReport = async (format: "csv" | "pdf") => {
    let blob: Blob;
    try {
      blob = await transparencyApi.exportReport(id, format);
      if (!blob.size) throw new Error("Empty export");
    } catch {
      const lines = buildTransparencyLines(financials.data, inventory.data);
      blob = format === "csv" ? buildCsvBlob(lines) : buildSimplePdfBlob(lines);
      showToast("API xuất báo cáo chưa sẵn sàng, hệ thống đã tạo file từ dữ liệu đang hiển thị.", "warning");
    }
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `tamlu-transparency-${id}.${format}`;
    link.rel = "noopener";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <PublicPageFrame>
      <PageHeader
        eyebrow="Cổng kiểm toán công khai"
        title={financials.data?.campaignName ?? "Minh bạch chiến dịch"}
        description="Theo dõi nguồn thu, khoản chi, luân chuyển hàng hóa, tuyến phân phối và minh chứng hiện trường trong một màn hình công khai."
        actions={
          <Stack direction="row" spacing={1}>
            <Button startIcon={<DownloadIcon />} onClick={() => exportReport("csv")}>
              CSV
            </Button>
            <Button startIcon={<DownloadIcon />} onClick={() => exportReport("pdf")}>
              PDF
            </Button>
          </Stack>
        }
      />
      <QueryState isLoading={financials.isLoading} error={financials.error} refetch={financials.refetch}>
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, md: 4 }}>
            <MetricCard label="Tổng thu" value={formatMoney(financials.data?.totalIncome)} tone="green" />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <MetricCard label="Tổng chi" value={formatMoney(financials.data?.totalExpense)} tone="orange" />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <MetricCard label="Số dư còn lại" value={formatMoney(displayRemainingBalance)} />
          </Grid>
          <Grid size={{ xs: 12, lg: 5 }}>
            <SectionPaper>
              <Typography variant="h6" fontWeight={900} sx={{ mb: 2 }}>
                Cơ cấu chi tiêu
              </Typography>
              <Box sx={{ height: 280 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={breakdown} dataKey="value" nameKey="name" outerRadius={100} label>
                      {breakdown.map((entry, index) => (
                        <Cell key={entry.name} fill={colors[index % colors.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatMoney(Number(value))} />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </SectionPaper>
          </Grid>
          <Grid size={{ xs: 12, lg: 7 }}>
            <SectionPaper>
              <Typography variant="h6" fontWeight={900} sx={{ mb: 2 }}>
                Sổ thu chi công khai
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Loại giao dịch</TableCell>
                    <TableCell>Số tiền</TableCell>
                    <TableCell>Số dư</TableCell>
                    <TableCell>Mô tả</TableCell>
                    <TableCell>Ngày</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {financials.data?.ledgerHistory.data.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>{row.transactionType}</TableCell>
                      <TableCell>{formatMoney(row.amount)}</TableCell>
                      <TableCell>{formatMoney(row.runningBalance)}</TableCell>
                      <TableCell>{row.description}</TableCell>
                      <TableCell>{formatDate(row.entryDate)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </SectionPaper>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <SectionPaper>
              <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1.5} sx={{ mb: 2 }}>
                <Box>
                  <Typography variant="h6" fontWeight={900}>
                    Bản đồ hậu cần đã xác minh
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Bản đồ công khai chỉ sử dụng dữ liệu minh bạch của chiến dịch.
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <StatusChip value="ACTIVE" />
                  <StatusChip value="VERIFIED" />
                </Stack>
              </Stack>
              <QueryState isLoading={inventory.isLoading || map.isLoading} error={inventory.error || map.error}>
                <Box sx={{ position: "relative" }}>
                  <TamLuMap markers={markers} height={500} />
                  <Paper
                    variant="outlined"
                    sx={{
                      position: { xs: "static", md: "absolute" },
                      right: 16,
                      top: 16,
                      mt: { xs: 2, md: 0 },
                      width: { xs: "100%", md: 280 },
                      p: 2,
                      borderRadius: 0,
                      bgcolor: "var(--color-surface)",
                      backdropFilter: "blur(14px)",
                    }}
                  >
                    <Stack spacing={1.25}>
                      <Typography fontWeight={900}>Lớp dữ liệu công khai</Typography>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2" fontWeight={800}>Kho hàng</Typography>
                        <Typography variant="body2" color="text.secondary">{markers.length}</Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2" fontWeight={800}>Tuyến phân phối</Typography>
                        <Typography variant="body2" color="text.secondary">{map.data?.activeRoutes.length ?? 0}</Typography>
                      </Stack>
                      <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                        Vị trí SOS thô được loại khỏi bản đồ công khai để bảo vệ an toàn và quyền riêng tư.
                      </Typography>
                    </Stack>
                  </Paper>
                </Box>
              </QueryState>
            </SectionPaper>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <SectionPaper>
              <Typography variant="h6" fontWeight={900} sx={{ mb: 2 }}>
                Luân chuyển hàng cứu trợ
              </Typography>
              {inventory.data?.transactionHistory.slice(0, 10).map((tx) => (
                <Stack key={tx.id} direction="row" justifyContent="space-between" sx={{ py: 1, borderBottom: "1px solid", borderColor: "divider" }}>
                  <Box>
                    <Typography fontWeight={800}>{tx.itemName}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {tx.reason}
                    </Typography>
                  </Box>
                  <Typography>{tx.type} {tx.quantity}</Typography>
                </Stack>
              ))}
            </SectionPaper>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <SectionPaper>
              <Typography variant="h6" fontWeight={900} sx={{ mb: 2 }}>
                Kho minh chứng
              </Typography>
              <QueryState isLoading={evidence.isLoading} error={evidence.error}>
                <Stack spacing={1.5}>
                  {evidence.data?.invoices.map((invoice) => (
                    <Paper variant="outlined" key={invoice.id} sx={{ p: 1.5 }}>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography fontWeight={800}>{invoice.itemName}</Typography>
                        <StatusChip value={invoice.expenseCategory} />
                      </Stack>
                      <Typography>{formatMoney(invoice.amount)}</Typography>
                      {invoice.invoiceUrl ? <Button href={invoice.invoiceUrl} target="_blank">Mở hóa đơn</Button> : null}
                    </Paper>
                  ))}
                  {evidence.data?.deliveryProofs.map((proof) => (
                    <Paper variant="outlined" key={proof.id} sx={{ p: 1.5 }}>
                      <Typography fontWeight={800}>{proof.disbursementItem}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {proof.photos.length} ảnh, {proof.signatures.length} chữ ký
                      </Typography>
                    </Paper>
                  ))}
                </Stack>
              </QueryState>
            </SectionPaper>
          </Grid>
        </Grid>
      </QueryState>
    </PublicPageFrame>
  );
}

function buildTransparencyLines(financials?: { campaignName?: string; totalIncome?: number; totalExpense?: number; remainingBalance?: number; ledgerHistory?: { data: Array<{ transactionType: string; amount: number; runningBalance: number; description?: string | null; entryDate: string }> } }, inventory?: { transactionHistory?: Array<{ itemName: string; type: string; quantity: number; reason?: string | null; createdAt: string }> }) {
  const lines = [
    `Báo cáo minh bạch: ${financials?.campaignName ?? "Chiến dịch Tâm Lũ"}`,
    `Tổng thu: ${formatMoney(financials?.totalIncome)}`,
    `Tổng chi: ${formatMoney(financials?.totalExpense)}`,
    `Số dư: ${formatMoney((financials?.totalIncome ?? 0) - (financials?.totalExpense ?? 0))}`,
    "",
    "Sổ thu chi",
    ...(financials?.ledgerHistory?.data ?? []).map((row) => `${formatDate(row.entryDate)} | ${row.transactionType} | ${formatMoney(row.amount)} | Số dư ${formatMoney(row.runningBalance)} | ${row.description ?? ""}`),
    "",
    "Luân chuyển hàng cứu trợ",
    ...(inventory?.transactionHistory ?? []).map((row) => `${formatDate(row.createdAt)} | ${row.itemName} | ${row.type} ${row.quantity} | ${row.reason ?? ""}`),
  ];
  return lines;
}

function buildCsvBlob(lines: string[]) {
  const csv = lines.map((line) => `"${line.replace(/"/g, '""')}"`).join("\r\n");
  return new Blob([`\ufeff${csv}`], { type: "text/csv;charset=utf-8" });
}

function buildSimplePdfBlob(lines: string[]) {
  const escapedLines = lines.slice(0, 42).map((line) => line.replace(/[()\\]/g, "\\$&"));
  const stream = [
    "BT",
    "/F1 12 Tf",
    "50 790 Td",
    "14 TL",
    ...escapedLines.map((line, index) => `${index ? "T*" : ""} (${line}) Tj`),
    "ET",
  ].join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return new Blob([pdf], { type: "application/pdf" });
}
