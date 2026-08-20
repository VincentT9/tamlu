import ImageNotSupportedOutlinedIcon from "@mui/icons-material/ImageNotSupportedOutlined";
import { Box, Stack, Typography } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import { useEffect, useState } from "react";

type CampaignMediaProps = {
  src?: string | null;
  alt: string;
  height?: number | { xs: number; md: number };
  aspectRatio?: string;
  overlay?: boolean;
  sx?: SxProps<Theme>;
};

export function CampaignMedia({ src, alt, height, aspectRatio, overlay = false, sx }: CampaignMediaProps) {
  const normalizedSrc = src?.trim() ?? "";
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [normalizedSrc]);

  const frameSx: SxProps<Theme> = {
    position: "relative",
    width: "100%",
    height,
    aspectRatio,
    overflow: "hidden",
    bgcolor: "var(--color-green-50)",
    ...sx,
  };

  if (!normalizedSrc || failed) {
    return (
      <Box role="img" aria-label={`${alt}. Chưa có ảnh chiến dịch.`} sx={frameSx}>
        <Stack
          justifyContent="flex-end"
          spacing={1}
          sx={{
            position: "absolute",
            inset: 0,
            p: { xs: 2.5, md: 3 },
            color: "var(--color-green-800)",
            background:
              "linear-gradient(145deg, rgba(239,244,224,.92), rgba(247,249,240,.78)), repeating-linear-gradient(135deg, rgba(83,159,5,.06) 0 1px, transparent 1px 18px)",
          }}
        >
          <ImageNotSupportedOutlinedIcon sx={{ color: "var(--color-green-600)", fontSize: 30 }} />
          <Box>
            <Typography sx={{ fontWeight: 800 }}>Chưa có ảnh chiến dịch</Typography>
            <Typography variant="body2" sx={{ mt: 0.25, color: "var(--color-text-muted)" }}>
              Thông tin chiến dịch vẫn được hiển thị đầy đủ bên dưới.
            </Typography>
          </Box>
        </Stack>
      </Box>
    );
  }

  return (
    <Box sx={frameSx}>
      <Box
        component="img"
        src={normalizedSrc}
        alt={alt}
        loading="lazy"
        onError={() => setFailed(true)}
        sx={{
          display: "block",
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center",
          filter: "saturate(.86) contrast(1.02)",
          transition: "transform 700ms cubic-bezier(.2,.8,.2,1)",
          ".tamlu-motion-surface:hover &": { transform: "scale(1.035)" },
        }}
      />
      {overlay ? (
        <Box
          aria-hidden="true"
          sx={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(180deg, rgba(247,249,240,.04), rgba(247,249,240,.42))",
          }}
        />
      ) : null}
    </Box>
  );
}
