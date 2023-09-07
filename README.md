# iDig Webapp

iDig webapp serves to visualize and edit excavation data collected with the iDig app ([iDig Website](https://idig.tips/)). The data is stored on an iDig-server.

## Connection Details

First, input the connection details for the iDig-server. Required fields include:

- Server (complete URL)
- Project
- User
- Password

After entering the information, click the 'Connect' button. If the connection is successful, the webapp will:

- Retrieve the settings of the first trench in your project
- Build the user interface based on the project's fields and configurations

Your settings will be stored locally for future use, unless changed by you.

## Trench List Configuration

You may either:

- Use a combo iDig webapp and iDig-server version that automatically lists trenches
- Add the list of trenches for your project in the allTrenchesPerProject.js file as an array property under the "YourProject" object

Note: The first trench in your array should have up-to-date project preferences, as those will be the only settings used by the iDig webapp.

## Demo Version

A DEMO is available [here](https://idig.archaiodata.com/). It comes pre-configured with two demo projects (Agora, Amarynthos), each with two trenches. You can also connect this demo webapp to your own iDig-server.
