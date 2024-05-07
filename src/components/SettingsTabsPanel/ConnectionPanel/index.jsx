import React, { memo, useCallback } from "react";

import styles from "./styles.module.scss";
import { Box } from "@mui/material";

import LinkTelegramStepper from "./BindTgStepper";
import TgTokenStepper from "./TgTokenStepper";

import CustomSettingsPanel from "./CustomSettingsPanel";

const ConnectionPanel = memo(
  ({ widget, Modal, accountData, setRequestTrigger }) => {
    const tgTokenIsLinked = useCallback(
      !!accountData?.widgetInfo?.config?.telegramData?.token,
      [accountData?.widgetInfo?.config?.telegramData?.token]
    );

    return (
      <Box className={styles.wrapper}>
        {tgTokenIsLinked && (
          <CustomSettingsPanel
            widget={widget}
            accountData={accountData}
            Modal={Modal}
            setRequestTrigger={setRequestTrigger}
          />
        )}
        <TgTokenStepper
          widget={widget}
          Modal={Modal}
          accountData={accountData}
          setRequestTrigger={setRequestTrigger}
        />
        <LinkTelegramStepper
          widget={widget}
          Modal={Modal}
          accountData={accountData}
          setRequestTrigger={setRequestTrigger}
        />
      </Box>
    );
  }
);

export default ConnectionPanel;
