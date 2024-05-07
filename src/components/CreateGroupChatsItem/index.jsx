import React, { memo, useCallback } from "react";

import { Telegram as TelegramIcon } from "@mui/icons-material";

const CreateGroupChatsItem = memo(({ widget }) => {
  const onRequestToCreateChat = useCallback(() => {
    const ledId = APP.data.current_card.id;

    widget
      .$authorizedAjax({
        url: `${process.env.REACT_APP_API_URL}/widget/manual/create-chat`,
        method: "POST",
        data: {
          ledId,
        },
      })
      .done((res) => {
        const status = res.status;
        const message = res.message;

        switch (status) {
          case "warning":
            const warningNotice = {
              text: {
                header: "Внимание",
                text: message,
              },
              type: "error",
            };

            APP.notifications.show_notification(warningNotice);

            break;
          case "success":
            const successNotice = {
              text: {
                header: "Отлично",
                text: message,
              },
            };

            APP.notifications.show_notification(successNotice);

            break;
        }
      })
      .fail((err) => {
        const errMessage = err?.response?.data?.message
          ? err.response.data.message
          : err?.message
          ? err.message
          : "Проблемы на стороне сервера. Попробуйте через пару минут.";

        const errNotice = {
          text: {
            header: "Ошибка",
            text: errMessage,
          },
          type: "error",
        };

        APP.notifications.show_notification(errNotice);
      });
  }, []);

  return (
    <div
      onClick={onRequestToCreateChat}
      className="button-input__context-menu__item__inner"
    >
      <span className="button-input__context-menu__item__icon-container">
        <TelegramIcon fontSize="11px" />
      </span>

      <span className="button-input__context-menu__item__text ">
        Создать групповой чат
      </span>
    </div>
  );
});

export default CreateGroupChatsItem;
