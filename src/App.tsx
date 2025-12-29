import { ThemeProvider } from "@emotion/react";
import {
  createTheme,
  CssBaseline,
  GlobalStyles,
  Snackbar,
  Stack,
} from "@mui/material";
import React, { useState } from "react";

import Header from "./Header";
import Main from "./Main";
import ProgressDialog from "./ProgressDialog";
import { TransferQueueProvider } from "./app/transferQueue";

// NEW: login gate
import Login from "./Login"; // pastikan file Login ada di src/Login.jsx atau src/Login.tsx
import { isLoggedIn, logout } from "./auth"; // pastikan file auth ada di src/auth.js

const globalStyles = (
  <GlobalStyles styles={{ "html, body, #root": { height: "100%" } }} />
);

const theme = createTheme({
  palette: { primary: { main: "#f38020" } },
});

function App() {
  const [search, setSearch] = useState("");
  const [showProgressDialog, setShowProgressDialog] = React.useState(false);
  const [error, setError] = useState<Error | null>(null);

  // NEW: state login
  const [loggedIn, setLoggedIn] = useState(isLoggedIn());

  // NEW: kalau belum login, tampilkan halaman login saja
  if (!loggedIn) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {globalStyles}
        <Login
          onSuccess={() => {
            setLoggedIn(true);
          }}
        />
      </ThemeProvider>
    );
  }

  // Kalau sudah login, render app normal (kode Anda yang lama)
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {globalStyles}
      <TransferQueueProvider>
        <Stack sx={{ height: "100%" }}>
          <Header
            search={search}
            onSearchChange={(newSearch: string) => setSearch(newSearch)}
            setShowProgressDialog={setShowProgressDialog}
            // OPTIONAL: kalau Anda mau tombol logout di Header
            // onLogout={() => {
            //   logout();
            //   setLoggedIn(false);
            // }}
          />
          <Main
            search={search}
            onError={(e) => {
              setError(e);
              // OPTIONAL: auto balik ke login kalau 401.
              // Ini baru bekerja kalau Step 4 sudah ubah fetch jadi authFetch,
              // dan authFetch melempar error saat 401.
              if (e?.name === "AuthError") {
                logout();
                setLoggedIn(false);
              }
            }}
          />
        </Stack>
        <Snackbar
          autoHideDuration={5000}
          open={Boolean(error)}
          message={error?.message}
          onClose={() => setError(null)}
        />
        <ProgressDialog
          open={showProgressDialog}
          onClose={() => setShowProgressDialog(false)}
        />
      </TransferQueueProvider>
    </ThemeProvider>
  );
}

export default App;
