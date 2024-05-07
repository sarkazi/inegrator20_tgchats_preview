import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  TextField,
} from "@mui/material";
import React, { memo, useCallback, useEffect, useRef, useState } from "react";

import styles from "./styles.module.scss";

import {
  Clear as ClearIcon,
  Check as CheckIcon,
  Token as TokenIcon,
} from "@mui/icons-material";

import clsx from "clsx";

const TgTokenBindingStepsEnum = {
  START: "start",
  ENTERING: "entering",
  BINDING: "binding",
};

const TgTokenStepper = memo(
  ({ widget, Modal, accountData, setRequestTrigger }) => {
    const blockRef = useRef(null);

    const token = useCallback(
      accountData?.widgetInfo?.config?.telegramData?.token,
      [accountData?.widgetInfo?.config?.telegramData?.token]
    );

    const [isRequested, setIsrequested] = useState(false);

    const [tgToken, setTgToken] = useState({
      current: token ?? "",
      prev: token ?? "",
    });

    const [curStep, setCurStep] = useState(
      token ? TgTokenBindingStepsEnum.BINDING : TgTokenBindingStepsEnum.START
    );

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (
          blockRef.current &&
          !blockRef.current.contains(event.target) &&
          curStep === TgTokenBindingStepsEnum.ENTERING
        ) {
          setCurStep(
            token
              ? TgTokenBindingStepsEnum.BINDING
              : TgTokenBindingStepsEnum.START
          );
        }
      };

      document.addEventListener("mousedown", handleClickOutside);

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [token, curStep]);

    useEffect(() => {
      setCurStep(
        token ? TgTokenBindingStepsEnum.BINDING : TgTokenBindingStepsEnum.START
      );
    }, [token]);

    useEffect(() => {
      setTgToken(() => ({
        current: token,
        prev: token,
      }));
    }, [token]);

    const onChangeTokenField = useCallback(
      (value) => {
        setTgToken((prev) => ({ ...prev, current: value }));
      },
      [setTgToken]
    );

    const onClearTokenField = useCallback(() => {
      setTgToken((prev) => ({ ...prev, current: "" }));
    }, [setTgToken]);

    const onSubmitForm = useCallback(
      async (event) => {
        event.preventDefault();
        setIsrequested(true);

        await widget
          .$authorizedAjax({
            url: `${process.env.REACT_APP_API_URL}/binding/tg/token`,
            method: "POST",
            data: {
              token: tgToken.current,
            },
          })
          .then((res) => {
            const status = res.status;
            const message = res.message;

            switch (status) {
              case "warning":
                onClearTokenField();
                new Modal()._showError(message);
                setIsrequested(false);

                break;
              case "success":
                new Modal()._showSuccess(message);
                setRequestTrigger((prev) => !prev);
                setIsrequested(false);

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

            setIsrequested(false);
          });
      },
      [
        onChangeStep,
        setIsrequested,
        onClearTokenField,
        tgToken,
        setRequestTrigger,
      ]
    );

    const onDisabledBtn = useCallback(() => {
      return tgToken.current === tgToken.prev || isRequested;
    }, [tgToken, isRequested]);

    const onDefineFinalStepStateText = useCallback(() => {
      return `Токен телеграм бота добавлен ${tgToken.current.substring(
        0,
        7
      )}....${tgToken.current.slice(-7)}`;
    }, [tgToken]);

    const onChangeStep = useCallback(
      (step) => {
        setCurStep(step);
      },
      [setCurStep]
    );

    return (
      <Box ref={blockRef} className={styles.wrapper}>
        {curStep === TgTokenBindingStepsEnum.BINDING ? (
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
              {onDefineFinalStepStateText()}
            </Button>
            <Button
              sx={{
                fontSize: "11px",
                "&:hover": {
                  backgroundColor: "transparent",
                },
              }}
              variant="text"
              onClick={() => onChangeStep(TgTokenBindingStepsEnum.ENTERING)}
            >
              Изменить
            </Button>
          </Box>
        ) : null}
        {curStep === TgTokenBindingStepsEnum.START ? (
          <Button
            onClick={() => onChangeStep(TgTokenBindingStepsEnum.ENTERING)}
            variant="text"
            sx={{
              fontSize: "11px",
              "&:hover": {
                backgroundColor: "transparent",
              },
            }}
            startIcon={<TokenIcon size="20px" />}
          >
            Добавить токен телеграм бота
          </Button>
        ) : null}
        {curStep === TgTokenBindingStepsEnum.ENTERING ? (
          <form onSubmit={onSubmitForm}>
            <Box className={styles.inputGridBox}>
              <TextField
                onChange={(event) => onChangeTokenField(event.target.value)}
                label="Телегам токен"
                value={tgToken.current}
                size="small"
                variant="outlined"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      {tgToken.current && (
                        <IconButton onClick={onClearTokenField} edge="end">
                          <ClearIcon />
                        </IconButton>
                      )}
                    </InputAdornment>
                  ),
                }}
                sx={{
                  marginBottom: "3px",
                }}
              />
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
                Добавить
              </Button>
            </Box>
          </form>
        ) : null}
      </Box>
    );
  }
);

export default TgTokenStepper;
