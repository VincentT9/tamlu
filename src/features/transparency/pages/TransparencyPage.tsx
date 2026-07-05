import DownloadIcon from "@mui/icons-material/Download";
import { Box, Button, Grid, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useParams } from "react-router-dom";
import { transparencyApi } from "@/features/transparency/api";
import { formatDate, formatMoney } from "@/shared/utils/format";
import { MetricCard } from "@/shared/ui/MetricCard";
import { PageHeader } from "@/shared/ui/PageHeader";
import { QueryState } from "@/shared/ui/QueryState";
import { SectionPaper } from "@/shared/ui/SectionPaper";
import { StatusChip } from "@/shared/ui/StatusChip";
import { TamLuMap } from "@/shared/maps/TamLuMap";

const colors = ["#0b6fb3", "#e87624", "#197f5b", "#8b5cf6"];

export function TransparencyPage() {
  const { id = "" } = useParams();
  const financials = useQuery({ queryKey: ["transparency", id, "financials"], queryFn: () => transparencyApi.financials(id), enabled: Boolean(id) });
  const inventory = useQuery({ queryKey: ["transparency", id, "inventory"], queryFn: () => transparencyApi.inventory(id), enabled: Boolean(id) });
  const map = useQuery({ queryKey: ["transparency", id, "map"], queryFn: () => transparencyApi.map(id), enabled: Boolean(id), refetchInterval: 60000 });
  const evidence = useQuery({ queryKey: ["transparency", id, "evidence"], queryFn: () => transparencyApi.evidence(id), enabled: Boolean(id) });

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
    const blob = await transparencyApi.exportReport(id, format);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `tamlu-transparency-${id}.${format}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <PageHeader
        eyebrow="Public Audit Portal"
        title={financials.data?.campaignName ?? "Campaign transparency"}
        description="Trace money in, money out, stock movement, routes, and field proof from one public view."
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
            <MetricCard label="Total income" value={formatMoney(financials.data?.totalIncome)} tone="green" />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <MetricCard label="Total expense" value={formatMoney(financials.data?.totalExpense)} tone="orange" />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <MetricCard label="Remaining balance" value={formatMoney(financials.data?.remainingBalance)} />
          </Grid>
          <Grid size={{ xs: 12, lg: 5 }}>
            <SectionPaper>
              <Typography variant="h6" fontWeight={900} sx={{ mb: 2 }}>
                Spending breakdown
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
                Public ledger
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Type</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Balance</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Date</TableCell>
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
              <Typography variant="h6" fontWeight={900} sx={{ mb: 2 }}>
                Verified logistics map
              </Typography>
              <QueryState isLoading={inventory.isLoading || map.isLoading} error={inventory.error || map.error}>
                <TamLuMap markers={markers} />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Public map uses campaign transparency data only. Backend area needs and route summaries are shown below when no coordinates are supplied.
                </Typography>
              </QueryState>
            </SectionPaper>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <SectionPaper>
              <Typography variant="h6" fontWeight={900} sx={{ mb: 2 }}>
                Inventory movement
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
                Evidence vault
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
                      {invoice.invoiceUrl ? <Button href={invoice.invoiceUrl} target="_blank">Open invoice</Button> : null}
                    </Paper>
                  ))}
                  {evidence.data?.deliveryProofs.map((proof) => (
                    <Paper variant="outlined" key={proof.id} sx={{ p: 1.5 }}>
                      <Typography fontWeight={800}>{proof.disbursementItem}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {proof.photos.length} photos, {proof.signatures.length} signatures
                      </Typography>
                    </Paper>
                  ))}
                </Stack>
              </QueryState>
            </SectionPaper>
          </Grid>
        </Grid>
      </QueryState>
    </>
  );
}
