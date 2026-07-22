import { Box, Button, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notificationApi } from "@/features/notifications/api";
import { formatDate } from "@/shared/utils/format";
import { PageHeader } from "@/shared/ui/PageHeader";
import { QueryState } from "@/shared/ui/QueryState";
import { StatusChip } from "@/shared/ui/StatusChip";

const notificationTypeLabels: Record<string, string> = {
  SOS: "SOS",
  MISSION: "Nhiệm vụ",
  DONATION: "Ủng hộ",
  PAYMENT: "Thanh toán",
  APPROVAL: "Phê duyệt",
  INVENTORY: "Kho hàng",
  SHIPMENT: "Vận chuyển",
  SYSTEM: "Hệ thống",
};

export function NotificationsPage() {
  const queryClient = useQueryClient();
  const notifications = useQuery({ queryKey: ["notifications"], queryFn: () => notificationApi.list({ page: 1, limit: 50 }), refetchInterval: 60000 });
  const markRead = useMutation({
    mutationFn: notificationApi.markRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });
  return (
    <>
      <PageHeader title="Thông báo" description="Cập nhật từ hệ thống về nhiệm vụ, cứu trợ, thanh toán và phê duyệt." />
      <QueryState isLoading={notifications.isLoading} error={notifications.error} empty={!notifications.data?.data.length} refetch={notifications.refetch}>
        <Stack spacing={1.5} sx={{ mb: 2 }}>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 0 }}>
            <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1}>
              <Box>
                <Typography fontWeight={900}>Trung tâm thông báo</Typography>
                <Typography variant="body2" color="text.secondary">Rà soát cập nhật vận hành và đánh dấu đã đọc sau khi xử lý.</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">{notifications.data?.data.filter((item) => !item.isRead).length ?? 0} chưa đọc</Typography>
            </Stack>
          </Paper>
        </Stack>
        <Paper variant="outlined"><Table size="small"><TableHead><TableRow><TableCell>Tiêu đề</TableCell><TableCell>Loại</TableCell><TableCell>Ngày</TableCell><TableCell /></TableRow></TableHead><TableBody>
          {notifications.data?.data.map((item) => (
            <TableRow key={item.id} hover selected={!item.isRead}><TableCell><Typography fontWeight={item.isRead ? 700 : 900}>{item.title}</Typography></TableCell><TableCell><StatusChip value={notificationTypeLabels[item.type] ?? item.type} /></TableCell><TableCell>{formatDate(item.createdAt)}</TableCell><TableCell align="right">{!item.isRead ? <Button onClick={() => markRead.mutate(item.id)}>Đánh dấu đã đọc</Button> : "Đã đọc"}</TableCell></TableRow>
          ))}
        </TableBody></Table></Paper>
      </QueryState>
    </>
  );
}
