import { Alert, Button, Grid, Stack, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "react-router-dom";
import { sosApi } from "@/features/sos/api";
import { formatDate } from "@/shared/utils/format";
import { PageHeader } from "@/shared/ui/PageHeader";
import { QueryState } from "@/shared/ui/QueryState";
import { StatusChip } from "@/shared/ui/StatusChip";
import { Card } from "@/components/Card";

export function CitizenSosPage() {
  const cases = useQuery({ queryKey: ["sos", "my"], queryFn: () => sosApi.my({ page: 1, limit: 20 }), refetchInterval: 30000 });
  const location = useLocation();
  const createdSosId = (location.state as { createdSosId?: string } | null)?.createdSosId;

  return (
    <>
      <PageHeader
        title="Yêu cầu SOS của tôi"
        description="Theo dõi trạng thái cứu hộ từ khi chờ xác minh đến khi xác nhận hoàn tất."
        actions={<Button component={Link} to="/sos/new" variant="contained" color="error">Tạo SOS</Button>}
      />
      {createdSosId ? (
        <Alert
          severity="success"
          sx={{ mb: 2 }}
          action={
            <Stack direction="row" spacing={1}>
              <Button component={Link} to={`/citizen/sos/${createdSosId}`} color="inherit" size="small">
                Xem chi tiết
              </Button>
              <Button component={Link} to="/sos/new" color="inherit" size="small">
                Quay lại biểu mẫu
              </Button>
            </Stack>
          }
        >
          Yêu cầu SOS đã được gửi. Bạn có thể xem chi tiết hoặc quay lại biểu mẫu để gửi yêu cầu khác.
        </Alert>
      ) : null}
      <QueryState isLoading={cases.isLoading} error={cases.error} empty={!cases.data?.data.length} refetch={cases.refetch}>
        <Grid container spacing={2}>
          {cases.data?.data.map((item) => (
            <Grid size={{ xs: 12, md: 6, xl: 4 }} key={item.id}>
              <Card className="tamlu-motion-surface h-full border-t-[3px] border-t-[var(--color-green-600)] transition-[transform,border-color] hover:-translate-y-0.5 hover:border-[var(--color-border-strong)]">
                <Stack spacing={1.5} className="h-full">
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <StatusChip value={item.status} />
                    <StatusChip value={item.priorityLevel} />
                  </Stack>
                  <Stack spacing={0.5}>
                    <Typography component="h2" sx={{ fontSize: 20, fontWeight: 800, overflowWrap: "anywhere" }}>{item.title}</Typography>
                    <Typography variant="body2" color="text.secondary">{item.address || "Chưa cung cấp địa chỉ"}</Typography>
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    {item.numPeople} người cần cứu hộ - Tạo lúc {formatDate(item.createdAt)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden", flex: 1 }}>
                    {item.description}
                  </Typography>
                  <Button component={Link} to={`/citizen/sos/${item.id}`} variant="outlined" fullWidth>
                    Xem chi tiết
                  </Button>
                </Stack>
              </Card>
            </Grid>
          ))}
        </Grid>
      </QueryState>
    </>
  );
}
