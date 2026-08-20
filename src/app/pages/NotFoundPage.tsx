import { Box, Button, Paper, Stack, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { PublicPageFrame } from "@/shared/ui/PublicPageFrame";

export function NotFoundPage() {
  return (
    <PublicPageFrame maxWidth={720}>
      <Stack spacing={2} alignItems="center" justifyContent="center" sx={{ minHeight: 520 }}>
        <Paper variant="outlined" sx={{ width: "100%", maxWidth: 560, p: { xs: 3, md: 4 }, borderRadius: 2, borderColor: "var(--color-border)", bgcolor: "var(--color-surface)", boxShadow: "var(--shadow-surface)", textAlign: "center" }}>
          <Stack spacing={2} alignItems="center">
            <Box sx={{ display: "grid", placeItems: "center", width: 64, height: 64, borderRadius: 2, bgcolor: "primary.light", color: "primary.main", fontWeight: 800 }}>
              404
            </Box>
            <Typography variant="h4" fontWeight={800}>Không tìm thấy trang</Typography>
            <Typography color="text.secondary" sx={{ maxWidth: 420 }}>
              Đường dẫn này không tồn tại. Vui lòng quay lại nền tảng cứu trợ công khai hoặc sử dụng bảng điều hướng.
            </Typography>
            <Button component={Link} to="/" variant="contained">Về trang chủ</Button>
          </Stack>
        </Paper>
      </Stack>
    </PublicPageFrame>
  );
}
