import React, { memo, useCallback, useState } from "react";

import styles from "./styles.module.scss";
import { Button, InputAdornment, IconButton } from "@mui/material";

import { Clear as ClearIcon } from "@mui/icons-material";

import { MuiTelInput, matchIsValidTel } from "mui-tel-input";

import clsx from "clsx";

const SettingsPanel = memo(({ widgetSettings }) => {
  const [accountSettings, setAccountSettings] = useState({
    phoneNumber: widgetSettings?.phoneNumber ? widgetSettings.phoneNumber : "",
  });

  const onChangeInput = useCallback(
    (value, key) => {
      setAccountSettings((prev) => ({ ...prev, [key]: value }));
    },
    [setAccountSettings]
  );

  const onDisabledSaveBtn = useCallback(() => {
    return (
      !accountSettings.phoneNumber ||
      !matchIsValidTel(accountSettings.phoneNumber)
    );
  }, [accountSettings]);

  const onClearPhoneNumberInput = useCallback(() => {
    setAccountSettings((prev) => ({
      ...prev,
      phoneNumber: "",
    }));
  }, [setAccountSettings]);

  return (
    <form className={styles.form}>
      <MuiTelInput
        onChange={(value) => onChangeInput(value, "phoneNumber")}
        value={accountSettings.phoneNumber}
        defaultCountry="RU"
        label="Номер телефона"
        preferredCountries={["RU"]}
        size="small"
        variant="outlined"
        name="phoneNumber"
        className={clsx(["widget_settings_block__controls__"])}
        sx={{
          marginBottom: "5px",
        }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              {accountSettings.phoneNumber && (
                <IconButton onClick={onClearPhoneNumberInput} edge="end">
                  <ClearIcon />
                </IconButton>
              )}
            </InputAdornment>
          ),
        }}
      />

      <Button
        disabled={onDisabledSaveBtn()}
        className={clsx([styles.saveBtn, "js-widget-save"])}
        variant="outlined"
        type="button"
        data-id={widgetSettings.id}
        data-onsave-destroy-modal={true}
        id={`save_${widgetSettings.widget_code}`}
      >
        <span className="button-input-inner ">
          <span className="button-input-inner__text">Сохранить</span>
        </span>
      </Button>
      <div className="switcher_wrapper">
        <label
          htmlFor="widget_active__sw"
          className="switcher switcher__on switcher_blue widget-settings__switcher"
        ></label>
        <input
          type="checkbox"
          value="Y"
          name="widget_active"
          id="widget_active__sw"
          className="switcher__checkbox"
        />
      </div>
    </form>
  );
});

export default SettingsPanel;
