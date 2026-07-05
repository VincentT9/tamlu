import { Button, Paper, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
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
        <Paper variant="outlined"><Table size="small"><TableHead><TableRow><TableCell>Title</TableCell><TableCell>Type</TableCell><TableCell>Date</TableCell><TableCell /></TableRow></TableHead><TableBody>
          {notifications.data?.data.map((item) => (
            <TableRow key={item.id}><TableCell>{item.title}</TableCell><TableCell><StatusChip value={item.type} /></TableCell><TableCell>{formatDate(item.createdAt)}</TableCell><TableCell align="right">{!item.isRead ? <Button onClick={() => markRead.mutate(item.id)}>Mark read</Button> : "Read"}</TableCell></TableRow>
          ))}
        </TableBody></Table></Paper>
      </QueryState>
    </>
  );
}
