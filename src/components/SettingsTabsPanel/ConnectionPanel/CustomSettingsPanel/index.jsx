import React, { memo, useCallback, useEffect, useState } from "react";

import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  TextField,
} from "@mui/material";

import clsx from "clsx";

import styles from "./styles.module.scss";
import { useThemeDetector } from "../../../../hooks/useThemeDetector";

const CustomSettingsPanel = memo(
  ({ Modal, accountData, widget, setRequestTrigger }) => {
    const theme = useThemeDetector();

    const [pipelinesData, setPipelinesData] = useState({
      data: [],
      isLoading: true,
    });
    const [isRequested, setIsRequested] = useState(false);

    const [settings, setSettings] = useState({
      createOnly: {
        prev: accountData.widgetInfo.config.chatsOnlyWithPersonalAccount,
        current: accountData.widgetInfo.config.chatsOnlyWithPersonalAccount,
      },
      leadId: {
        prev: accountData.widgetInfo.config?.createChatIn?.leadId ?? null,
        current: accountData.widgetInfo.config?.createChatIn?.leadId ?? null,
      },
      pipelineId: {
        prev: accountData?.widgetInfo?.config?.createChatIn?.pipelineId ?? null,
        current:
          accountData?.widgetInfo?.config?.createChatIn?.pipelineId ?? null,
      },
    });

    useEffect(() => {
      const createOnly =
        accountData.widgetInfo.config.chatsOnlyWithPersonalAccount;
      const leadId = accountData.widgetInfo.config?.createChatIn?.leadId;
      const pipelineId =
        accountData?.widgetInfo?.config?.createChatIn?.pipelineId;

      setSettings(() => ({
        createOnly: {
          current: createOnly,
          prev: createOnly,
        },
        leadId: {
          current: leadId ?? null,
          prev: leadId ?? null,
        },
        pipelineId: {
          current: pipelineId ?? null,
          prev: pipelineId ?? null,
        },
      }));
    }, [accountData]);

    useEffect(() => {
      (async () => {
        setPipelinesData((prev) => ({ ...prev, isLoading: true }));

        widget
          .$authorizedAjax({
            url: `${process.env.REACT_APP_API_URL}/amo/leads/pipelines`,
            method: "GET",
          })
          .then((res) => {
            const status = res.status;

            switch (status) {
              case "success":
                const data = res.apiData.usefulData;
                setPipelinesData((prev) => ({ ...prev, data }));
              default:
                setPipelinesData((prev) => ({ ...prev, isLoading: false }));
                break;
            }
          })
          .fail(() => {
            setPipelinesData((prev) => ({ ...prev, isLoading: false }));
          });
      })();
    }, []);

    const onDefinePipelineOptions = useCallback(() => {
      const checkLead = pipelinesData.data.find(
        (obj) => obj.id === settings.leadId.current
      );

      if (checkLead) {
        return checkLead.statuses;
      } else {
        return [];
      }
    }, [settings, pipelinesData]);

    const onChangeLeadIdAutocomplete = useCallback(
      (newValue) => {
        setSettings((prev) => ({
          ...prev,
          leadId: {
            ...prev.leadId,
            current: newValue?.id ? newValue.id : null,
          },
          ...(!newValue && {
            pipelineId: {
              ...prev.pipelineId,
              current: null,
            },
          }),
        }));
      },
      [setSettings]
    );

    const onChangePipelineIdAutocomplete = useCallback(
      (newValue) => {
        setSettings((prev) => ({
          ...prev,
          pipelineId: {
            ...prev.pipelineId,
            current: newValue?.id ? newValue.id : null,
          },
        }));
      },
      [setSettings]
    );

    const onSubmitForm = useCallback(
      async (event) => {
        event.preventDefault();

        setIsRequested(true);

        const data = {};

        if (settings.createOnly.current !== settings.createOnly.prev) {
          data.createOnly = settings.createOnly.current;
        }
        if (settings.leadId.current !== settings.leadId.prev) {
          data.leadId = settings.leadId.current;
        }
        if (settings.pipelineId.current !== settings.pipelineId.prev) {
          data.pipelineId = settings.pipelineId.current;
        }
        await widget
          .$authorizedAjax({
            url: `${process.env.REACT_APP_API_URL}/account`,
            method: "PATCH",
            data,
          })
          .then((res) => {
            const status = res.status;
            const message = res.message;

            switch (status) {
              case "warning":
                new Modal()._showError(message);
                setIsRequested(false);
                break;
              case "success":
                setIsRequested(false);
                new Modal()._showSuccess(message);
                setRequestTrigger((prev) => !prev);
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

            setIsRequested(false);
          });
      },
      [settings, setIsRequested]
    );

    const onDisabledSaveBtn = useCallback(() => {
      return (
        (settings.createOnly.current === settings.createOnly.prev &&
          settings.leadId.current === settings.leadId.prev &&
          settings.pipelineId.current === settings.pipelineId.prev) ||
        (settings.leadId.current && !settings.pipelineId.current) ||
        (settings.pipelineId.current && !settings.leadId.current) ||
        isRequested
      );
    }, [settings, isRequested]);

    const onChangeCheckbox = useCallback(
      (event) => {
        setSettings((prev) => ({
          ...prev,
          createOnly: { ...prev.createOnly, current: event.target.checked },
        }));
      },
      [setSettings]
    );

    return (
      <form
        className={clsx([
          styles.form,
          theme === "dark" ? styles.darkTheme : styles.lightTheme,
        ])}
        onSubmit={onSubmitForm}
      >
        <Box className={styles.changeLeadDataBlock}>
          <Autocomplete
            disablePortal
            options={pipelinesData.data}
            value={
              pipelinesData.data.find(
                (option) => option.id === settings.leadId.current
              ) || null
            }
            getOptionLabel={(option) => {
              return option.hasOwnProperty("name") ? option.name : "";
            }}
            onChange={(event, newValue) => onChangeLeadIdAutocomplete(newValue)}
            disabled={pipelinesData.isLoading}
            renderInput={(params) => (
              <TextField
                {...params}
                size="small"
                label="Выберите воронку"
                disabled={pipelinesData.isLoading}
              />
            )}
          />

          {settings.leadId.current ? (
            <Autocomplete
              disablePortal
              options={onDefinePipelineOptions()}
              value={
                onDefinePipelineOptions().find(
                  (option) => option.id === settings.pipelineId.current
                ) || null
              }
              getOptionLabel={(option) => {
                return option.hasOwnProperty("name") ? option.name : "";
              }}
              onChange={(event, newValue) =>
                onChangePipelineIdAutocomplete(newValue)
              }
              disabled={pipelinesData.isLoading}
              renderInput={(params) => (
                <TextField
                  {...params}
                  size="small"
                  label="Выберите этап воронки"
                  disabled={pipelinesData.isLoading}
                />
              )}
            />
          ) : null}
        </Box>
        <FormControlLabel
          control={
            <Checkbox
              onChange={onChangeCheckbox}
              checked={settings.createOnly.current}
              value={settings.createOnly.current}
            />
          }
          label="Создавать чат, только если бот был приглашён привязанным личным аккаунтом"
        />
        <Button
          disabled={onDisabledSaveBtn()}
          className={clsx([styles.saveBtn])}
          variant="outlined"
          type="submit"
          startIcon={isRequested ? <CircularProgress size="20px" /> : null}
        >
          Сохранить
        </Button>
      </form>
    );
  }
);

export default CustomSettingsPanel;
