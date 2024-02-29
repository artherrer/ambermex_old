/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import BackgroundGeolocation from "react-native-background-geolocation";
const EndpointRequests = require("./src/util/requests.js");

AppRegistry.registerComponent(appName, () => App);

let HeadlessTask = async (event) => {
  let params = event.params;
  console.log('[BackgroundGeolocation HeadlessTask] -', event.name, params);

  switch (event.name) {
    case 'geofence':
      // Use await for async tasks
      if(event.action === "ENTER"){
        if(event.extras != undefined && event.extras.type != undefined && event.extras.type === 1){
          EndpointRequests.EnterBeacon({BeaconId:event.identifier, Latitude:event.location.coords.latitude, Longitude:event.location.coords.longitude, ZoneName:event.extras.codeName}, (response) => {
            console.log('[BackgroundGeolocation HeadlessTask] - ENTER BEACON ' + event.identifier);
          });
        }
      }
      else{
        if(event.extras != undefined && event.extras.type != undefined && event.extras.type === 1){
          EndpointRequests.ExitBeacon({BeaconId:event.identifier, Latitude:event.location.coords.latitude, Longitude:event.location.coords.longitude, ZoneName:event.extras.codeName}, (response) => {
            console.log('[BackgroundGeolocation HeadlessTask] - EXIT BEACON ' + event.identifier);
          });
        }
      }
      break;
  }
}

let getCurrentPosition = () => {
  return new Promise((resolve) => {
    BackgroundGeolocation.getCurrentPosition(
    {
      samples: 1,
      persist: false
    },
    (location) => {
      resolve(location);
    }, (error) => {
      resolve(error);
    });
  });
};

BackgroundGeolocation.registerHeadlessTask(HeadlessTask);
