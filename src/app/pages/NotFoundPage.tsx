import { Button, Stack, Typography } from "@mui/material";
import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <Stack spacing={2} alignItems="center" justifyContent="center" sx={{ minHeight: 420 }}>
      <Typography variant="h3" fontWeight={900}>404</Typography>
      <Typography color="text.secondary">This TamLu route does not exist.</Typography>
      <Button component={Link} to="/" variant="contained">Return home</Button>
    </Stack>
  );
}
