import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined";
import { Box, Button, CircularProgress, Stack, Typography } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import type { ChangeEvent } from "react";
import { uploadApi } from "@/shared/api/upload";
import { getErrorMessage } from "@/shared/api/client";
import { useToast } from "@/shared/ui/toast";

interface FileUploadFieldProps {
  label: string;
  value?: string;
  onChange: (url: string) => void;
  accept?: string;
  helperText?: string;
  preview?: "image" | "file";
  disabled?: boolean;
  required?: boolean;
  onUploadingChange?: (uploading: boolean) => void;
}

export function FileUploadField({
  label,
  value = "",
  onChange,
  accept,
  helperText,
  preview = "file",
  disabled = false,
  required = false,
  onUploadingChange,
}: FileUploadFieldProps) {
  const showToast = useToast((state) => state.showToast);
  const upload = useMutation({
    mutationFn: uploadApi.upload,
    onMutate: () => onUploadingChange?.(true),
    onSuccess: (uploaded) => {
      onChange(uploaded.url);
      showToast("Tệp đã được tải lên thành công.", "success");
    },
    onError: (error) => showToast(getErrorMessage(error), "error"),
    onSettled: () => onUploadingChange?.(false),
  });

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.currentTarget.value = "";
    if (file) upload.mutate(file);
  };

  const hasValue = Boolean(value.trim());

  return (
    <Stack spacing={1.25}>
      <Typography component="span" variant="body2" fontWeight={700}>
        {label}{required ? " *" : ""}
      </Typography>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ xs: "stretch", sm: "center" }}>
        <Button
          component="label"
          variant="outlined"
          disabled={disabled || upload.isPending}
          startIcon={upload.isPending ? <CircularProgress size={18} color="inherit" /> : <CloudUploadOutlinedIcon />}
          sx={{ minHeight: 44 }}
        >
          {upload.isPending ? "Đang tải tệp..." : hasValue ? "Thay tệp" : "Chọn tệp"}
          <input hidden type="file" accept={accept} onChange={handleFileChange} />
        </Button>
        {hasValue ? (
          <Button
            component="a"
            href={value}
            target="_blank"
            rel="noreferrer"
            variant="text"
            startIcon={<OpenInNewOutlinedIcon />}
          >
            Xem tệp đã tải
          </Button>
        ) : null}
        {hasValue ? (
          <Button
            type="button"
            color="error"
            variant="text"
            startIcon={<DeleteOutlineIcon />}
            disabled={disabled || upload.isPending}
            onClick={() => onChange("")}
          >
            Xóa tệp
          </Button>
        ) : null}
      </Stack>
      {preview === "image" && hasValue ? (
        <Box
          component="img"
          src={value}
          alt={`Xem trước ${label.toLocaleLowerCase("vi")}`}
          sx={{
            width: "100%",
            maxWidth: 320,
            aspectRatio: "16 / 9",
            objectFit: "cover",
            border: "1px solid var(--color-border)",
            borderRadius: 2,
            bgcolor: "var(--color-surface-muted)",
          }}
        />
      ) : null}
      <Typography variant="caption" color="text.secondary">
        {hasValue ? "Tệp đã tải lên và sẵn sàng được lưu cùng biểu mẫu." : helperText}
      </Typography>
    </Stack>
  );
}
