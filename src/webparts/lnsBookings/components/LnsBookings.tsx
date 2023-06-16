import * as React from 'react';
//@ts-ignore
import { useState, useEffect } from 'react';

import { ILnsBookingsProps } from './ILnsBookingsProps';
import { escape } from '@microsoft/sp-lodash-subset';
// @ts-ignore
import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
import { NormalPeoplePicker } from '@fluentui/react/lib/Pickers';
import { IPersonaProps } from 'office-ui-fabric-react';

import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
// @ts-ignore
import customViewPlugin from './CustomView.js';

import styles from './LnsBookings.module.scss';
import './index.scss';

function LnsCalendar() {
  // const [selectedDates, setSelectedDates] = useState<Date>([]);
  // @ts-ignore
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const calendarRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Simulating an asynchronous rendering process
    const delay = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    if (calendarRef.current) {
      const calendar = new Calendar(
        calendarRef.current, {
        plugins: [dayGridPlugin, customViewPlugin],
        selectable: true,
        initialView: 'dayGridWeek',
        now: new Date(),
        weekends: false,
        visibleRange: {
          start: 'now',
          end: new Date().setDate(new Date().getDate() + 15)
        },
      });

      calendar.render();
      dayCellContent();
      return () => {
        calendar.destroy();
        clearTimeout(delay); // Clean up the timeout on unmount
      };
    }
  }, [calendarRef]);

 

  function dayCellContent() {
    // Get the week row element
    const weekRow = document.querySelector('tr');

    // Check if the week row element exists
    if (weekRow) {

      const weekRow = document.querySelector('.fc-scrollgrid-section-body .fc-daygrid-body-unbalanced table tbody tr');
      const dayElements = weekRow.querySelectorAll('td[data-date]');

      dayElements.forEach((dayElement) => {
        const date = dayElement.getAttribute('data-date');
        const dayOfMonth = new Date(date).getDate();
        const dayOfWeek = new Date(date).toLocaleString('en-us', { weekday: 'short' });

        // Add day of the month on the top left corner
        const dayOfMonthElement = document.createElement('div');
        dayOfMonthElement.className = 'day-of-month';
        dayOfMonthElement.innerHTML = String(dayOfMonth);
        dayElement.querySelector('.fc-daygrid-day-frame').prepend(dayOfMonthElement);

        // Add name of the day of the week on the top right corner
        const dayOfWeekElement = document.createElement('div');
        dayOfWeekElement.className = 'day-of-week';
        dayOfWeekElement.innerHTML = dayOfWeek;
        dayElement.querySelector('.fc-daygrid-day-frame').appendChild(dayOfWeekElement);


        // 3. Add counter on the left bottom corner
        const counterElement = document.createElement('div');
        counterElement.className = 'counter';
        counterElement.innerHTML = '0/100';
        dayElement.querySelector('.fc-daygrid-day-frame').prepend(counterElement);

        // 4. Add small icon chevron button on the bottom right corner
        const chevronContainer = `
          <div class='chevron'>
            <button key='${date}' id='btn-${date}' class='chevron-btn'>
              <span>✔</span>
            </button>
          </div>`;

        // const chevronElement = document.createElement('div');
        // chevronElement.className = 'chevron';
        // dayElement.querySelector('.fc-daygrid-day-bottom').prepend(chevronElement);
        dayElement.querySelector('.fc-daygrid-day-frame').insertAdjacentHTML('beforeend', chevronContainer);

        const buttons = document.querySelectorAll('.chevron-btn');

        buttons.forEach(button => {
          button.addEventListener('click', () => {
            button.classList.add('active');
          });
        });
      })
    }
    else console.error('Failed to find the element!');
  };

  return (
    <div>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div>
          <div
            ref={calendarRef}
            className={'fcContainer'}
            style={{ maxHeight: '30vh', margin: '20px 0px' }}
          />
        </div>
      )}
      {/* <div>Last Updated: {}</div> */}
    </div>
  );
}

const LnsBookingsProps: React.FC<ILnsBookingsProps> = (props) => {
  const {
    // @ts-ignore
    description,
    // @ts-ignore
    isDarkTheme,
    // @ts-ignore
    environmentMessage,
    hasTeamsContext,
    userDisplayName,
    currentSiteUrl,
    spHttpClient
  } = props;

  // @ts-ignore
  const [selectedUsers, setSelectedUsers] = useState<IPersonaProps[]>([]);

  // @ts-ignore
  const [currentUserType, setCurrentUserType] = useState<string>('admin');

  useEffect(() => {
    const getCurrentUser = async () => {
      const endpoint: string = `${currentSiteUrl}/_api/web/currentUser/?$select=IsSiteAdmin`;

      try {
        const response = await spHttpClient.post(
          endpoint,
          SPHttpClient.configurations.v1,
          {
            headers: [['accept', 'application/json;odata.metadata=none']],
          }
        );

        // const response: SPHttpClientResponse = await spHttpClient.get(endpoint, SPHttpClient.configurations.v1, requestOptions);
        const user: any = await response.json();
        try {
          console.log('Allow Invite Response --', user)
          setCurrentUserType(user.IsSiteAdmin ? 'admin' : 'user');

        } catch (error) {
          console.log(error);
        }

      } catch (error) {
        console.error('Error retrieving user information:', error);
      }
    };

    getCurrentUser();

  }, [currentSiteUrl, spHttpClient]);

  const onResolveSuggestions = async (
    filter?: string,
    selectedItems?: IPersonaProps[]
  ): Promise<IPersonaProps[]> => {
    try {
      const endpoint: string = `${currentSiteUrl}/_api/SP.UI.ApplicationPages.ClientPeoplePickerWebServiceInterface.clientPeoplePickerSearchUser`;
      const queryParams = {
        AllowEmailAddresses: true,
        AllowMultipleEntities: false,
        AllUrlZones: false,
        MaximumEntitySuggestions: 50,
        PrincipalSource: 15,
        PrincipalType: 15,
        QueryString: filter,
        SharePointGroupID: 0,
        UrlZone: 1
      };

      let parsedValue;
      const response = await spHttpClient.post(
        endpoint,
        SPHttpClient.configurations.v1,
        {
          headers: [['accept', 'application/json;odata.metadata=none']],
          body: JSON.stringify({ queryParams })
        }
      );

      try {
        const json = await response.json();
        parsedValue = JSON.parse(json.value.toString());
        console.log('Response JSON:', parsedValue);
        // console.log('Response JSON:', json);
      } catch (error) {
        console.error('Error parsing JSON:', error);
        return [];
      }

      if (Array.isArray(parsedValue)) {
        const suggestions: IPersonaProps[] = parsedValue
          // .filter((user: any) => user.EntityData && user.EntityData.Description !== null)
          .filter((user: any) => user.EntityData && user.EntityData.Email !== null)
          .map((user: any) => ({
            key: user.Key, // Add a unique identifier
            text: user.DisplayText,
            secondaryText: user.EntityData.Email
          }));

        // Filter out already selected items
        const filteredSuggestions = selectedItems
          ? suggestions.filter(
            (suggestion) =>
              !selectedItems.some(
                (selectedItem) => selectedItem.text === suggestion.text
              )
          )
          : suggestions;

        return filteredSuggestions;
      } else {
        console.error('Invalid response structure:', parsedValue);
        return [];
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      return [];
    }
  };

  const onChange = (items?: IPersonaProps[]): void => {
    setSelectedUsers(items || []);
  };

  return (
    <section className={`${styles.lnsBookings} ${hasTeamsContext ? styles.teams : ''}`}>
      <div className={styles.welcome}>
        <h2>Well done, {escape(userDisplayName)}!</h2>
        <h5> Current User Type: ({currentUserType})</h5>
        {/* TODO - change this to === / !== in order to make it correct */}

        {currentUserType !== 'admin' && (
          <NormalPeoplePicker
            onResolveSuggestions={onResolveSuggestions}
            onChange={onChange}
            selectedItems={selectedUsers}
            resolveDelay={1000}
          />
        )}

        {currentUserType === 'admin' && (
          <><span aria-disabled>no permissions to invite users</span></>
        )}
        <LnsCalendar />
      </div>
    </section>
  );
};

export default LnsBookingsProps;



