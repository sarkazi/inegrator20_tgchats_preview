import React, { memo, useCallback, useEffect, useState } from "react";

import { TabList, TabPanel, TabContext } from "@mui/lab";
import { Tab, Box, ThemeProvider } from "@mui/material";

import styles from "./styles.module.scss";
import ConnectionPanel from "./ConnectionPanel";
import SettingsPanel from "./SettingsPanel";
import BillingSection from "./BillingSection";
import { darkTheme, lightTheme } from "../../theme/MUIThemes";
import { useThemeDetector } from "../../hooks/useThemeDetector";

const TabsEnum = {
  CONNECTION: "connection",
  SETTINGS: "settings",
  USERS: "users",
  BILLING: "billing",
};

const SettingsTabsPanel = memo(({ widgetSettings, widget, Modal }) => {
  const theme = useThemeDetector();

  const [currentTab, setCurrentTab] = useState(TabsEnum.SETTINGS);
  const [requestTrigger, setRequestTrigger] = useState(false);

  const [accountData, setAccountData] = useState({});

  useEffect(() => {
    (async () => {
      widget
        .$authorizedAjax({
          url: `${process.env.REACT_APP_API_URL}/account`,
          method: "GET",
        })
        .then((res) => {
          const status = res.status;

          switch (status) {
            case "success":
              setAccountData(res.apiData.accountData);

              break;
          }
        });
    })();
  }, [requestTrigger]);

  const tabsHandleChange = useCallback(
    (_, value) => {
      setCurrentTab(value);
    },
    [setCurrentTab]
  );

  return (
    <ThemeProvider theme={theme === "dark" ? darkTheme : lightTheme}>
      <Box
        sx={{
          width: "100%",
          typography: "body1",
          marginBottom: "30px",
          marginTop: "25px",
        }}
      >
        <TabContext value={currentTab}>
          <Box
            sx={{ borderBottom: 1, borderColor: "divider" }}
            className={styles.tabsBox}
          >
            <TabList
              variant="fullWidth"
              onChange={tabsHandleChange}
              aria-label="lab API tabs example"
            >
              <Tab label="Настройки" value={TabsEnum.SETTINGS} />
              <Tab
                disabled={widgetSettings.active !== "Y"}
                label="Подключение"
                value={TabsEnum.CONNECTION}
              />
              <Tab
                disabled={widgetSettings.active !== "Y"}
                label="Оплата"
                value={TabsEnum.BILLING}
              />
            </TabList>
          </Box>

          <TabPanel className={styles.tabPanel} value={TabsEnum.SETTINGS}>
            <SettingsPanel
              accountData={accountData}
              widgetSettings={widgetSettings}
            />
          </TabPanel>
          <TabPanel className={styles.tabPanel} value={TabsEnum.CONNECTION}>
            <ConnectionPanel
              widgetSettings={widgetSettings}
              widget={widget}
              Modal={Modal}
              accountData={accountData}
              setRequestTrigger={setRequestTrigger}
            />
          </TabPanel>
          <TabPanel className={styles.tabPanel} value={TabsEnum.BILLING}>
            <BillingSection
              Modal={Modal}
              accountData={accountData}
              widget={widget}
              setRequestTrigger={setRequestTrigger}
              widgetSettings={widgetSettings}
            />
          </TabPanel>
        </TabContext>
      </Box>
    </ThemeProvider>
  );
});

export default SettingsTabsPanel;
