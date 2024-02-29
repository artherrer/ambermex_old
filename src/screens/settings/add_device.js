import React, { Component } from 'react'
import { View, Text, StyleSheet, Platform, Image, Modal, Alert, Keyboard, Dimensions, TouchableOpacity, ActivityIndicator, TouchableWithoutFeedback, ActionSheetIOS } from 'react-native'
import { Icon, Button as ButtonAlt, Slider,Input } from 'react-native-elements';
import { connect } from 'react-redux';
import MapView, { AnimatedRegion, Animated } from 'react-native-maps';
const textAMBER = require('../../../assets/image/textambermex.png');
import Toast, {DURATION} from 'react-native-easy-toast';
import id from '@xmpp/id';
const cloneDeep = require('lodash/cloneDeep');
import BackgroundGeolocation from "react-native-background-geolocation";
const EndpointRequests = require("../../util/requests.js");
var haversine = require('haversine');

var { height, width } = Dimensions.get('window');
var iPhoneX = height >= 812;

class AddDevice extends Component{
  static navigationOptions = ({navigation}) => ({
    headerTitle: "Agregar Beacons"
    });

  constructor(props) {
    super(props)
    this.state = {
      openModal:false,
      latDelta:0.015,
      lonDelta:0.05,
      existingDevices:[],
      newDevices:[],
      deletedDevices:[],
      allDevices:[],
      updated:false,
      editMode:false,
      editType:0,
      zoneDiameter:0.1,
      editObject:null,
      editZone:false,
      zoneName:null,
      zoneAlias:null,
      userLocation:{
        latitude:0,
        longitude:0
      },
      addedBeacon:true,
      mapReady:false,
      editNodeFlag:false,
      loadingMap:true
    }
  }

  componentDidMount(){
    let { existingDevices } = this.state;

    let userLocation = cloneDeep(this.props.userState.Location);
    userLocation.Radius = 5000;

    EndpointRequests.GetCloseNodes(userLocation, function(response){
      if(response.zoneData != undefined && response.zoneData.length > 0){
        for(let i = 0; i < response.zoneData.length;i++){
          response.zoneData[i].existing = true;
        }

        this.setState({openModal:true, loadingMap:false, userLocation:userLocation, existingDevices:response.zoneData, allDevices:cloneDeep(response.zoneData)});
      }
      else{
        this.setState({openModal:true, loadingMap:false, userLocation:userLocation, existingDevices:[], allDevices:[]});
      }
    }.bind(this));

    /*
    this.props.chatState.GetCachedGeo(function(response){
      for(let i = 0; i < response.length;i++){
        response[i].existing = true;
      }

      existingDevices = response;
      let userLocation = cloneDeep(this.props.userState.Location);

      this.setState({openModal:true, userLocation:userLocation, existingDevices:existingDevices, allDevices:cloneDeep(existingDevices)});
    }.bind(this));
    */
  }

  setNewDevice(values){
    let { newDevices, allDevices, editType, editMode, editObject, existingDevices } = this.state;

    let newAlarm = {
      radius:200,
      longitude:values.coordinate.longitude,
      latitude:values.coordinate.latitude,
      identifier:id(),
      newDevice:true,
      extras:{
        color:'rgba(0, 0, 255, 0.5)'
      }
    };

    if(editMode){
      if(editType == 0){
        newAlarm.radius = 1000;
        newAlarm.extras.color = 'rgba(255,0,0,0.6)';
        newAlarm.extras.type = "Zone";

        this.setState({editObject:newAlarm, editZone:true});
      }
      else if(editType == 1){
        if(editObject != null){
          let distance = haversine({latitude:editObject.latitude,longitude:editObject.longitude}, {latitude:newAlarm.latitude, longitude:newAlarm.longitude}, {unit: 'meter'});

          if(distance > editObject.radius){
            alert("Agrega la zona dentro del area de cobertura nueva.");
          }
          else{
            newAlarm.extras.type = 1;
            newDevices.push(newAlarm);
            allDevices.push(newAlarm);

            this.setState({newDevices:newDevices, allDevices:allDevices, updated:true, addedBeacon:false});
          }
        }
        else{
          let insideZone = false;

          for(let i = 0; i < existingDevices.length;i++){
            if(existingDevices[i].extras.type === 0){
              let distance = haversine({latitude:existingDevices[i].latitude,longitude:existingDevices[i].longitude}, {latitude:newAlarm.latitude, longitude:newAlarm.longitude}, {unit: 'meter'});

              if(distance <= existingDevices[i].radius){
                newAlarm.zoneId = existingDevices[i].extras.zoneId;
                newAlarm.extras.type = 1;
                newDevices.push(newAlarm);
                allDevices.push(newAlarm);
                insideZone = true;
                break;
              }
            }
          }

          if(insideZone){
            this.setState({newDevices:newDevices, allDevices:allDevices, updated:true, addedBeacon:false});
          }
          else{
            alert("La zona no esta dentro de alguna colonia existente.");
          }
        }
      }
      else{
        if(editObject != null){
          let insideZone = false;

          for(let i = 0; i < newDevices.length;i++){
            if(newDevices[i].extras.type === 1){
              let distance = haversine({latitude:newDevices[i].latitude,longitude:newDevices[i].longitude}, {latitude:newAlarm.latitude, longitude:newAlarm.longitude}, {unit: 'meter'});

              if(distance <= newDevices[i].radius){
                newAlarm.extras.type = 2;
                newAlarm.radius = 50;
                newAlarm.zoneId = newDevices[i].identifier;
                newDevices.push(newAlarm);
                allDevices.push(newAlarm);
                insideZone = true;
                break;
              }
            }
          }

          if(insideZone){
            this.setState({newDevices:newDevices, allDevices:allDevices, updated:true, addedBeacon:false});
          }
          else{
            alert("El nodo no esta dentro de alguna zona existente.");
          }
        }
        else{
          let insideZone = false;

          for(let i = 0; i < allDevices.length;i++){
            if(allDevices[i].extras.type === 1){
              let distance = haversine({latitude:allDevices[i].latitude,longitude:allDevices[i].longitude}, {latitude:newAlarm.latitude, longitude:newAlarm.longitude}, {unit: 'meter'});

              if(distance <= allDevices[i].radius){
                newAlarm.extras.type = 2;
                newAlarm.radius = 50;
                newAlarm.zoneId = allDevices[i].identifier;
                newDevices.push(newAlarm);
                allDevices.push(newAlarm);
                insideZone = true;
                break;
              }
            }
          }

          if(insideZone){
            this.setState({newDevices:newDevices, allDevices:allDevices, updated:true, addedBeacon:false});
          }
          else{
            alert("El nodo no esta dentro de alguna zona existente.");
          }
        }
      }
    }
  }

  deleteDeviceOptions(marker){
    const {editMode, editType, editObject, allDevices, existingDevices} = this.state;

    let title;
    let message;

    let indexDevice = allDevices.findIndex(n => n.identifier === marker.id);

    if(editMode){
      if(indexDevice < 0){
        options = ['Cancelar', 'Actualizar información', 'Borrar Zona'];

        ActionSheetIOS.showActionSheetWithOptions(
          {
            options: options,
            destructiveButtonIndex: 2,
            cancelButtonIndex: 0
          },
          (buttonIndex) => {
            if (buttonIndex === 1) {
              this.setState({editZone:true,zoneName:editObject.name,zoneAlias:editObject.codeName});
            }
            else if(buttonIndex === 2){
              this.deleteDevice(marker.id, true);
              this.setState({newDevices:[], allDevices:cloneDeep(existingDevices)})
            }
          }
        );
      }
      else{
        let existingObject = allDevices[indexDevice];

        if(existingObject.extras.type === 1){
          title = "Eliminar Zona?";
          message = "La zona sera eliminada del mapa.";

          Alert.alert(
           title,
           message,
           [
             {text: 'Eliminar', onPress: () => this.deleteDevice(marker.id)},
             {text: 'Cancelar', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
           ],
           { cancelable: false }
         )
       }
       else if(existingObject.extras.type === 2){
         title = "Eliminar Nodo?";
         message = "El nodo sera eliminado del mapa.";

         Alert.alert(
          title,
          message,
          [
            {text: 'Eliminar', onPress: () => this.deleteDevice(marker.id)},
            {text: 'Cancelar', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
          ],
          { cancelable: false }
        )
       }
      }
    }
    else{
      if(indexDevice >= 0){
        let existingObject = allDevices[indexDevice];

        if(existingObject.extras.type === 1){
          Alert.alert(
           "Eliminar zona?",
           "La zona sera eliminada del mapa.",
           [
             {text: 'Eliminar', onPress: () => this.deleteDevice(marker.id)},
             {text: 'Cancelar', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
           ],
           { cancelable: false }
         )
        }
        else if(existingObject.extras.type === 2){
          Alert.alert(
            "Eliminar nodo?",
            "El nodo sera eliminado del mapa.",
           [
             {text: 'Eliminar', onPress: () => this.deleteDevice(marker.id)},
             {text: 'Cancelar', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
           ],
           { cancelable: false }
         )
        }
      }
    }
  }

  deleteDevice(id, isZone){
    let { existingDevices, newDevices, deletedDevices, allDevices, editMode, editType } = this.state;

    if(isZone){
      this.setState({editObject:null});
      return true;
    }

    let index = existingDevices.findIndex(n => n.identifier === id);

    if(index > -1){
      let device = existingDevices[index];
      device.deleted = true;
      device.zoneId = device.extras.zoneId;
      device.area = device.extras.codeName;

      deletedDevices.push(device);
      existingDevices.splice(index, 1);

      index = allDevices.findIndex(n => n.identifier === id);

      if(index > -1){
        allDevices[index].deleted = true;
      }

      this.setState({existingDevices:existingDevices, deletedDevices:deletedDevices,allDevices:allDevices, updated:true});
      return true;
    }

    index = newDevices.findIndex(n => n.identifier === id);

    if(index > -1){
      newDevices.splice(index, 1);
      index = allDevices.findIndex(n => n.identifier === id);

      allDevices.splice(index, 1);

      this.setState({newDevices:newDevices,allDevices:allDevices, addedBeacon: newDevices.length == 0 ? true : false});
    }

    return false;
  }

  addAndRemoveLocal(newDevices, deletedDevices, cb){
    for(let i = 0; i < deletedDevices.length;i++){
      if(deletedDevices[i].identifier != undefined){
        BackgroundGeolocation.removeGeofence(deletedDevices[i].identifier.toUpperCase()).then((success) => {
          console.log("[removeGeofence] success");
        }).catch((error) => {
          console.log("[removeGeofence] FAILURE: ", error);
        });
      }
      else{
        BackgroundGeolocation.removeGeofence(deletedDevices[i].toUpperCase()).then((success) => {
          console.log("[removeGeofence] success");
        }).catch((error) => {
          console.log("[removeGeofence] FAILURE: ", error);
        });
      }
    }

    if(newDevices.length > 0){
      BackgroundGeolocation.addGeofences(newDevices).then((success) => {
      }).catch((error) => {
        console.log("[addGeofence] FAILURE: ", error);
      });
    }

    cb(true);
  }

  setValues(values){
    const { mapReady } = this.state;

    if(!mapReady){
      setTimeout(function(){
        this.setState({latDelta:values.latitudeDelta, lonDelta:values.longitudeDelta, mapReady:true})
      }.bind(this),100);
    }
    else{
      this.setState({latDelta:values.latitudeDelta, lonDelta:values.longitudeDelta, userLocation:values});
    }
  }

  editModeGeozone(){
    this.setState({editMode:true, editType:0});
    this.refs.locationToast.show('Presiona en el mapa para agregar una nueva colonia.', 10000);
  }

  editModeBeacon(){
    let { editObject } = this.state;

    this.setState({editMode:true, editType:1});

    if(editObject != undefined){
      this.refs.locationToast.show('Presiona dentro de la colonia para agregar una nueva zona.', 10000);
    }
    else{
      this.refs.locationToast.show('Presiona dentro de una colonia existente para agregar una nueva zona.', 10000);
    }
  }

  editModeNode(direct){
    let { editObject } = this.state;

    this.setState({editMode:true, editType:2, editNodeFlag:direct});

    if(editObject != undefined){
      this.refs.locationToast.show('Presiona dentro de alguna zona de cobertura para agregar un nodo nuevo.', 10000);
    }
    else{
      this.refs.locationToast.show('Presiona dentro de alguna zona de cobertura existente para agregar un nodo nuevo.', 10000);
    }
  }

  addInfoToZone(){
    let { editObject, zoneName, zoneAlias } = this.state;

    editObject.codeName = zoneAlias;
    editObject.name = zoneName;

    this.setState({editObject:editObject, zoneName:null, zoneAlias:null, editZone:false});
  }

  updateRadiusZone(value){
    let { editObject, newDevices } = this.state;

    editObject.radius = parseInt(value * 10000);

    this.setState({zoneDiameter:value, editObject:editObject});
  }

  addZone(){
    let { editObject, newDevices, deletedDevices } = this.state;

    this.setState({uploading:true});

    if(editObject.name == undefined || editObject.codeName == undefined){
      alert("Agrega un nombre y alias a la nueva zona; Presiona en el pin de la zona para más opciones.");
      this.setState({uploading:false});
      return false;
    }
    else{

      let beaconsInZone = [];

      newDevices = newDevices.sort((a, b) => { return a.extras.type - b.extras.type});

      for(let i = 0;i < newDevices.length;i++){
        let distance = haversine({latitude:editObject.latitude,longitude:editObject.longitude}, {latitude:newDevices[i].latitude, longitude:newDevices[i].longitude}, {unit: 'meter'});

        if(distance <= editObject.radius){
          if(newDevices[i].extras.type === 1){
            newDevices[i].Nodes = [];
            beaconsInZone.push(newDevices[i]);
          }
          else if(newDevices[i].extras.type === 2){
            let indexZone = beaconsInZone.findIndex(x => x.identifier === newDevices[i].zoneId);

            if(indexZone >= 0){
              beaconsInZone[indexZone].Nodes.push(newDevices[i]);
            }
          }
        }
      }

      let zoneModel = {
        CodeName: editObject.codeName,
        DisplayName:editObject.name,
        NewZones:beaconsInZone,
        Radius:editObject.radius,
        Coordinate:{
          Latitude:editObject.latitude,
          Longitude:editObject.longitude
        }
      };

      EndpointRequests.AddSupportedZone(zoneModel, function(response){
        if(response.message === "Ok" && response.devices.length > 0){
          //add zone locally
          this.addAndRemoveLocal(response.devices, deletedDevices, function(deleted){
            this.props.chatState.GetCachedGeo(function(newResponse){

              this.props.dispatch({type:'UPDATE_GEOFENCE', Points:newResponse});

              this.props.navigation.pop();
              setTimeout(function(){
                this.setState({uploading:false});
                if(beaconsInZone.length == 0){
                  alert("La zona geografica a sido agregada correctamente.");
                }
                else{
                  alert("Los dispositivos han sido actualizados correctamente.");
                }
              }.bind(this),200);
            }.bind(this));
          }.bind(this));
        }
        else{
          this.setState({uploading:false});
          alert("error");
        }
      }.bind(this));

    }
  }

  groupNodes(devices){
    let { editObject, allDevices } = this.state;

    let newDevices = [];

    if(editObject == null){
      for(let i = 0; i < devices.length;i++){
        let newObject;

        if(devices[i].extras.type === 1){
          newObject = {
            ZoneId: devices[i].zoneId,
            Identifier:devices[i].identifier,
            Latitude:devices[i].latitude,
            Longitude:devices[i].longitude,
            Zone:devices[i],
            Nodes:[],
            Existing:false
          };

          newDevices.push(newObject);
        }
        else if(devices[i].extras.type === 2){
          let index = newDevices.findIndex(x => x.Identifier === devices[i].zoneId);

          if(index >= 0){
            newDevices[index].Nodes.push(devices[i]);
          }
          else{
            index = allDevices.findIndex(x => x.identifier === devices[i].zoneId);

            if(index >= 0){
              newObject = {
                ZoneId: allDevices[index].extras.zoneId,
                Identifier:allDevices[index].identifier,
                Zone:allDevices[index],
                Latitude:allDevices[index].latitude,
                Longitude:allDevices[index].longitude,
                Nodes:[devices[i]],
                Existing:true
              };

              newDevices.push(newObject);
            }
          }
        }
      }
    }

    console.log(newDevices);
    return newDevices;
  }

  addBeacons(){
    let { existingDevices, allDevices, newDevices } = this.state;

    this.setState({uploading:true});

    newDevices = newDevices.sort((a, b) => { return a.extras.type - b.extras.type});

    let newDevices2 = this.groupNodes(newDevices);

    let groupedData = this.groupBy(newDevices2, "ZoneId");

    let modelData = [];

    for(let i = 0;i < groupedData.length;i++){
      let model = {
        NeighborhoodId: groupedData[i][0].ZoneId,
        Zones:groupedData[i]
      };

      modelData.push(model);
    }

    console.log(modelData);

    EndpointRequests.AddZones(modelData, function(response){
      if(response.message === "Ok" && response.devices.length > 0){
        //add zone locally
        this.addAndRemoveLocal(response.devices, [], function(deleted){
          this.props.chatState.GetCachedGeo(function(newResponse){

            this.props.dispatch({type:'UPDATE_GEOFENCE', Points:newResponse});

            this.props.navigation.pop();
            this.setState({uploading:false});

            setTimeout(function(){
              alert("Los dispositivos han sido actualizados correctamente.");
            }.bind(this),200);
          }.bind(this));
        }.bind(this));
      }
      else{
        alert("error");
        this.setState({uploading:false});
      }
    }.bind(this));

  }

  removeBeacons(){
    let { deletedDevices } = this.state;

    this.setState({uploading:true, updated:false});

    EndpointRequests.DeleteBeacons(deletedDevices, function(response){
      if(response.message === "Ok"){
        //add zone locally
        this.addAndRemoveLocal([], deletedDevices, function(deleted){
          this.props.chatState.GetCachedGeo(function(newResponse){

            this.props.dispatch({type:'UPDATE_GEOFENCE', Points:newResponse});

            this.props.navigation.pop();
            this.setState({uploading:false,updated:true});

            setTimeout(function(){
              alert("Los dispositivos han sido actualizados correctamente.");
            }.bind(this),200);
          }.bind(this));
        }.bind(this));
      }
      else if(response.message != "Ok" && response.deletedDevices.length > 0){
        this.addAndRemoveLocal([], response.deletedDevices, function(deleted){
          this.props.chatState.GetCachedGeo(function(newResponse){

            this.props.dispatch({type:'UPDATE_GEOFENCE', Points:newResponse});

            this.props.navigation.pop();
            this.setState({uploading:false,updated:true});

            setTimeout(function(){
              alert("Los dispositivos han sido actualizados correctamente.");
            }.bind(this),200);
          }.bind(this));
        }.bind(this));
      }
      else{
        alert("Hubo un error en la peticion.");
        this.setState({uploading:false,updated:true});
      }
    }.bind(this));
  }

  groupBy(collection, property) {
    var i = 0, val, index,
        values = [], result = [];
    for (; i < collection.length; i++) {
        val = collection[i][property];
        index = values.indexOf(val);
        if (index > -1)
            result[index].push(collection[i]);
        else {
            values.push(val);
            result.push([collection[i]]);
        }
    }
    return result;
  }

  removeNodes(){
    let { newDevices, allDevices } = this.state;

    let newDevicesCopy = [];
    let allDevicesCopy = [];

    try{
      for(let i = 0;i < newDevices.length;i++){
        if(newDevices[i].extras.type !== 2){
          newDevicesCopy.push(newDevices[i])
        }
      }
    }
    catch(error){
      console.log(error);
    }

    try{
      for(let k = 0;k < allDevices.length;k++){
        if(allDevices[k].newDevice && allDevices[k].extras.type === 2){
          //
        }
        else{
          allDevicesCopy.push(allDevices[k]);
        }
      }
    }
    catch(error){
      console.log(error);
    }

    this.setState({newDevices:newDevicesCopy, allDevices:allDevicesCopy, editMode:true,editType:1, editNodeFlag:false});
  }

  getCircleComponent(point, index){
    if(point.extras.imaginary){
      if(point.extras.type == 0){
        return <MapView.Circle
                key={"circle" + index}
                strokeColor={"rgba(144,238,144,0.5)"}
                fillColor={"rgba(144,238,144,0.5)"}
                strokeWidth={2}
                radius={point.radius}
                center={{latitude:point != null ? point.latitude : 0,longitude:point != null ? point.longitude : 0}}
                />
      }
    }
    else{
      if(point.extras.type == 0){
        return <MapView.Circle
                key={"circle" + index}
                strokeColor={"rgba(144,238,144,0.5)"}
                fillColor={"rgba(144,238,144,0.5)"}
                strokeWidth={2}
                radius={point.radius}
                center={{latitude:point != null ? point.latitude : 0,longitude:point != null ? point.longitude : 0}}
                />
      }
      else if(point.extras.type == 1){
        return <MapView.Circle
                key={"circle" + index}
                strokeColor={point.deleted ? 'rgba(211,211,211, 0.5)' : (point.newDevice ? 'rgba(0, 0, 255, 0.5)' : 'rgba(255, 0, 0, 0.5)')}
                fillColor={point.deleted ? 'rgba(211,211,211, 0.5)' : (point.newDevice ? 'rgba(0, 0, 255, 0.5)' : 'rgba(255, 0, 0, 0.5)')}
                strokeWidth={2}
                radius={point.radius}
                center={{latitude:point != null ? point.latitude : 0,longitude:point != null ? point.longitude : 0}}
                />
      }
      else if(point.extras.type == 2){
        return <MapView.Circle
                key={"circle" + index}
                strokeColor={point.deleted ? 'rgba(211,211,211, 0.5)' : (point.newDevice ? 'rgba(0, 0, 255, 0.5)' : 'rgba(255,215,0, 0.5)')}
                fillColor={point.deleted ? 'rgba(211,211,211, 0.5)' : (point.newDevice ? 'rgba(0, 0, 255, 0.5)' : 'rgba(255,215,0, 0.5)')}
                strokeWidth={2}
                radius={point.radius}
                center={{latitude:point != null ? point.latitude : 0,longitude:point != null ? point.longitude : 0}}
                />
      }
      else{
        return <MapView.Circle
                key={"circle" + index}
                strokeColor={point.identifier === 'area' ? 'transparent' : 'rgba(255, 0, 0, 0.5)'}
                fillColor={point.identifier === 'area' ? 'transparent' : 'rgba(255, 0, 0, 0.5)'}
                strokeWidth={2}
                radius={point.radius}
                center={{latitude:point != null ? point.latitude : 0,longitude:point != null ? point.longitude : 0}}
                />
      }
    }
  }

  getMarkerComponent(point, index){
    if(point.extras.imaginary){
      if(point.extras.type == 0){
        return <MapView.Marker
                key={point.identifier}
                pinColor={"rgb(144,238,144)"}
                identifier={point.identifier}
                tracksViewChanges={false}
                coordinate={{latitude:point != null ? point.latitude : 0,longitude:point != null ? point.longitude : 0}}
                title={point.extras.displayName != undefined ? point.extras.displayName : "Area"}/>
      }
    }
    else{
      if(point.extras.type == 1){
        return <MapView.Marker
                pinColor={point.newDevice ? "rgba(0, 0, 255, 0.5)" : (point.deleted ? "lightgray" : "red")}
                key={point.identifier}
                identifier={point.identifier}
                tracksViewChanges={false}
                coordinate={{latitude:point != null ? point.latitude : 0,longitude:point != null ? point.longitude : 0}}
                title={point.newDevice ? "Nueva Zona" : "Zona Existente"} />
      }
      else if(point.extras.type == 2){
        return <MapView.Marker
                key={point.identifier}
                identifier={point.identifier}
                tracksViewChanges={false}
                coordinate={{latitude:point != null ? point.latitude : 0,longitude:point != null ? point.longitude : 0}}
                title={point.newDevice ? "Nuevo Nodo" : "Nodo Existente"}>
                  {
                    point.deleted ?
                      <Image
                        source={require('../../../assets/image/alert_pin_gray.png')}
                        style={{ width: iPhoneX ? 25 : 20, height: iPhoneX ? 25 : 20, resizeMode: "contain" }}
                        />
                      :
                      <Image
                        source={require('../../../assets/image/alert_pin.png')}
                        style={{ width: iPhoneX ? 25 : 20, height: iPhoneX ? 25 : 20, resizeMode: "contain" }}
                        />
                  }
                </MapView.Marker>
      }
    }
  }

  getOptionsComponent(editMode, editType, editNodeFlag){
    if(editMode){
      if(editType == 0){
        return <View style={{height:(height/2) - 120}}>
                <Text numberOfLines={3} style={{textAlign:'center', padding:10, marginBottom:0,paddingBottom:0, fontSize:17, color:'black', fontWeight:'bold'}}>Agregar Nueva Colonia</Text>
                <View style={{ flex: 1, alignItems: 'stretch', padding:20, paddingTop:10, justifyContent: 'flex-start'}}>
                  <Slider
                    step={0.05}
                    disabled={this.state.editObject != undefined ? false : true}
                    value={this.state.zoneDiameter}
                    onValueChange={(value) => this.updateRadiusZone(value)}
                  />
                  <Text>Diametro: {parseInt(this.state.zoneDiameter * 10000)}m.</Text>
                  <ButtonAlt loading={this.state.uploading} title="Siguiente" borderRadius={5} buttonStyle={{width:150, backgroundColor:'black',alignSelf:'center'}} backgroundColor="black"
                  onPress={() => this.editModeBeacon()} style={{alignSelf:'center', marginTop:15}} />
                  <ButtonAlt title="Atras" loading={this.state.uploading} disabled={this.state.uploading}  borderRadius={5} buttonStyle={{width:150, backgroundColor:'blue',alignSelf:'center', marginTop:15}} backgroundColor="blue"
                  onPress={() => this.setState({editMode:false,editType:0, editObject:null, allDevices:cloneDeep(this.state.existingDevices), newDevices:[]})} style={{alignSelf:'center', marginTop:15}} />
                </View>
              </View>
      }
      else if(editType == 1){
        return <View style={{height:(height/2) - 120}}>
                <Text numberOfLines={3} style={{textAlign:'center', padding:10, marginBottom:0,paddingBottom:0, fontSize:17, color:'black', fontWeight:'bold'}}>Agregar Nueva Zona</Text>
                <View style={{ flex: 1, alignItems: 'stretch', padding:20, justifyContent: 'flex-start'}}>
                  <Text style={{color:'lightgray', textAlign:'center'}}>{this.state.editObject != null ? "Presiona dentro de la nueva colonia agregada." : "Presiona dentro de una colonia existente."}</Text>
                  <ButtonAlt loading={this.state.uploading} disabled={this.state.newDevices.length == 0 || this.state.uploading} title="Siguiente" borderRadius={5} buttonStyle={{marginTop:15,alignSelf:'center', width:150, backgroundColor:'black'}} backgroundColor="black"
                  onPress={() => this.editModeNode()} style={{alignSelf:'center', marginTop:25}} />
                  <ButtonAlt title="Atras" loading={this.state.uploading} disabled={this.state.uploading}  borderRadius={5} buttonStyle={{alignSelf:'center', width:150, backgroundColor:'blue', marginTop:15}} backgroundColor="blue"
                  onPress={() => {this.state.editObject != null ? this.setState({editMode:true,editType:0,newDevices:[],allDevices:cloneDeep(this.state.existingDevices)}) : this.setState({editMode:false,editType:0, newDevices:[],allDevices:cloneDeep(this.state.existingDevices)}) }} style={{alignSelf:'center', marginTop:15}} />
                </View>
              </View>
      }
      else{
        return <View style={{height:(height/2) - 120}}>
                <Text numberOfLines={3} style={{textAlign:'center', padding:10, marginBottom:0,paddingBottom:0, fontSize:17, color:'black', fontWeight:'bold'}}>Agregar Nuevo Nodo</Text>
                <View style={{ flex: 1, alignItems: 'stretch', padding:20, justifyContent: 'flex-start'}}>
                  <Text style={{color:'lightgray', textAlign:'center'}}>{this.state.editObject != null ? "Presiona dentro de una de las nuevas zonas agregadas." : "Presiona dentro de una zona geografica existente."}</Text>
                  <ButtonAlt loading={this.state.uploading} disabled={this.state.addedBeacon || this.state.uploading} title={"Enviar"} borderRadius={5} buttonStyle={{marginTop:15,alignSelf:'center', width:150, backgroundColor:'black'}} backgroundColor="black"
                  onPress={() => {this.state.editObject != undefined ? this.addZone() : this.addBeacons()}} style={{alignSelf:'center', marginTop:25}} />
                  <ButtonAlt loading={this.state.uploading} disabled={this.state.uploading} title="Atras" borderRadius={5} buttonStyle={{alignSelf:'center', width:150, backgroundColor:'blue', marginTop:15}} backgroundColor="blue"
                  onPress={() => {this.state.editObject != null || !editNodeFlag ? this.removeNodes() : this.setState({editMode:false, newDevices:[],editType:0,allDevices:cloneDeep(this.state.existingDevices)}) }} style={{alignSelf:'center', marginTop:15}} />
                </View>
              </View>
      }
    }
    else{
      return <View style={{height:(height/2) - 120}}>
              <Text numberOfLines={3} style={{textAlign:'center', padding:10, marginBottom:10,paddingBottom:0, fontSize:17, color:'black', fontWeight:'bold'}}>Alarmas Existentes</Text>
              <View style={{height:((height/2) - 90)/3, flexDirection:'row', marginTop:5, justifyContent:'center'}}>
                <View style={{flexDirection:'column',flex:.3333, justifyContent:'center'}}>
                  <TouchableOpacity onPress={() => this.editModeGeozone()} style={{height:60,width:60, borderRadius:30, backgroundColor:'red', alignSelf:'center', justifyContent:'center'}}>
                    <Icon name="map" type="material" size={30} color="white" style={{textAlign:'center'}} />
                  </TouchableOpacity>
                  <Text style={{textAlign:'center', marginTop:10}}>Agregar Colonia</Text>
                </View>
                <View style={{flexDirection:'column',flex:.3333, justifyContent:'center'}}>
                  <TouchableOpacity onPress={() => this.editModeBeacon()} style={{height:60,width:60, borderRadius:30, backgroundColor:'blue', alignSelf:'center', justifyContent:'center'}}>
                    <Icon name="map-marker-circle" type="material-community" size={45} color="white" style={{textAlign:'center', marginTop:5}} />
                  </TouchableOpacity>
                  <Text style={{textAlign:'center', marginTop:10}}>Agregar Zona</Text>
                </View>
                <View style={{flexDirection:'column',flex:.3333, justifyContent:'center'}}>
                  <TouchableOpacity onPress={() => this.editModeNode(true)} style={{height:60,width:60, borderRadius:30, backgroundColor:'black', alignSelf:'center', justifyContent:'center'}}>
                    <Image
                      source={require('../../../assets/image/alert_pin.png')}
                      style={{ width: iPhoneX ? 35 : 20, height: iPhoneX ? 35 : 20, resizeMode: "contain", alignSelf:'center' }}
                      />
                  </TouchableOpacity>
                  <Text style={{textAlign:'center', marginTop:10}}>Agregar Nodo</Text>
                </View>
              </View>
              <ButtonAlt loading={this.state.uploading} disabled={this.state.deletedDevices.length == 0} title="Actualizar" borderRadius={5} buttonStyle={{alignSelf:'center', width:150, backgroundColor:'black', marginTop:20}} backgroundColor="black"
              onPress={() => this.removeBeacons()} style={{alignSelf:'center', marginTop:10}} />
            </View>
    }
  }

  render(){
    const { newDevices, editType, editMode, editObject, userLocation, editNodeFlag, mapReady } = this.state;

    return (
      <View>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={{height:iPhoneX ? height - 20 : height, width:width, padding:0,borderRadius:0, backgroundColor:"white"}}>
        <MapView userLocationAnnotationTitle="Mi ubicación" showsUserLocation={true} style={{width: width, height: height/2, alignSelf:'center'}} initialRegion={{
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: this.state.latDelta,
          longitudeDelta: this.state.lonDelta
          }}
          onRegionChangeComplete={(values) => { this.setValues(values)} }
          onLongPress={(event) => {this.setNewDevice(event.nativeEvent)}}
          onMarkerPress={(event) => this.deleteDeviceOptions(event.nativeEvent)}
          region={{
          latitude: userLocation.latitude,
          longitude:userLocation.longitude,
          latitudeDelta: this.state.latDelta,
          longitudeDelta: this.state.lonDelta
          }}
          >
          {this.state.editObject != undefined ?
            <MapView.Circle
              key={"circleedit"}
              strokeColor={this.state.editObject.extras.color}
              fillColor={this.state.editObject.extras.color}
              strokeWidth={2}
              radius={parseInt(this.state.zoneDiameter * 10000)}
              center={{latitude:this.state.editObject != null ? this.state.editObject.latitude : 0,longitude:this.state.editObject != null ? this.state.editObject.longitude : 0}}
              />
              :
            null
          }
          {this.state.editObject != undefined ?
            <MapView.Marker
              key={"markeredit"}
              pinColor={"red"}
              key={this.state.editObject.identifier}
              identifier={"editZone"}
              tracksViewChanges={mapReady}
              title={"Nueva Zona"}
              coordinate={{latitude:this.state.editObject != null ? this.state.editObject.latitude : 0,longitude:this.state.editObject != null ? this.state.editObject.longitude : 0}}
              />
              :
            null
          }
          {
            this.state.allDevices.map((point, index) => (
              this.getCircleComponent(point,index)
            ))
          }
          {
            this.state.allDevices.map((point, index) => (
              this.getMarkerComponent(point, index)
            ))
          }
        </MapView>
        <View style={{height:(height/2) - 90, padding:15, paddingTop:5, justifyContent:'center'}}>
          { this.getOptionsComponent(editMode, editType, editNodeFlag) }
        </View>
      </View>
      </TouchableWithoutFeedback>
      <Modal
      animationType="fade"
      transparent={true}
      backdropPressToClose={false}
      backdrop={true}
      onRequestClose={() => {
        this.setState({editZone:false,newContactName:"",newContactPhone:"", incorrect:true})
      }}
      visible={this.state.editZone}>
      <View style={{
        backgroundColor: '#00000080',
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'}}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={{alignSelf: 'center', borderRadius:10, width:width - 40,paddingTop:5, paddingBottom:10, backgroundColor:"white",marginTop:0}}>
        <TouchableOpacity onPress={() => this.setState({editZone:false,newContactName:"",newContactPhone:"", incorrect:true})} style={{height:50,width:50,alignSelf:'flex-end', justifyContent:'center'}}>
        <Icon type="ionicon" name="ios-close" size={40} color="black" />
        </TouchableOpacity>
        <View style={{paddingLeft:20, paddingRight:20}}>
          <Input maxFontSizeMultiplier={1.25} placeholderTextColor="gray"
          placeholder="Nombre a mostrar" inputStyle={{color:'black', fontSize:20}} autoCapitalize="words" value={this.state.zoneName} onChangeText={(text) => {
            this.setState({zoneName:text})}}/>
          <View style={{height:15}} />
          <Input maxFontSizeMultiplier={1.25} placeholderTextColor="gray"
          placeholder="Alias" inputStyle={{color:'black', fontSize:20}} autoCapitalize="words" value={this.state.zoneAlias} onChangeText={(text) => {
            this.setState({zoneAlias:text})}}/>
          <ButtonAlt
          buttonStyle={{alignSelf:'center'}}
          backgroundColor="#1DA1F2"
          onPress={() => this.addInfoToZone()}
          title='Agregar' style={{marginTop:20, marginBottom:10}} />
      </View>
      </View>
      </TouchableWithoutFeedback>
      </View>
      </Modal>
      {this.state.loadingMap ?
        <ActivityIndicator size="large" color="black" style={{alignSelf:'center', position:'absolute', top:height/4}} />
        :
        null
      }
      <Toast ref="locationToast" positionValue={height - 50} style={{backgroundColor:'black', marginLeft:15, marginRight:15}}/>
      </View>
          )
        }
      }

      let AddDeviceContainer = connect(state => ({ clientState: state.clientState, chatState: state.chatState, userState: state.userState }))(AddDevice);
      export default AddDeviceContainer;
