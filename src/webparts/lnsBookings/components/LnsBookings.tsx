import * as React from 'react';
//@ts-ignore
import { useState, useEffect } from 'react';
import styles from './LnsBookings.module.scss';
import { ILnsBookingsProps } from './ILnsBookingsProps';
import { escape } from '@microsoft/sp-lodash-subset';
// @ts-ignore
import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
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
        try{
          console.log('Allow Invite Response --', user)
          setCurrentUserType(user.IsSiteAdmin ? 'admin' : 'user');
          
        } catch(error){
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

      </div>
    </section>
  );
};

export default LnsBookingsProps;
