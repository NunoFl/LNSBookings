import * as React from 'react';
import { useState } from 'react';
import styles from './LnsBookings.module.scss';
import { ILnsBookingsProps } from './ILnsBookingsProps';
import { escape } from '@microsoft/sp-lodash-subset';
import { SPHttpClient } from '@microsoft/sp-http';
import { NormalPeoplePicker } from '@fluentui/react/lib/Pickers';
import { IPersonaProps } from 'office-ui-fabric-react';

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

  // const [siteLists, setSiteLists] = useState<string[]>([]);
  // const [mappedUsersList, setMappedUsersList] = useState<IPersonaProps[]>([]);
  // const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<IPersonaProps[]>([]);

  // useEffect(() => {
  //   (async () => {
  //     const endpoint: string = `${currentSiteUrl}/_api/Web/SiteUsers`;

  //     spHttpClient
  //       .get(endpoint, SPHttpClient.configurations.v1, {
  //         headers: [['accept', 'application/json;odata.metadata=none']]
  //       })
  //       .then((res: SPHttpClientResponse) => res.json())
  //       .then((users: any) => {
  //         setMappedUsersList(
  //           users.value.map((user: any) => ({
  //             key: user.Id,
  //             text: user.Title,
  //             secondaryText: user.Email
  //           }))
  //         );
  //       })
  //       .catch((error: any) => {
  //         console.log('error', error);
  //       });
  //   })();
  // }, []);

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

        <NormalPeoplePicker
          onResolveSuggestions={onResolveSuggestions}
          onChange={onChange}
          selectedItems={selectedUsers}
          resolveDelay={1000}
        />
        
      </div>
    </section>
  );
};

export default LnsBookingsProps;
