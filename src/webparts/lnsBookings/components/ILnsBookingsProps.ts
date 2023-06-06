import { SPHttpClient } from '@microsoft/sp-http';

export interface ILnsBookingsProps {
  description: string;
  isDarkTheme: boolean;
  environmentMessage: string;
  hasTeamsContext: boolean;
  userDisplayName: string;
  currentSiteUrl: string;
  spHttpClient: SPHttpClient;
}