import React, { memo, useCallback, useState, useEffect, useRef } from "react";

import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  TextField,
} from "@mui/material";

import styles from "./styles.module.scss";

import {
  Clear as ClearIcon,
  Check as CheckIcon,
  Telegram as TelegramIcon,
  ArrowBackIos as ArrowBackIosIcon,
  ErrorOutline,
} from "@mui/icons-material";

import clsx from "clsx";
import { MuiTelInput, matchIsValidTel } from "mui-tel-input";

const BindTgStepsEnum = {
  STARTED: "started",
  ENTERING: "entering",
  CONFIRMATION: "confirmation",
  BINDING: "binding",
};

const LinkTelegramStepper = memo(
  ({ widget, Modal, accountData, setRequestTrigger }) => {
    const blockRef = useRef(null);

    const tgPhoneNumber = useCallback(
      accountData?.personalInfo?.telegram?.phoneNumber,
      [accountData?.personalInfo?.telegram?.phoneNumber]
    );

    const [bindingTgData, setBindingTgData] = useState({
      phoneNumber: {
        prev: tgPhoneNumber ?? "",
        current: tgPhoneNumber ?? "",
      },
      authCode: "",
    });

    const [currentStep, setCurrentStep] = useState(
      tgPhoneNumber ? BindTgStepsEnum.BINDING : BindTgStepsEnum.STARTED
    );
    const [isRequested, setIsrequested] = useState(false);

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (
          blockRef.current &&
          !blockRef.current.contains(event.target) &&
          (currentStep === BindTgStepsEnum.ENTERING ||
            currentStep === BindTgStepsEnum.CONFIRMATION)
        ) {
          setCurrentStep(
            tgPhoneNumber ? BindTgStepsEnum.BINDING : BindTgStepsEnum.STARTED
          );
        }
      };

      document.addEventListener("mousedown", handleClickOutside);

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [tgPhoneNumber, currentStep]);

    useEffect(() => {
      setCurrentStep(
        tgPhoneNumber ? BindTgStepsEnum.BINDING : BindTgStepsEnum.STARTED
      );
    }, [accountData]);

    useEffect(() => {
      setBindingTgData((prev) => ({
        ...prev,
        phoneNumber: {
          prev: tgPhoneNumber ?? "",
          current: tgPhoneNumber ?? "",
        },
      }));
    }, [tgPhoneNumber]);

    const onChangeAuthCode = useCallback(
      (value) => {
        setBindingTgData((prev) => ({ ...prev, authCode: value }));
      },
      [setBindingTgData]
    );
    const onChangePhoneNumber = useCallback(
      (value) => {
        setBindingTgData((prev) => ({
          ...prev,
          phoneNumber: { ...prev.phoneNumber, current: value },
        }));
      },
      [setBindingTgData]
    );
    const onClearPhoneNumber = useCallback(() => {
      setBindingTgData((prev) => ({
        ...prev,
        phoneNumber: { ...prev.phoneNumber, current: "" },
      }));
    }, [setBindingTgData]);

    const onClearAuthCode = useCallback(() => {
      setBindingTgData((prev) => ({
        ...prev,
        authCode: "",
      }));
    }, [setBindingTgData]);

    const onChangeStep = useCallback(
      (step) => {
        setCurrentStep(step);
      },
      [setCurrentStep]
    );

    const onSubmitForm = useCallback(
      async (event) => {
        event.preventDefault();

        const body = {};

        if (currentStep === BindTgStepsEnum.ENTERING) {
          body.phoneNumber = bindingTgData.phoneNumber.current;
        }

        if (currentStep === BindTgStepsEnum.CONFIRMATION) {
          body.authCode = bindingTgData.authCode;
        }

        await widget
          .$authorizedAjax({
            url: `${process.env.REACT_APP_API_URL}/binding/tg/account`,
            method: "POST",
            data: body,
          })
          .then((res) => {
            const status = res.status;
            const message = res.message;

            switch (status) {
              case "warning":
                new Modal()._showError(message);
                onChangeStep(BindTgStepsEnum.ENTERING_PHONE_NUMBER);
                onClearAuthCode();
                setIsrequested(false);

                break;
              case "success":
                new Modal()._showSuccess(message);
                onClearAuthCode();
                setIsrequested(false);
                setRequestTrigger((prev) => !prev);

                break;
              case "await":
                onChangeStep(BindTgStepsEnum.CONFIRMATION);
                setIsrequested(false);
                break;
            }
          })
          .fail((err) => {
            console.log(err, "err");

            const errMessage = err?.response?.data?.message
              ? err.response.data.message
              : err?.message
              ? err.message
              : "Проблемы на стороне сервера. Попробуйте через пару минут.";

            new Modal()._showError(errMessage);
            onChangeStep(BindTgStepsEnum.ENTERING);
            onClearAuthCode();
            setIsrequested(false);
          });
      },
      [
        onChangeStep,
        currentStep,
        setIsrequested,
        onClearAuthCode,
        bindingTgData,
        setRequestTrigger,
      ]
    );

    const onDefineStepBtnText = useCallback(() => {
      switch (currentStep) {
        case BindTgStepsEnum.ENTERING:
          return "Получить код";
        case BindTgStepsEnum.CONFIRMATION:
          return "Проверить";
      }
    }, [currentStep]);

    const onDisabledBtn = useCallback(() => {
      switch (currentStep) {
        case BindTgStepsEnum.ENTERING:
          return (
            !matchIsValidTel(bindingTgData.phoneNumber.current) ||
            isRequested ||
            bindingTgData.phoneNumber.current === bindingTgData.phoneNumber.prev
          );
        case BindTgStepsEnum.CONFIRMATION:
          return (
            !bindingTgData.authCode ||
            bindingTgData.authCode.length < 5 ||
            isRequested
          );
        default:
          return isRequested;
      }
    }, [isRequested, currentStep, bindingTgData]);

    return (
      <Box ref={blockRef} className={styles.wrapper}>
        {currentStep === BindTgStepsEnum.STARTED ? (
          <Button
            onClick={() => onChangeStep(BindTgStepsEnum.ENTERING)}
            variant="text"
            sx={{
              fontSize: "11px",
              "&:hover": {
                backgroundColor: "transparent",
              },
            }}
            startIcon={<TelegramIcon size="20px" />}
          >
            Привязать личный телеграм
          </Button>
        ) : null}
        {currentStep === BindTgStepsEnum.ENTERING ||
        currentStep === BindTgStepsEnum.CONFIRMATION ? (
          <form onSubmit={onSubmitForm}>
            <Box
              sx={{
                gridTemplateColumns:
                  currentStep === BindTgStepsEnum.ENTERING
                    ? "1fr auto"
                    : "auto 1fr auto",
              }}
              className={styles.inputGridBox}
            >
              {currentStep === BindTgStepsEnum.CONFIRMATION && (
                <IconButton
                  onClick={() => onChangeStep(BindTgStepsEnum.ENTERING)}
                  size="small"
                  disabled={isRequested}
                  sx={{
                    "&:hover": {
                      backgroundColor: "transparent",
                    },
                  }}
                >
                  <ArrowBackIosIcon fontSize="11px" />
                </IconButton>
              )}
              {currentStep === BindTgStepsEnum.ENTERING && (
                <MuiTelInput
                  onChange={(value) => onChangePhoneNumber(value)}
                  value={bindingTgData.phoneNumber.current}
                  defaultCountry="RU"
                  label="Номер телефона"
                  preferredCountries={["RU"]}
                  size="small"
                  variant="outlined"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        {bindingTgData.phoneNumber.current && (
                          <IconButton onClick={onClearPhoneNumber} edge="end">
                            <ClearIcon />
                          </IconButton>
                        )}
                      </InputAdornment>
                    ),
                  }}
                />
              )}
              {currentStep === BindTgStepsEnum.CONFIRMATION && (
                <TextField
                  onChange={(event) => onChangeAuthCode(event.target.value)}
                  value={bindingTgData.authCode}
                  label="Проверочный код"
                  size="small"
                  variant="outlined"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        {bindingTgData.authCode && (
                          <IconButton onClick={onClearAuthCode} edge="end">
                            <ClearIcon />
                          </IconButton>
                        )}
                      </InputAdornment>
                    ),
                  }}
                />
              )}
              <Button
                variant="contained"
                type="submit"
                size="small"
                className={styles.insideStepBtn}
                disabled={onDisabledBtn()}
                startIcon={
                  isRequested ? <CircularProgress size="20px" /> : null
                }
              >
                {onDefineStepBtnText()}
              </Button>
            </Box>
          </form>
        ) : null}
        {currentStep === BindTgStepsEnum.BINDING && (
          <Box className={styles.finalStepBtnBlock}>
            <Button
              startIcon={<CheckIcon color="green" size="20px" />}
              sx={{
                fontSize: "11px",
              }}
              className={clsx([styles.finalStepBtn])}
              disabled
              variant="text"
            >
              Телеграм успешно привязан {tgPhoneNumber}
            </Button>
            <Button
              sx={{
                fontSize: "11px",
                "&:hover": {
                  backgroundColor: "transparent",
                },
              }}
              variant="text"
              onClick={() => onChangeStep(BindTgStepsEnum.ENTERING)}
            >
              Изменить
            </Button>
          </Box>
        )}
      </Box>
    );
  }
);

export default LinkTelegramStepper;
