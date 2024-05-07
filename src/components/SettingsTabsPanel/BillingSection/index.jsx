import { Box, Button, Typography, styled, Divider } from "@mui/material";
import React, { memo, useCallback, useEffect } from "react";

import {
  Loyalty as LoyaltyIcon,
  Redeem as RedeemIcon,
  Stars as StarsIcon,
  FlightTakeoff as FlightTakeoffIcon,
  FlightLand as FlightLandIcon,
  LockClock as LockClockIcon,
} from "@mui/icons-material";

import { grey } from "@mui/material/colors";

import styles from "./styles.module.scss";
import clsx from "clsx";
import { socket } from "../../../socket";
import { useThemeDetector } from "../../../hooks/useThemeDetector";

const WhiteMUIButton = styled(Button)(({ theme }) => ({
  color: theme.palette.getContrastText(grey[500]),
  backgroundColor: "white",
  "&:hover": {
    backgroundColor: "white",
  },
}));

const paymentPerMonthPerUser = 199;

const BillingSection = memo(
  ({ widget, accountData, Modal, setRequestTrigger }) => {
    const theme = useThemeDetector();

    useEffect(() => {
      const handleOpen = () => {
        socket.send(
          JSON.stringify({
            event: "createRoom",
            data: { accountId: APP.constant("account").id },
          })
        );
      };

      const handleMessage = ({ data }) => {
        const parsedData = JSON.parse(data);

        if (parsedData.event === "successPaymentEvent") {
          setRequestTrigger((prev) => !prev);
        }
      };

      const handleClose = () => {};

      const handleError = (error) => {};

      socket.addEventListener("open", handleOpen);
      socket.addEventListener("message", handleMessage);
      socket.addEventListener("close", handleClose);
      socket.addEventListener("error", handleError);

      return () => {
        socket.removeEventListener("open", handleOpen);
        socket.removeEventListener("message", handleMessage);
        socket.removeEventListener("close", handleClose);
        socket.removeEventListener("error", handleError);

        socket.close();
      };
    }, []);

    useEffect(() => {
      const script = document.createElement("script");
      script.src =
        "https://auth.robokassa.ru/Merchant/bundle/robokassa_iframe.js";
      script.async = true;

      document.body.appendChild(script);

      return () => {
        document.body.removeChild(script);
      };
    }, []);

    const onPaymentRequest = useCallback(({ tariff }) => {
      (async () => {
        await widget
          .$authorizedAjax({
            url: `${process.env.REACT_APP_API_URL}/payment/data?tariff=${tariff}`,
            method: "GET",
          })
          .then((res) => {
            const status = res.status;
            const message = res.message;

            switch (status) {
              case "success":
                const { iframeBody } = res.apiData;

                if (window.Robokassa) {
                  window.Robokassa.StartPayment(iframeBody);

                  const robokassaIframe =
                    document.querySelector("#robokassa_iframe");

                  robokassaIframe.style.left = "0px";
                }
                break;
              case "warning":
                new Modal()._showError(message);

                break;
            }
          })
          .fail((err) => {
            const errMessage = err?.response?.data?.message
              ? err.response.data.message
              : err?.message
              ? err.message
              : "Проблемы на стороне сервера. Попробуйте через пару минут.";

            new Modal()._showError(errMessage);
          });
      })();
    }, []);

    const onFormatDate = (date) => {
      let day = date.getDate();
      let month = date.getMonth() + 1;
      const year = date.getFullYear();

      day = day < 10 ? "0" + day : day;
      month = month < 10 ? "0" + month : month;

      return `${day}.${month}.${year}`;
    };

    const onCalcTariffPrice = useCallback(
      (numberMonths) => {
        const accManagers = APP.constant("managers");

        const accManagersCount = Object.keys(accManagers).length;

        const quantityManagersForCount =
          accManagersCount <= 5 ? 5 : accManagersCount;

        return quantityManagersForCount * paymentPerMonthPerUser * numberMonths;
      },
      [paymentPerMonthPerUser]
    );

    const onCalcManagersCount = useCallback(() => {
      return Object.keys(APP.constant("managers")).length;
    }, []);

    const onRenderSubsInfo = useCallback(() => {
      const accountHasProSubs =
        accountData.widgetInfo?.subscriptionInfo?.pro?.endDate;

      const trialEndDate = new Date(
        accountData.widgetInfo.subscriptionInfo.trial.endDate
      );

      const currentDate = new Date();

      const trialSubsIsValid = currentDate < trialEndDate;

      if (!accountHasProSubs && trialSubsIsValid) {
        return (
          <Box className={styles.activeSubsInfoBlock}>
            <FlightTakeoffIcon
              className={clsx([styles.subsInfoIcon, styles.valid])}
            />
            <p className={styles.descText}>
              Тестовый период до {onFormatDate(trialEndDate)}
            </p>
          </Box>
        );
      }
      if (!accountHasProSubs && !trialSubsIsValid) {
        return (
          <Box className={styles.activeSubsInfoBlock}>
            <FlightLandIcon
              className={clsx([styles.subsInfoIcon, styles.expire])}
            />
            <p className={styles.descText}>
              Тестовый период закончился. Выберите подходящий тариф ниже.
            </p>
          </Box>
        );
      }
      if (accountHasProSubs) {
        const proEndDate = new Date(
          accountData.widgetInfo.subscriptionInfo.pro.endDate
        );

        const proSubsIsValid = currentDate < proEndDate;

        if (proSubsIsValid) {
          return (
            <Box className={styles.activeSubsInfoBlock}>
              <LoyaltyIcon
                className={clsx([styles.subsInfoIcon, styles.valid])}
              />
              <p className={styles.descText}>
                Подписка активирована до {onFormatDate(proEndDate)}
              </p>
            </Box>
          );
        } else {
          return (
            <Box className={styles.activeSubsInfoBlock}>
              <LockClockIcon
                className={clsx([styles.subsInfoIcon, styles.expire])}
              />
              <p className={styles.descText}>
                Подписка закончилась. Выберите подходящий тариф ниже.
              </p>
            </Box>
          );
        }
      }
    }, [accountData]);

    const onDefineEndDate = useCallback(
      (numberMonths) => {
        const currentDate = new Date();

        const accSubsInfo = accountData.widgetInfo.subscriptionInfo;

        const accountHasProSubs = accSubsInfo?.pro?.endDate;

        const trialEndDate = new Date(accSubsInfo.trial.endDate);

        let dateOfReport;

        if (!accountHasProSubs) {
          const trialSubsIsValid = currentDate < trialEndDate;

          if (trialSubsIsValid) {
            dateOfReport = trialEndDate;
          } else {
            dateOfReport = currentDate;
          }
        } else {
          const proEndDate = new Date(accSubsInfo.pro.endDate);

          const proSubsIsValid = currentDate < proEndDate;

          if (proSubsIsValid) {
            dateOfReport = proEndDate;
          } else {
            dateOfReport = currentDate;
          }
        }

        return onFormatDate(
          new Date(
            dateOfReport.setMonth(dateOfReport.getMonth() + numberMonths)
          )
        );
      },
      [accountData, onFormatDate]
    );

    const onRedirect = useCallback((url) => {
      window.open(url, "_blank");
    }, []);

    return (
      <div>
        {!Object.keys(accountData).length ? (
          <p>Ошибка на стороне сервера</p>
        ) : (
          <>
            {onRenderSubsInfo()}
            <Box
              className={clsx([
                styles.infoBlock,
                theme === "dark" ? styles.darkTheme : styles.lightTheme,
              ])}
            >
              <Typography className={styles.infoBlockText} variant="subtitle2">
                Стоимость подписки на виджет 199 рублей в месяц за каждого
                пользователя в аккаунте amoCRM, минимум 5 пользователей. При их
                удалении или добавлении произойдёт автоматический перерасчёт
                срока окончания подписки.{" "}
                <span>
                  Число пользователей Вашего аккаунта - {onCalcManagersCount()}
                </span>
                .
              </Typography>
            </Box>

            <Box
              className={clsx([
                styles.tariffBlock,
                theme === "dark" ? styles.darkTheme : styles.lightTheme,
              ])}
            >
              <Box className={clsx([styles.short, styles.tariffItem])}>
                <span className={styles.itemTitle}>
                  {onCalcTariffPrice(6)} руб.
                </span>
                <Divider />
                <span className={styles.itemTerm}>
                  6 месяцев (до {onDefineEndDate(6)})
                </span>
                <Box className={styles.redeemBlock}></Box>

                <Box className={styles.btnBlock}>
                  <Button
                    onClick={() => onPaymentRequest({ tariff: 1 })}
                    className={styles.payBtn}
                    size="medium"
                    variant="outlined"
                  >
                    Оплатить онлайн
                  </Button>
                  <Button
                    onClick={() =>
                      onRedirect("https://forms.amocrm.ru/rttxltm")
                    }
                    className={styles.btnInv}
                    size="small"
                    variant="text"
                  >
                    Запросить счёт
                  </Button>
                </Box>
              </Box>
              <Box className={clsx([styles.long, styles.tariffItem])}>
                <StarsIcon className={styles.starIcon} />

                <span className={styles.itemTitle}>
                  {onCalcTariffPrice(10)} руб.
                </span>
                <Divider />
                <span className={styles.itemTerm}>
                  10 месяцев (до {onDefineEndDate(12)})
                </span>
                <Box className={styles.redeemBlock}>
                  <span>+2 месяца в подарок</span>
                  <RedeemIcon />
                </Box>

                <Box className={styles.btnBlock}>
                  <WhiteMUIButton
                    className={styles.payBtn}
                    size="medium"
                    variant="contained"
                    onClick={() => onPaymentRequest({ tariff: 2 })}
                  >
                    Оплатить онлайн
                  </WhiteMUIButton>
                  <Button
                    onClick={() =>
                      onRedirect("https://forms.amocrm.ru/rttxltm")
                    }
                    className={styles.btnInv}
                    size="small"
                    variant="text"
                  >
                    Запросить счёт
                  </Button>
                </Box>
              </Box>
            </Box>
          </>
        )}
      </div>
    );
  }
);

export default BillingSection;
