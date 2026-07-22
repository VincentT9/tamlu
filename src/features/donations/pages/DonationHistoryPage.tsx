import { Paper, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { donationApi } from "@/features/donations/api";
import { formatDate, formatMoney } from "@/shared/utils/format";
import { PageHeader } from "@/shared/ui/PageHeader";
import { QueryState } from "@/shared/ui/QueryState";
import { StatusChip } from "@/shared/ui/StatusChip";

const paymentMethodLabels: Record<string, string> = {
  BANK_TRANSFER: "Chuyển khoản ngân hàng",
};

export function DonationHistoryPage() {
  const donations = useQuery({ queryKey: ["my-donations"], queryFn: () => donationApi.myDonations({ page: 1, limit: 20 }) });
  return (
    <>
      <PageHeader title="Lịch sử ủng hộ" description="Các khoản ủng hộ cá nhân được ghi nhận từ hệ thống Tâm Lũ." />
      <QueryState isLoading={donations.isLoading} error={donations.error} empty={!donations.data?.data.length} refetch={donations.refetch}>
        <Paper variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Chiến dịch</TableCell>
                <TableCell>Số tiền</TableCell>
                <TableCell>Phương thức</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Ngày</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {donations.data?.data.map((donation) => (
                <TableRow key={donation.id}>
                  <TableCell>{donation.campaignName}</TableCell>
                  <TableCell>{formatMoney(donation.amount)}</TableCell>
                  <TableCell>{paymentMethodLabels[donation.paymentMethod] ?? donation.paymentMethod}</TableCell>
                  <TableCell>
                    <StatusChip value={donation.status} />
                  </TableCell>
                  <TableCell>{formatDate(donation.donatedAt ?? donation.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </QueryState>
    </>
  );
}
