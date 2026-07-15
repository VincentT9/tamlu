import { Box, Button, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notificationApi } from "@/features/notifications/api";
import { formatDate } from "@/shared/utils/format";
import { PageHeader } from "@/shared/ui/PageHeader";
import { QueryState } from "@/shared/ui/QueryState";
import { StatusChip } from "@/shared/ui/StatusChip";

export function NotificationsPage() {
  const queryClient = useQueryClient();
  const notifications = useQuery({ queryKey: ["notifications"], queryFn: () => notificationApi.list({ page: 1, limit: 50 }), refetchInterval: 60000 });
  const markRead = useMutation({
    mutationFn: notificationApi.markRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });
  return (
    <>
      <PageHeader title="Notifications" description="Backend-generated updates for mission, aid, payment, and approval events." />
      <QueryState isLoading={notifications.isLoading} error={notifications.error} empty={!notifications.data?.data.length} refetch={notifications.refetch}>
        <Stack spacing={1.5} sx={{ mb: 2 }}>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
            <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1}>
              <Box>
                <Typography fontWeight={900}>Notification center</Typography>
                <Typography variant="body2" color="text.secondary">Review operational updates and mark items read once handled.</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">{notifications.data?.data.filter((item) => !item.isRead).length ?? 0} unread</Typography>
            </Stack>
          </Paper>
        </Stack>
        <Paper variant="outlined"><Table size="small"><TableHead><TableRow><TableCell>Title</TableCell><TableCell>Type</TableCell><TableCell>Date</TableCell><TableCell /></TableRow></TableHead><TableBody>
          {notifications.data?.data.map((item) => (
            <TableRow key={item.id} hover selected={!item.isRead}><TableCell><Typography fontWeight={item.isRead ? 700 : 900}>{item.title}</Typography></TableCell><TableCell><StatusChip value={item.type} /></TableCell><TableCell>{formatDate(item.createdAt)}</TableCell><TableCell align="right">{!item.isRead ? <Button onClick={() => markRead.mutate(item.id)}>Mark read</Button> : "Read"}</TableCell></TableRow>
          ))}
        </TableBody></Table></Paper>
      </QueryState>
    </>
  );
}
