import MyLocationIcon from "@mui/icons-material/MyLocation";
import SosIcon from "@mui/icons-material/Sos";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Box, Button, FormControlLabel, Grid, Paper, MenuItem, Stack, Switch, TextField, Typography } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { sosApi } from "@/features/sos/api";
import { useAuthStore } from "@/features/auth/store";
import { getErrorMessage } from "@/shared/api/client";
import { TamLuMap } from "@/shared/maps/TamLuMap";
import { PageHeader } from "@/shared/ui/PageHeader";
import { PublicPageFrame } from "@/shared/ui/PublicPageFrame";
import { SectionPaper } from "@/shared/ui/SectionPaper";
import { useToast } from "@/shared/ui/toast";

const urgencyLevels = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;
const urgencyLabels: Record<(typeof urgencyLevels)[number], string> = {
  LOW: "Thấp",
  MEDIUM: "Trung bình",
  HIGH: "Cao",
  CRITICAL: "Nguy cấp",
};

const schema = z.object({
  title: z.string().min(3, "Vui lòng nhập tiêu đề tối thiểu 3 ký tự.").max(200, "Tiêu đề không được vượt quá 200 ký tự."),
  description: z.string(),
  urgencyLevel: z.enum(urgencyLevels),
  latitude: z.coerce.number().min(-90, "Vĩ độ phải từ -90 đến 90.").max(90, "Vĩ độ phải từ -90 đến 90."),
  longitude: z.coerce.number().min(-180, "Kinh độ phải từ -180 đến 180.").max(180, "Kinh độ phải từ -180 đến 180."),
  address: z.string().optional(),
  emergencyType: z.string().min(2, "Vui lòng nhập loại tình huống."),
  numPeople: z.coerce.number().int("Số người cần là số nguyên.").positive("Số người cần cứu hộ phải lớn hơn 0."),
  hasElderly: z.boolean(),
  hasChildren: z.boolean(),
  hasInjured: z.boolean(),
  hasDisabled: z.boolean(),
  contactName: z.string().optional(),
  contactPhone: z.string().optional(),
}).superRefine((values, context) => {
  if (values.numPeople === 1 && values.hasElderly && values.hasChildren) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["hasChildren"],
      message: "Khi có 1 người cần cứu hộ, chỉ chọn một trong hai mục: người cao tuổi hoặc trẻ em.",
    });
  }
});

type SosInput = z.input<typeof schema>;
type SosForm = z.output<typeof schema>;

export function CreateSosPage() {
  const navigate = useNavigate();
  const showToast = useToast((state) => state.showToast);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [files, setFiles] = useState<FileList | null>(null);
  const [fileError, setFileError] = useState("");
  const form = useForm<SosInput, unknown, SosForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      description: "",
      urgencyLevel: "HIGH",
      latitude: 16.4637,
      longitude: 107.5909,
      address: "",
      emergencyType: "FLOOD",
      numPeople: 1,
      hasElderly: false,
      hasChildren: false,
      hasInjured: false,
      hasDisabled: false,
      contactName: "",
      contactPhone: "",
    },
  });
  const mutation = useMutation({
    mutationFn: (values: SosForm) => {
      const { urgencyLevel, ...payload } = values;
      return sosApi.create({
        ...payload,
        description: `[Mức độ khẩn cấp: ${urgencyLabels[urgencyLevel]}] ${payload.description}`,
        files: files ?? undefined,
      });
    },
    onSuccess: (sos) => {
      showToast("Yêu cầu SOS đã được gửi.", "success");
      navigate(isAuthenticated ? "/citizen/sos" : "/", { state: isAuthenticated ? { createdSosId: sos.id } : undefined });
    },
    onError: (error) => showToast(getErrorMessage(error), "error"),
  });

  const useLocation = () => {
    navigator.geolocation?.getCurrentPosition(
      (position) => {
        form.setValue("latitude", Number(position.coords.latitude.toFixed(6)));
        form.setValue("longitude", Number(position.coords.longitude.toFixed(6)));
      },
      () => showToast("Không thể đọc vị trí hiện tại.", "warning"),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };
  const latitude = Number(form.watch("latitude"));
  const longitude = Number(form.watch("longitude"));
  const numPeople = Number(form.watch("numPeople"));
  const hasElderly = form.watch("hasElderly");
  const hasChildren = form.watch("hasChildren");
  const mapMarkers = Number.isFinite(latitude) && Number.isFinite(longitude)
    ? [{ id: "sos-location", title: "Vị trí SOS", subtitle: form.watch("address") || "Điểm cứu hộ đã chọn", latitude, longitude, type: "sos" as const }]
    : [];
  const submitSos = (values: SosForm) => {
    const contactName = values.contactName?.trim() ?? "";
    const contactPhone = values.contactPhone?.trim() ?? "";

    if (!isAuthenticated) {
      if (!contactName) {
        form.setError("contactName", { message: "Vui lòng nhập tên liên hệ cho yêu cầu SOS ẩn danh." });
      }
      if (!/^\d{9,11}$/.test(contactPhone)) {
        form.setError("contactPhone", { message: "Vui lòng nhập số điện thoại hợp lệ gồm 9-11 chữ số." });
      }
      if (!contactName || !/^\d{9,11}$/.test(contactPhone)) {
        return;
      }
    }

    if (!fileError) mutation.mutate({ ...values, contactName, contactPhone });
  };

  return (
    <PublicPageFrame>
      <PageHeader
        eyebrow="SOS khẩn cấp"
        title="Yêu cầu hỗ trợ cứu hộ"
        description="Người gửi ẩn danh cần cung cấp tên liên hệ và số điện thoại. Công dân đã đăng nhập có thể gửi yêu cầu cho bản thân hoặc người gặp nạn gần đó."
      />
      <SectionPaper>
        {mutation.error ? <Alert severity="error">{getErrorMessage(mutation.error)}</Alert> : null}
        <Alert severity="warning" sx={{ mb: 2 }}>
          Nếu đang có nguy hiểm tức thời, hãy gửi yêu cầu với vị trí chính xác nhất có thể. Điều phối viên có thể bổ sung chi tiết sau khi tiếp nhận.
        </Alert>
        <Stack component="form" spacing={2.5} sx={{ mt: mutation.error ? 2 : 0 }} onSubmit={form.handleSubmit(submitSos)}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth label="Tiêu đề" {...form.register("title")} error={Boolean(form.formState.errors.title)} helperText={form.formState.errors.title?.message} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth label="Loại tình huống khẩn cấp" {...form.register("emergencyType")} error={Boolean(form.formState.errors.emergencyType)} helperText={form.formState.errors.emergencyType?.message} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField fullWidth multiline minRows={4} label="Mô tả tình huống" {...form.register("description")} error={Boolean(form.formState.errors.description)} helperText={form.formState.errors.description?.message} />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Controller
                control={form.control}
                name="urgencyLevel"
                render={({ field }) => (
                  <TextField
                    fullWidth
                    select
                    label="Mức độ khẩn cấp"
                    value={field.value ?? "HIGH"}
                    onChange={field.onChange}
                    error={Boolean(form.formState.errors.urgencyLevel)}
                  >
                    {urgencyLevels.map((level) => (
                      <MenuItem key={level} value={level}>
                        {urgencyLabels[level]}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                fullWidth
                label="Vĩ độ"
                type="number"
                slotProps={{ htmlInput: { step: "any" } }}
                {...form.register("latitude")}
                error={Boolean(form.formState.errors.latitude)}
                helperText={form.formState.errors.latitude?.message}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                fullWidth
                label="Kinh độ"
                type="number"
                slotProps={{ htmlInput: { step: "any" } }}
                {...form.register("longitude")}
                error={Boolean(form.formState.errors.longitude)}
                helperText={form.formState.errors.longitude?.message}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <Button fullWidth variant="outlined" startIcon={<MyLocationIcon />} onClick={useLocation} sx={{ height: "100%" }}>
                GPS
              </Button>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField fullWidth label="Địa chỉ" {...form.register("address")} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: "var(--radius-panel)", p: { xs: 1.5, md: 2 }, bgcolor: "var(--color-green-50)" }}>
                <Stack spacing={1.5}>
                  <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1}>
                    <Box>
                      <Typography fontWeight={800}>Xem trước vị trí cứu hộ</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Sử dụng GPS hiện tại, nhập tọa độ thủ công hoặc nhấp đúp vào bản đồ để chọn điểm cứu hộ.
                      </Typography>
                    </Box>
                    <Button variant="outlined" startIcon={<MyLocationIcon />} onClick={useLocation}>
                      Dùng GPS hiện tại
                    </Button>
                  </Stack>
                  <TamLuMap
                    markers={mapMarkers}
                    center={Number.isFinite(latitude) && Number.isFinite(longitude) ? [latitude, longitude] : undefined}
                    height={360}
                    onLocationSelect={([selectedLatitude, selectedLongitude]) => {
                      form.setValue("latitude", selectedLatitude, { shouldDirty: true, shouldValidate: true });
                      form.setValue("longitude", selectedLongitude, { shouldDirty: true, shouldValidate: true });
                    }}
                  />
                </Stack>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField fullWidth label="Số người cần cứu hộ" type="number" {...form.register("numPeople")} error={Boolean(form.formState.errors.numPeople)} helperText={form.formState.errors.numPeople?.message} />
            </Grid>
            {(["hasElderly", "hasChildren", "hasInjured", "hasDisabled"] as const).map((name) => (
              <Grid size={{ xs: 12, sm: 6, md: 2 }} key={name}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    minHeight: 56,
                    height: "100%",
                    px: 1.25,
                    borderBlock: "1px solid var(--color-border)",
                  }}
                >
                  <Controller
                    control={form.control}
                    name={name}
                    render={({ field }) => (
                      <FormControlLabel
                        sx={{ m: 0, width: "100%", justifyContent: "space-between", gap: 1, ".MuiFormControlLabel-label": { lineHeight: 1.35 } }}
                        labelPlacement="start"
                        control={(
                          <Switch
                            checked={field.value}
                            disabled={
                              numPeople === 1
                              && ((name === "hasElderly" && hasChildren) || (name === "hasChildren" && hasElderly))
                            }
                            onChange={(_, checked) => field.onChange(checked)}
                          />
                        )}
                        label={getConditionLabel(name)}
                      />
                    )}
                  />
                </Box>
              </Grid>
            ))}
            <Grid size={{ xs: 12 }}>
              <Typography variant="body2" color="text.secondary">
                Với 1 người cần cứu hộ, chỉ chọn một trong hai trường hợp: người cao tuổi hoặc trẻ em. Thông tin người bị thương và người khuyết tật có thể ghi nhận đồng thời khi cần.
              </Typography>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" fontWeight={800}>Thông tin người cần cứu hoặc người liên hệ tại hiện trường</Typography>
              <Typography variant="body2" color="text.secondary">
                {isAuthenticated ? "Có thể để trống để dùng thông tin tài khoản, hoặc nhập người khác khi gửi yêu cầu hộ." : "Bắt buộc với yêu cầu SOS ẩn danh."}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth label="Tên liên hệ" {...form.register("contactName")} error={Boolean(form.formState.errors.contactName)} helperText={form.formState.errors.contactName?.message} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Số điện thoại liên hệ"
                {...form.register("contactPhone")}
                error={Boolean(form.formState.errors.contactPhone)}
                helperText={form.formState.errors.contactPhone?.message ?? (isAuthenticated ? "Để trống để dùng số điện thoại tài khoản." : "Số điện thoại 9-11 chữ số.")}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: "var(--radius-panel)", boxShadow: "none", bgcolor: "var(--color-surface-subtle)" }}>
              <Stack spacing={1}>
                <Typography fontWeight={800}>Hình ảnh hoặc video minh chứng</Typography>
                <Button
                  component="label"
                  variant="outlined"
                  sx={{
                    alignSelf: "flex-start",
                    minHeight: 42,
                    minWidth: 132,
                    px: 2.5,
                    bgcolor: "#ffffff",
                  }}
                >
                  Chọn tệp
                  <input
                    hidden
                    multiple
                    type="file"
                    accept="image/*,video/*"
                    onChange={(event) => {
                      const nextFiles = event.target.files;
                      const oversized = Array.from(nextFiles ?? []).find((file) => file.size > 50 * 1024 * 1024);
                      const nextError = (nextFiles?.length ?? 0) > 5
                        ? "Chỉ được tải tối đa 5 tệp trong một yêu cầu."
                        : oversized
                          ? `Tệp ${oversized.name} vượt quá giới hạn 50MB.`
                          : "";
                      setFileError(nextError);
                      setFiles(nextError ? null : nextFiles);
                      if (nextError) event.currentTarget.value = "";
                    }}
                  />
                </Button>
                {fileError ? <Alert severity="error">{fileError}</Alert> : null}
                <Typography variant="body2" color="text.secondary">
                  {files?.length ? `Đã chọn ${files.length} tệp. Giới hạn hệ thống là 5 tệp, mỗi tệp tối đa 50MB.` : "Hình ảnh hoặc video giúp điều phối viên xác minh tình huống nhanh hơn."}
                </Typography>
              </Stack>
              </Paper>
            </Grid>
          </Grid>
          <Box sx={{ display: "flex", justifyContent: { xs: "stretch", sm: "flex-start" } }}>
            <Button type="submit" variant="contained" color="error" size="large" startIcon={<SosIcon />} disabled={mutation.isPending} sx={{ width: { xs: "100%", sm: "auto" } }}>
              Gửi yêu cầu SOS
            </Button>
          </Box>
        </Stack>
      </SectionPaper>
    </PublicPageFrame>
  );
}

function getConditionLabel(name: "hasElderly" | "hasChildren" | "hasInjured" | "hasDisabled") {
  const labels = {
    hasElderly: "Có người cao tuổi",
    hasChildren: "Có trẻ em",
    hasInjured: "Có người bị thương",
    hasDisabled: "Có người khuyết tật",
  };
  return labels[name];
}
