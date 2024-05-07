import { Box, Button, ThemeProvider } from "@mui/material";
import React, { memo, useCallback } from "react";

import styles from "./styles.module.scss";

import {
  Telegram as TelegramIcon,
  AutoStories as AutoStoriesIcon,
} from "@mui/icons-material";
import { useThemeDetector } from "../../hooks/useThemeDetector";
import { darkTheme, lightTheme } from "../../theme/MUIThemes";

const SettingsBtnsBlock = memo(() => {
  const theme = useThemeDetector();

  const onRedirectToManual = useCallback(() => {
    window.open(
      "https://integrator2.ru/widjety-amocrm-telegram-groups",
      "_blank"
    );
  }, []);
  const onRedirectToConnect = useCallback(() => {
    window.open("https://t.me/integrator2_support_bot", "_blank");
  }, []);

  return (
    <ThemeProvider theme={theme === "dark" ? darkTheme : lightTheme}>
      <Box className={styles.main}>
        <Button
          className={styles.manualBtn}
          size="small"
          variant="contained"
          startIcon={<AutoStoriesIcon />}
          onClick={onRedirectToManual}
        >
          Инструкция
        </Button>
        <Button
          onClick={onRedirectToConnect}
          size="small"
          variant="outlined"
          startIcon={<TelegramIcon />}
        >
          Связь с нами
        </Button>
      </Box>
    </ThemeProvider>
  );
});

export default SettingsBtnsBlock;
