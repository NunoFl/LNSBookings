import * as React from 'react';
// import { useState } from 'react';
// import styles from './LnsBookings.module.scss';
// import { ILnsBookingsProps } from './ILnsBookingsProps';
// import { escape } from '@microsoft/sp-lodash-subset';

// useEffect(() => {


//    // get events from sharepoint data to state
// }, [])

export default class LnsBookings extends React.Component {

  render() {
    //Criar objecto para eventos, pessoas e popular o ecrã com essa dummy date.
    // Calendar booking object

    // const [booking, setBooking] = useState(
    //   {
    //     id: 1,
    //     owner: 'nuno.florido@lisbonnearshore.com',
    //     details: {
    //       days: ['11/06/2023', '12/06/2023'],
    //       invitees: {
    //         1: { email: 'external@hotmail.com', confirmed: false },
    //         2: { email: 'jose.fraga@lisbonnearshore.com', confirmed: false },
    //         3: { email: 'vanessa.velosa@lisbonnearshore.com', confirmed: false }
    //       }
    //     }
    //   }
    // );



    // function handleBooking() {
    //   setBooking(booking)
    //   alert('booking called')
    // }
    // const {
    //   description,
    //   isDarkTheme,
    //   environmentMessage,
    //   hasTeamsContext,
    //   userDisplayName
    // } = this.props;
    return (
      <>
        <h1>Teste</h1>
        {/* <button type="button" onClick={() => handleBooking} /> */}
        {/* <section className={`${styles.lnsBookings} ${hasTeamsContext ? styles.teams : ''}`}>
          <div className={styles.welcome}>
            <img alt="" src={isDarkTheme ? require('../assets/welcome-dark.png') : require('../assets/welcome-light.png')} className={styles.welcomeImage} />
            <h2>Well done, {escape(userDisplayName)}!</h2>
            <div>{environmentMessage}</div>
            <div>Web part property value: <strong>{escape(description)}</strong></div>
          </div>
          <div>
            <h3>Welcome to SharePoint Framework!</h3>
            <p>
              The SharePoint Framework (SPFx) is a extensibility model for Microsoft Viva, Microsoft Teams and SharePoint. It&#39;s the easiest way to extend Microsoft 365 with automatic Single Sign On, automatic hosting and industry standard tooling.
            </p>
            <h4>Learn more about SPFx development:</h4>
            <ul className={styles.links}>
              <li><a href="https://aka.ms/spfx" target="_blank" rel="noreferrer">SharePoint Framework Overview</a></li>
              <li><a href="https://aka.ms/spfx-yeoman-graph" target="_blank" rel="noreferrer">Use Microsoft Graph in your solution</a></li>
              <li><a href="https://aka.ms/spfx-yeoman-teams" target="_blank" rel="noreferrer">Build for Microsoft Teams using SharePoint Framework</a></li>
              <li><a href="https://aka.ms/spfx-yeoman-viva" target="_blank" rel="noreferrer">Build for Microsoft Viva Connections using SharePoint Framework</a></li>
              <li><a href="https://aka.ms/spfx-yeoman-store" target="_blank" rel="noreferrer">Publish SharePoint Framework applications to the marketplace</a></li>
              <li><a href="https://aka.ms/spfx-yeoman-api" target="_blank" rel="noreferrer">SharePoint Framework API reference</a></li>
              <li><a href="https://aka.ms/m365pnp" target="_blank" rel="noreferrer">Microsoft 365 Developer Community</a></li>
            </ul>
          </div>
        </section> */}
      </>
    );
  }
}
