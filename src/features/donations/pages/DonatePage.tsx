import PaidIcon from "@mui/icons-material/Paid";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Box, Button, Grid, Paper, Stack, TextField, Typography } from "@mui/material";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import { z } from "zod";
import { useAuthStore } from "@/features/auth/store";
import { donationApi } from "@/features/donations/api";
import { getErrorMessage } from "@/shared/api/client";
import { getCampaignImageUrl, setCampaignImageFallback } from "@/shared/utils/campaignImage";
import { formatMoney } from "@/shared/utils/format";
import { MetricCard } from "@/shared/ui/MetricCard";
import { PageHeader } from "@/shared/ui/PageHeader";
import { PublicPageFrame } from "@/shared/ui/PublicPageFrame";
import { QueryState } from "@/shared/ui/QueryState";
import { SectionPaper } from "@/shared/ui/SectionPaper";
import { useToast } from "@/shared/ui/toast";

const schema = z.object({
  amount: z.coerce.number().positive(),
  donorName: z.string().optional(),
  donorEmail: z.string().email().optional().or(z.literal("")),
  donorPhone: z.string().optional(),
  message: z.string().optional(),
});

type DonateInput = z.input<typeof schema>;
type DonateForm = z.output<typeof schema>;

export function DonatePage() {
  const { campaignId = "" } = useParams();
  const showToast = useToast((state) => state.showToast);
  const user = useAuthStore((state) => state.user);
  const detail = useQuery({ queryKey: ["public-campaign", campaignId], queryFn: () => donationApi.publicCampaign(campaignId), enabled: Boolean(campaignId) });
  const form = useForm<DonateInput, unknown, DonateForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      amount: 100000,
      donorName: user?.fullName ?? "",
      donorEmail: user?.email ?? "",
      donorPhone: user?.phone ?? "",
      message: "",
    },
  });
  const mutation = useMutation({
    mutationFn: (values: DonateForm) =>
      donationApi.createDonation({
        campaignId,
        amount: values.amount,
        paymentMethod: "BANK_TRANSFER",
        donorName: values.donorName,
        donorEmail: values.donorEmail,
        donorPhone: values.donorPhone,
        message: values.message,
        isAnonymous: !values.donorName,
      }),
    onSuccess: (donation) => {
      showToast("Yêu cầu ủng hộ đã được khởi tạo.", "success");
      if (donation.paymentUrl) window.location.href = donation.paymentUrl;
    },
  });

  return (
    <PublicPageFrame>
      <PageHeader title="Ủng hộ chiến dịch" description="Khoản đóng góp của bạn sẽ được ghi nhận vào sổ công khai của Tâm Lũ sau khi thanh toán thành công." />
      <QueryState isLoading={detail.isLoading} error={detail.error} refetch={detail.refetch}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 5 }}>
            <Stack spacing={2}>
              <Paper variant="outlined" sx={{ overflow: "visible", borderRadius: 0 }}>
                <Box
                  component="img"
                  src={getCampaignImageUrl(detail.data?.campaign.coverImageUrl)}
                  alt={detail.data?.campaign.name ?? "Chiến dịch cứu trợ lũ lụt"}
                  loading="lazy"
                  onError={setCampaignImageFallback}
                  sx={{ width: "100%", height: 220, objectFit: "cover", objectPosition: "center", display: "block", filter: "saturate(.86) contrast(1.02)" }}
                />
                <Stack spacing={1} sx={{ p: 2.5 }}>
                  <Typography variant="h6" fontWeight={900}>{detail.data?.campaign.name ?? "Chiến dịch"}</Typography>
                  <Typography color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    Thanh toán được khởi tạo qua luồng chuyển khoản hiện có và ghi nhận vào sổ công khai của chiến dịch sau khi thành công.
                  </Typography>
                </Stack>
              </Paper>
              <MetricCard label="Chiến dịch" value={detail.data?.campaign.name ?? "-"} />
              <MetricCard label="Đã quyên góp" value={formatMoney(detail.data?.campaign.currentAmount)} tone="green" />
              <MetricCard label="Mục tiêu" value={formatMoney(detail.data?.campaign.targetAmount)} tone="orange" />
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, md: 7 }}>
            <SectionPaper>
              {mutation.error ? <Alert severity="error">{getErrorMessage(mutation.error)}</Alert> : null}
              <Stack component="form" spacing={2} sx={{ mt: mutation.error ? 2 : 0 }} onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
                <Typography variant="h6" fontWeight={900}>
                  Thông tin ủng hộ
                </Typography>
                <Alert severity="info">Bạn có thể ủng hộ với tên của mình hoặc để trống tên để được ghi nhận ẩn danh.</Alert>
                <TextField label="Số tiền (VND)" type="number" {...form.register("amount")} error={Boolean(form.formState.errors.amount)} helperText={form.formState.errors.amount?.message} />
                <TextField label="Họ và tên" {...form.register("donorName")} />
                <TextField label="Email" type="email" {...form.register("donorEmail")} error={Boolean(form.formState.errors.donorEmail)} helperText={form.formState.errors.donorEmail?.message} />
                <TextField label="Số điện thoại" {...form.register("donorPhone")} />
                <TextField label="Lời nhắn" multiline minRows={3} {...form.register("message")} />
                <Button type="submit" variant="contained" color="secondary" size="large" startIcon={<PaidIcon />} disabled={mutation.isPending}>
                  Tiếp tục thanh toán
                </Button>
              </Stack>
            </SectionPaper>
          </Grid>
        </Grid>
      </QueryState>
    </PublicPageFrame>
  );
}
