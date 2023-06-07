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
  const [currentUserType, setCurrentUserType] = useState<string>('');

  useEffect(() => {
    // Function to fetch the current user information
    const getCurrentUser = async () => {
      const endpoint: string = `${currentSiteUrl}/_api/web/currentUser/?$select=IsSiteAdmin`;

      try {
        const response: SPHttpClientResponse = await spHttpClient.get(endpoint, SPHttpClient.configurations.v1);
        const user: any = await response.json();
        let parsedValue = JSON.parse(user.value.toString());
        
        // Extract the user login name and perform additional logic to determine the user type
        const IsSiteAdmin: boolean = parsedValue.IsSiteAdmin;
        const userType: string = IsSiteAdminVerify(IsSiteAdmin); // Implement your logic to determine the user type
      
        setCurrentUserType(userType);
     
      } catch (error) {
        console.error('Error retrieving user information:', error);
      }
    };

    getCurrentUser();

  }, [currentSiteUrl, spHttpClient]);

 
  // Function to determine the user type based on the login name
  const IsSiteAdminVerify = (IsSiteAdmin: boolean): string => {
    // logic that checks if the isSiteAdmin is true
    if (IsSiteAdmin) {
      return 'admin';
    }
    return 'regular'; // Default user type if no specific condition is met
  };

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

  // function isUser(){
  //   let personaldata : IPersonaProps[];
  //   console.log('IPersonaProps', personaldata)
  //   console.log('IPersonaProps JSON string', JSON.stringify(personaldata))
  //   return true;
  // }

  return (
    <section className={`${styles.lnsBookings} ${hasTeamsContext ? styles.teams : ''}`}>
      <div className={styles.welcome}>
        <h2>Well done, {escape(userDisplayName)}!</h2>
        <h5> Current User Type: ({currentUserType})</h5>
     
        {currentUserType === 'admin' && (
        <NormalPeoplePicker
          onResolveSuggestions={onResolveSuggestions}
          onChange={onChange}
          selectedItems={selectedUsers}
          resolveDelay={1000}
        />
        
        )}
        {currentUserType === 'regular' && (
          <><span aria-disabled>no permissions to invite users</span></>
        )}        
      </div>
    </section>
  );
};

export default LnsBookingsProps;
