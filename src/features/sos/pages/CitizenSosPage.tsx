import { Button, Grid, Stack, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { sosApi } from "@/features/sos/api";
import { formatDate } from "@/shared/utils/format";
import { PageHeader } from "@/shared/ui/PageHeader";
import { QueryState } from "@/shared/ui/QueryState";
import { StatusChip } from "@/shared/ui/StatusChip";
import { Card } from "@/components/Card";

export function CitizenSosPage() {
  const cases = useQuery({ queryKey: ["sos", "my"], queryFn: () => sosApi.my({ page: 1, limit: 20 }), refetchInterval: 30000 });

  return (
    <>
      <PageHeader
        title="Yêu cầu SOS của tôi"
        description="Theo dõi trạng thái cứu hộ từ khi chờ xác minh đến khi xác nhận hoàn tất."
        actions={<Button component={Link} to="/sos/new" variant="contained" color="error">Tạo SOS</Button>}
      />
      <QueryState isLoading={cases.isLoading} error={cases.error} empty={!cases.data?.data.length} refetch={cases.refetch}>
        <Grid container spacing={2}>
          {cases.data?.data.map((item) => (
            <Grid size={{ xs: 12, md: 6, xl: 4 }} key={item.id}>
              <Card className="h-full">
                <Stack spacing={1.5}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <StatusChip value={item.status} />
                    <StatusChip value={item.priorityLevel} />
                  </Stack>
                  <Stack spacing={0.5}>
                    <Typography fontWeight={900}>{item.title}</Typography>
                    <Typography variant="body2" color="text.secondary">{item.address || "Chưa cung cấp địa chỉ"}</Typography>
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    {item.numPeople} người cần cứu hộ - Tạo lúc {formatDate(item.createdAt)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.description}
                  </Typography>
                  <Button component={Link} to={`/citizen/sos/${item.id}`} variant="outlined">
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
