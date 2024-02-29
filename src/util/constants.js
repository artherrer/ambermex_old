import { Dimensions } from 'react-native'
import RNConfigReader from 'react-native-config-reader';
const SAFEGUARD = require('../../assets/image/SAFEGUARD.png');

export const SIZE_SCREEN = Dimensions.get('window')

export const STATUS_BAR_COLOR = 'white'

export const BTN_TYPE = {
  DIALOG: 1,
  CONTACTS: 2,
  CREATE_GROUP: 3,
  PERSONAL_ALERT: 4,
}

export const MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sept", "Oct", "Nov", "Dic"];

export const DIALOG_TYPE = {
  PRIVATE: 3,
  GROUP: 2,
  BROADCAST: 1,
  PUBLIC_CHANNEL: 4
}

console.warn(RNConfigReader);

export const APP_INFO = {
  GROUP_NAME:  RNConfigReader.Group_name,
  ONE_SIGNAL_APP_ID: RNConfigReader.OneSignalAppId,
  UPLOAD_URL: RNConfigReader.Upload_url,
  FILE_PRESET:  RNConfigReader.File_preset,
  PICTURE_PRESET: RNConfigReader.Picture_preset,
  VIDEO_PRESET: RNConfigReader.Video_preset,
  THUMBNAIL_PRESET:  RNConfigReader.Thumbnail_preset
}

export const URL_SERVER = {
  URL:  RNConfigReader.XMPP_URL,
  DOMAIN: RNConfigReader.DOMAIN,
  CONFERENCE: RNConfigReader.CONFERENCE
}

export const PROVIDERS = [
  {
    "Name":"Safeguard MX",
    "Logo":SAFEGUARD,
    "Page":"https://safeguardmx.com/",
    "State": 22
  },
  {
    "Name":"Safeguard MX",
    "Logo":SAFEGUARD,
    "Page":"https://safeguardmx.com/",
    "State":2
  }
]

/*
URL:  "alertajabberdev.westus2.cloudapp.azure.com:7443",
DOMAIN: "alertajabberdev.westus2.cloudapp.azure.com",
CONFERENCE: "conference.alertajabberdev.westus2.cloudapp.azure.com"
*/
