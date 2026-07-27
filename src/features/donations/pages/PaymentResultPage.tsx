import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import { Alert, Button, Stack, Typography } from "@mui/material";
import { Link, useSearchParams } from "react-router-dom";
import { PageHeader } from "@/shared/ui/PageHeader";
import { PublicPageFrame } from "@/shared/ui/PublicPageFrame";
import { SectionPaper } from "@/shared/ui/SectionPaper";

function isCancelledPayment(value?: string | null) {
  const normalized = value?.toLowerCase() ?? "";
  return normalized.includes("cancel") || normalized.includes("huy") || normalized.includes("hủy");
}

export function PaymentResultPage() {
  const [searchParams] = useSearchParams();
  const status = searchParams.get("status") ?? searchParams.get("code") ?? searchParams.get("cancel") ?? "";
  const cancelled = isCancelledPayment(status);

  return (
    <PublicPageFrame maxWidth={980}>
      <PageHeader
        title={cancelled ? "Thanh toán đã được hủy" : "Đã quay lại từ cổng thanh toán"}
        description="Tâm Lũ sẽ ghi nhận khoản ủng hộ sau khi cổng thanh toán xác nhận giao dịch thành công."
      />
      <SectionPaper>
        <Stack spacing={2.5}>
          <Alert severity={cancelled ? "warning" : "info"}>
            {cancelled
              ? "Giao dịch đã được hủy. Quý vị có thể quay lại trang chủ hoặc chọn một chiến dịch khác để tiếp tục ủng hộ."
              : "Nếu quý vị đã hoàn tất chuyển khoản, vui lòng kiểm tra lịch sử quyên góp để theo dõi trạng thái ghi nhận."}
          </Alert>
          <Typography color="text.secondary" sx={{ lineHeight: 1.7 }}>
            Trường hợp trạng thái chưa cập nhật ngay, hệ thống có thể cần thêm thời gian để nhận xác nhận từ PayOS.
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <Button component={Link} to="/" variant="contained" startIcon={<HomeOutlinedIcon />}>
              Về trang chủ
            </Button>
            <Button component={Link} to="/campaigns" variant="outlined" startIcon={<CampaignOutlinedIcon />}>
              Xem chiến dịch
            </Button>
            <Button component={Link} to="/donor/donations" variant="outlined" startIcon={<AccountBalanceWalletOutlinedIcon />}>
              Lịch sử quyên góp
            </Button>
          </Stack>
        </Stack>
      </SectionPaper>
    </PublicPageFrame>
  );
}
