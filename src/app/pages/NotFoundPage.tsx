import { Box, Button, Paper, Stack, Typography } from "@mui/material";
import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <Stack spacing={2} alignItems="center" justifyContent="center" sx={{ minHeight: 520, px: 2 }}>
      <Paper variant="outlined" sx={{ width: "100%", maxWidth: 560, p: { xs: 3, md: 4 }, borderRadius: 0, textAlign: "center" }}>
        <Stack spacing={2} alignItems="center">
          <Box sx={{ display: "grid", placeItems: "center", width: 64, height: 64, borderRadius: 0, bgcolor: "primary.light", color: "primary.main", fontWeight: 900 }}>
            404
          </Box>
          <Typography variant="h4" fontWeight={900}>Route not found</Typography>
          <Typography color="text.secondary" sx={{ maxWidth: 420 }}>
            This TamLu route does not exist. Return to the public relief platform or use the dashboard navigation.
          </Typography>
          <Button component={Link} to="/" variant="contained">Return home</Button>
        </Stack>
      </Paper>
    </Stack>
  );
}
