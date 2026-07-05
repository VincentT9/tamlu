import PaidIcon from "@mui/icons-material/Paid";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Button, Grid, Stack, TextField, Typography } from "@mui/material";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import { z } from "zod";
import { donationApi } from "@/features/donations/api";
import { getErrorMessage } from "@/shared/api/client";
import { formatMoney } from "@/shared/utils/format";
import { MetricCard } from "@/shared/ui/MetricCard";
import { PageHeader } from "@/shared/ui/PageHeader";
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
  const detail = useQuery({ queryKey: ["public-campaign", campaignId], queryFn: () => donationApi.publicCampaign(campaignId), enabled: Boolean(campaignId) });
  const form = useForm<DonateInput, unknown, DonateForm>({
    resolver: zodResolver(schema),
    defaultValues: { amount: 100000, donorName: "", donorEmail: "", donorPhone: "", message: "" },
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
      showToast("Donation initialized.", "success");
      if (donation.paymentUrl) window.location.href = donation.paymentUrl;
    },
  });

  return (
    <>
      <PageHeader title="Donate" description="Your contribution is recorded into TamLu's public ledger after successful payment." />
      <QueryState isLoading={detail.isLoading} error={detail.error} refetch={detail.refetch}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 5 }}>
            <Stack spacing={2}>
              <MetricCard label="Campaign" value={detail.data?.campaign.name ?? "-"} />
              <MetricCard label="Raised" value={formatMoney(detail.data?.campaign.currentAmount)} tone="green" />
              <MetricCard label="Target" value={formatMoney(detail.data?.campaign.targetAmount)} tone="orange" />
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, md: 7 }}>
            <SectionPaper>
              {mutation.error ? <Alert severity="error">{getErrorMessage(mutation.error)}</Alert> : null}
              <Stack component="form" spacing={2} sx={{ mt: mutation.error ? 2 : 0 }} onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
                <Typography variant="h6" fontWeight={900}>
                  Donation information
                </Typography>
                <TextField label="Amount (VND)" type="number" {...form.register("amount")} error={Boolean(form.formState.errors.amount)} helperText={form.formState.errors.amount?.message} />
                <TextField label="Name" {...form.register("donorName")} />
                <TextField label="Email" type="email" {...form.register("donorEmail")} error={Boolean(form.formState.errors.donorEmail)} helperText={form.formState.errors.donorEmail?.message} />
                <TextField label="Phone" {...form.register("donorPhone")} />
                <TextField label="Message" multiline minRows={3} {...form.register("message")} />
                <Button type="submit" variant="contained" color="secondary" size="large" startIcon={<PaidIcon />} disabled={mutation.isPending}>
                  Continue to payment
                </Button>
              </Stack>
            </SectionPaper>
          </Grid>
        </Grid>
      </QueryState>
    </>
  );
}
