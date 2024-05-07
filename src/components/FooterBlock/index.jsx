import { Box, IconButton, ThemeProvider, Typography } from "@mui/material";
import React, { memo, useCallback } from "react";

import {
  Telegram as TelegramIcon,
  WhatsApp as WhatsAppIcon,
  MailOutline as MailOutlineIcon,
} from "@mui/icons-material";

import styles from "./styles.module.scss";
import { useThemeDetector } from "../../hooks/useThemeDetector";
import { darkTheme, lightTheme } from "../../theme/MUIThemes";

import Logo from "../../assets/svg/logo.svg";

import clsx from "clsx";

const FooterBlock = memo(() => {
  const theme = useThemeDetector();

  const onRedirect = useCallback((url) => {
    window.open(url, "_blank");
  }, []);

  return (
    <ThemeProvider theme={theme === "dark" ? darkTheme : lightTheme}>
      <Box
        className={clsx([
          styles.modalFooter,
          theme === "dark" ? styles.darkMode : styles.lightMode,
        ])}
      >
        <Box className={styles.leftBlock}>
          <Typography variant="subtitle2" fontWeight="400">
            Напишите нам для решения вашего вопроса
          </Typography>
          <Box className={styles.iconsBlock}>
            <IconButton
              onClick={() => onRedirect("https://t.me/integrator2_support_bot")}
            >
              <TelegramIcon fontSize="11px" />
            </IconButton>
            <IconButton
              onClick={() =>
                onRedirect(
                  "https://wa.me/7969774995?text=%D0%97%D0%B4%D1%80%D0%B0%D0%B2%D1%81%D1%82%D0%B2%D1%83%D0%B9%D1%82%D0%B5!%20%D0%9F%D0%B8%D1%88%D1%83%20%D0%BF%D0%BE%20%D0%BF%D0%BE%D0%B2%D0%BE%D0%B4%D1%83%20%D0%B2%D0%B8%D0%B4%D0%B6%D0%B5%D1%82%D0%B0%20%D0%A2%D0%B5%D0%BB%D0%B5%D0%B3%D1%80%D0%B0%D0%BC%20%D0%B3%D1%80%D1%83%D0%BF%D0%BF%D1%8B%20%D0%B2%20amoCRM%20"
                )
              }
            >
              <WhatsAppIcon color="#25D366" fontSize="11px" />
            </IconButton>
            <IconButton
              onClick={() => onRedirect(`mailto:suppoort@integrator2.ru`)}
            >
              <MailOutlineIcon color="black" fontSize="11px" />
            </IconButton>
          </Box>
        </Box>
        <Box className={styles.rightBlock}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1712.06 252.19">
            <g>
              <path d="M0,112.48V248.74H30.06l80.82-94.12v94.12h30.56V112.48H111.62L30.55,207.1V112.48Zm154.71,0V248.74h30.81V192.07H262.4v56.67h30.8V112.48H262.4v52H185.52v-52Zm156.69,0v27.6h55.44V248.74h30.8V140.08h55.45v-27.6Zm159.89,0V248.74H598.44V220.41H502.09V193.3h83.53V165.46H502.09V140.32H595V112.48Zm146.09,0V248.74h30.8V140.32h94.87V112.48Zm143.63,0V248.74h30.8V218.43h49.53c32,0,56.18-20.45,56.18-52.48s-24.15-53.47-56.18-53.47Zm30.8,28.09h48.3c15.77,0,26.61,9.61,26.61,25.38s-10.84,24.39-26.61,24.39h-48.3Zm188-.74h10.59L1015,201.19H954.41l25.38-61.36Zm-19.22-27.35L901.18,248.74h33l8.87-20.7h84l8.87,20.7h32.53l-57.91-136.26Zm99,0v27.6H1115V248.74h30.8V140.08h55.44v-27.6Zm191.18,68.25c0-13.33,4.5-24.16,12-31.86l-14.54-24.44C1231.09,137,1220,156.57,1220,180.73c0,42.88,35,71.46,76.38,71.46s76.39-28.58,76.39-71.46c0-23.94-10.92-43.43-27.77-56l-14.59,24.52c7.22,7.68,11.56,18.36,11.56,31.45,0,28.09-20,45.1-45.59,45.1S1250.78,208.82,1250.78,180.73Zm148.06-68.25V248.74h30.8V218.43h49.53c32,0,56.18-20.45,56.18-52.48s-24.15-53.47-56.18-53.47Zm30.8,28.09h48.3c15.77,0,26.61,9.61,26.61,25.38s-10.84,24.39-26.61,24.39h-48.3Z" />
              <path d="M1606.79,109.73h-34.52l24-13.1c7.48-4.1,12.16-9.83,12.16-17.55,0-15.44-12.4-22.58-29.6-22.58-11.46,0-21.52,3.39-30.3,12.63l8.89,9.25c6.44-5.85,12-8.66,20.71-8.66,10.41,0,15.8,3.16,15.8,9,0,3.39-1.76,5.85-5.27,7.84l-38.49,21.88v14.27h56.63v-13Zm20.93-6.08a10.23,10.23,0,0,0-10.3,10.3c0,5.73,4.56,9.94,10.3,9.94s10.41-4.21,10.41-9.94A10.33,10.33,0,0,0,1627.72,103.65Zm28.18-13.22c0-13.34,7.14-21.41,20.82-21.41s20.83,8.07,20.83,21.41-7.14,21.41-20.83,21.41S1655.9,103.77,1655.9,90.43Zm56.16,0c0-21.65-15.8-33.93-35.34-33.93s-35.33,12.28-35.33,33.93,15.8,33.93,35.33,33.93S1712.06,112.07,1712.06,90.43Z" />
              <path d="M1253.78,82.83l42.91,74.92,42.73-74.06c-10-5.81-17.24-7.47-25.07-8.83V0h-35.6V74.9a77.23,77.23,0,0,0-25,7.93Z" />
            </g>
          </svg>
        </Box>
      </Box>
    </ThemeProvider>
  );
});

export default FooterBlock;
