import * as React from "react";
import { IHolidaysCalendarState } from "../interfaces/IHolidaysCalendarState";
import { HolidaysCalendarService } from "../../../common/services/HolidaysCalendarService";
import HolidaysList from "./HolidaysList/HolidaysList";
import { IHolidaysCalendarProps } from "./IHolidaysCalendarProps";
import {
  Button,
  FluentProvider,
  IdPrefixProvider,
  MessageBar,
  MessageBarActions,
  MessageBarBody,
  webLightTheme,
} from "@fluentui/react-components";
import { DismissRegular } from "@fluentui/react-icons";
import csvDownload from "json-to-csv-export";

const HolidaysCalendar = (props: IHolidaysCalendarProps): JSX.Element => {
  const [service] = React.useState<HolidaysCalendarService>(
    new HolidaysCalendarService(props.spService, props.graphService)
  );

  const [state, setState] = React.useState<IHolidaysCalendarState>({
    listItems: [],
    holidayListItems: [],
    message: {
      show: false,
      intent: "success",
    },
    employeeInfo: null,
    columns: [],
  });

  const handleCalenderAddClick = async (itemId: number): Promise<void> => {
    try {
      const selectedItem = state.holidayListItems.filter(
        (item) => item.Id === itemId
      );
      await service.addLeaveInCalendar(state.employeeInfo, selectedItem[0]);
      setState((prevState: IHolidaysCalendarState) => ({
        ...prevState,
        message: { show: true, intent: "success" },
      }));
    } catch (ex) {
      console.log(ex);
      setState((prevState: IHolidaysCalendarState) => ({
        ...prevState,
        message: { show: true, intent: "error" },
      }));
    }
  };

  const handleDismissClick = (): void => {
    setState((prevState: IHolidaysCalendarState) => ({
      ...prevState,
      message: { show: false, intent: "success" },
    }));
  };

  const handleDownload = (): void => {
    const itemsToDownload = service.getItemsToDownloadAsCSV(
      state.holidayListItems
    );
    csvDownload(itemsToDownload);
  };

  /* eslint-disable */
  React.useEffect(() => {
    (async () => {
      const employeeInfo = await service.getEmployeeInfo();

      const listItems = await service.getHolidaysByLocation(
        employeeInfo.officeLocation
      );
      const holidayItems = service.getHolidayItemsToRender(listItems);

      setState((prevState: IHolidaysCalendarState) => ({
        ...prevState,
        listItems: listItems,
        holidayListItems: holidayItems,
        employeeInfo: employeeInfo,
      }));
    })();
  }, []);
  return (
    <IdPrefixProvider value="react-holiday-calendar">
      <FluentProvider theme={webLightTheme}>
        {state.message.show && (
          <MessageBar intent={state.message.intent}>
            <MessageBarBody>
              {state.message.intent === "success"
                ? "Holiday added in calendar"
                : "Some error occurred"}
            </MessageBarBody>
            <MessageBarActions
              containerAction={
                <Button
                  aria-label="dismiss"
                  appearance="transparent"
                  icon={<DismissRegular />}
                  onClick={handleDismissClick}
                />
              }
            ></MessageBarActions>
          </MessageBar>
        )}
        {state.holidayListItems.length > 0 && (
          <HolidaysList
            items={state.holidayListItems}
            onCalendarAddClick={handleCalenderAddClick}
            onDownloadItems={handleDownload}
            showDownload={props.showDownload}
            title={props.title}
            showFixedOptional={props.showFixedOptional}
          />
        )}
      </FluentProvider>
    </IdPrefixProvider>
  );
};

export default HolidaysCalendar;
