import { Paper, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { donationApi } from "@/features/donations/api";
import { formatDate, formatMoney } from "@/shared/utils/format";
import { PageHeader } from "@/shared/ui/PageHeader";
import { QueryState } from "@/shared/ui/QueryState";
import { StatusChip } from "@/shared/ui/StatusChip";

export function DonationHistoryPage() {
  const donations = useQuery({ queryKey: ["my-donations"], queryFn: () => donationApi.myDonations({ page: 1, limit: 20 }) });
  return (
    <>
      <PageHeader title="Donation History" description="Your personal donation records from the TamLu backend." />
      <QueryState isLoading={donations.isLoading} error={donations.error} empty={!donations.data?.data.length} refetch={donations.refetch}>
        <Paper variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Campaign</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Method</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {donations.data?.data.map((donation) => (
                <TableRow key={donation.id}>
                  <TableCell>{donation.campaignName}</TableCell>
                  <TableCell>{formatMoney(donation.amount)}</TableCell>
                  <TableCell>{donation.paymentMethod}</TableCell>
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
