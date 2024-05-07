import CreateGroupChatsItem from "./components/CreateGroupChatsItem";

import React from "react";

import { createRoot } from "react-dom/client";
import SettingsTabsPanel from "./components/SettingsTabsPanel/index";

import SettingsBtnsBlock from "./components/SettingsBtnsBlock";
import FooterBlock from "./components/FooterBlock";

const onUpdateDPSettingsCustomInputValue = (customInputElem, key, newValue) => {
  const inputValue = customInputElem.value;

  if (!!inputValue) {
    let jsonObject = JSON.parse(inputValue);

    if (!newValue) {
      if (Object.keys(jsonObject).length > 1) {
        delete jsonObject[key];
        customInputElem.value = JSON.stringify(jsonObject);
      } else {
        customInputElem.value = "";
      }
    } else {
      jsonObject[key] = newValue;
      customInputElem.value = JSON.stringify(jsonObject);
    }

    const newChangeEvent = new Event("change", { bubbles: true });
    customInputElem.dispatchEvent(newChangeEvent);
  } else {
    let jsonObject = {};

    jsonObject[key] = newValue;

    customInputElem.value = JSON.stringify(jsonObject);

    const newChangeEvent = new Event("change", { bubbles: true });
    customInputElem.dispatchEvent(newChangeEvent);
  }

  return;
};

const Widget = (widget, Modal) => {
  widget.callbacks = {
    settings: (modalBody) => {
      const modalRightBlock = document.querySelector(
        ".widget-settings__wrap-desc-space"
      );

      modalRightBlock.querySelector(".widget-settings__desc-space").style.flex =
        "1 0 auto";

      const footerHTMLMarkup =
        "<div class='integrator20_settings-modal__footer'></div>";

      modalRightBlock.insertAdjacentHTML("beforeend", footerHTMLMarkup);

      modalRightBlock.style.paddingBottom = "0px";

      const widgetSettings = widget.get_settings();

      const targetElement = document.querySelector(
        ".widget_settings_block__fields"
      );

      const footerElement = document.querySelector(
        ".integrator20_settings-modal__footer"
      );
      createRoot(targetElement).render(
        <>
          <SettingsBtnsBlock />
          <SettingsTabsPanel
            Modal={Modal}
            widgetSettings={widgetSettings}
            widget={widget}
          />
        </>
      );

      createRoot(footerElement).render(<FooterBlock />);
    },
    init: () => {
      return true;
    },
    bind_actions: (action) => {
      return true;
    },
    render: async () => {
      if (window.location.pathname.includes("/leads/detail")) {
        const menuElem = document
          .querySelector(".card-holder__container")
          .querySelector(".button-input__context-menu ");

        const markup = `<li data-element="createGroupChatItemElement" class="button-input__context-menu__item  element__ " id="create-group-chat"></li>`;

        menuElem.insertAdjacentHTML("afterbegin", markup);

        const createGroupChatElement = menuElem.querySelector(
          '[data-element="createGroupChatItemElement"]'
        );

        createRoot(createGroupChatElement).render(
          <CreateGroupChatsItem widget={widget} />
        );
      }

      return true;
    },
    dpSettings: (data) => {
      try {
        const settingsFieldsBlock = document.querySelector(
          "#widget_settings__fields_wrapper"
        );

        settingsFieldsBlock.insertAdjacentHTML(
          "beforeend",
          `<div style="margin-bottom: 20px;" class="widget_settings_block__input_field form-group__control">
          <label
            class="control-checkbox widget_settings_block__controls__text text-input  "
          >
            <div class="control-checkbox__body">
              <input id="shouldCreateChat" type="checkbox" />
              <span class="control-checkbox__helper "></span>
            </div>
            <div class="control-checkbox__text element__text " title="Создать чат">
              Создать чат
            </div>
          </label>
          <p style="fonr-size: 7px; color: rgb(181, 181, 181);">Создавать группу для каждой сделки (если пусто - отправится только сообщение)</p>
        </div>`
        );

        const messageFieldElem = document.querySelector("[name='message']");

        settingsFieldsBlock
          .querySelectorAll(".widget_settings_block__item_field")
          .forEach((elem) => (elem.style.marginBottom = "0px"));

        const messageFieldNewMarkup = `<textarea
          style="width: 100%;"
          id="message"
          name="message"
          class="text-input-textarea widget_settings_block__controls__text text-input textarea-autosize"
        >${messageFieldElem.value}</textarea>`;

        messageFieldElem.outerHTML = messageFieldNewMarkup;

        const shouldCreateChatCheckboxElem = document.querySelector(
          "#shouldCreateChat"
        );

        const customInputElement = document.querySelector('[name="custom"]');

        if (!!customInputElement.value) {
          const customHiddenElementValueParsed = JSON.parse(
            customInputElement.value
          );

          if (
            customHiddenElementValueParsed.hasOwnProperty("shouldCreateChat")
          ) {
            shouldCreateChatCheckboxElem.checked =
              customHiddenElementValueParsed.shouldCreateChat;
          }
        }

        customInputElement.closest(
          ".widget_settings_block__item_field"
        ).style.display = "none";

        shouldCreateChatCheckboxElem.addEventListener("change", (event) => {
          onUpdateDPSettingsCustomInputValue(
            customInputElement,
            "shouldCreateChat",
            event.target.checked
          );
        });

        return true;
      } catch (err) {
        console.log(err);
      }
    },
    advancedSettings: (data) => {
      return true;
    },
    destroy: () => {},
    contacts: {
      selected: () => {
        return true;
      },
    },
    onSalesbotDesignerSave: (handler_code, params) => {},
    leads: {
      selected: () => {},
    },
    todo: {
      selected: () => {},
    },
    onSave: (settingsData) => {
      widget.$authorizedAjax({
        url: `${process.env.REACT_APP_API_URL}/widget/status`,
        method: "PATCH",
        data: settingsData,
      });

      return true;
    },
    onAddAsSource: (pipeline_id) => {
      return true;
    },
  };

  return widget;
};

export default Widget;
