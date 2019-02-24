import React, { Component } from "react";
import {
  StyleSheet,
  View,
  Image,
  ActivityIndicator,
  Linking,
  Platform,
  Alert
} from "react-native";
import MapView, { Polyline, Marker } from "react-native-maps";
import BottomButton from "../components/BottomButton";
import apiKey from "../google_api_key";
import PolyLine from "@mapbox/polyline";
import socketIO from "socket.io-client";
import BackgroundGeolocation from "react-native-mauron85-background-geolocation";

export default class Driver extends Component {
  constructor(props) {
    super(props);
    this.state = {
      latitude: null,
      longitude: null,
      destination: "",
      predictions: [],
      pointCoords: [],
      lookingForPassengers: false
    };
    this.acceptPassengerRequest = this.acceptPassengerRequest.bind(this);
    this.findPassengers = this.findPassengers.bind(this);
    this.socket = null;
  }

  componentWillUnmount() {
    navigator.geolocation.clearWatch(this.watchId);
  }

  componentDidMount() {
    //Get current location and set initial region to this
    this.watchId = navigator.geolocation.watchPosition(
      position => {
        this.setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      error => console.log(error),
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 20000 }
    );
    BackgroundGeolocation.configure({
      desiredAccuracy: BackgroundGeolocation.HIGH_ACCURACY,
      stationaryRadius: 50,
      distanceFilter: 50,
      debug: false,
      startOnBoot: false,
      stopOnTerminate: true,
      locationProvider: BackgroundGeolocation.ACTIVITY_PROVIDER,
      interval: 10000,
      fastestInterval: 5000,
      activitiesInterval: 10000,
      stopOnStillActivity: false
    });

    BackgroundGeolocation.on("authorization", status => {
      console.log(
        "[INFO] BackgroundGeolocation authorization status: " + status
      );
      if (status !== BackgroundGeolocation.AUTHORIZED) {
        // we need to set delay or otherwise alert may not be shown
        setTimeout(
          () =>
            Alert.alert(
              "App requires location tracking permission",
              "Would you like to open app settings?",
              [
                {
                  text: "Yes",
                  onPress: () => BackgroundGeolocation.showAppSettings()
                },
                {
                  text: "No",
                  onPress: () => console.log("No Pressed"),
                  style: "cancel"
                }
              ]
            ),
          1000
        );
      }
    });
  }

  async getRouteDirections(destinationPlaceId) {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${
          this.state.latitude
        },${
          this.state.longitude
        }&destination=place_id:${destinationPlaceId}&key=${apiKey}`
      );
      const json = await response.json();
      console.log(json);
      const points = PolyLine.decode(json.routes[0].overview_polyline.points);
      const pointCoords = points.map(point => {
        return { latitude: point[0], longitude: point[1] };
      });
      this.setState({
        pointCoords,
        routeResponse: json
      });
      this.map.fitToCoordinates(pointCoords, {
        edgePadding: { top: 20, bottom: 20, left: 20, right: 20 }
      });
    } catch (error) {
      console.error(error);
    }
  }

  findPassengers() {
    if (!this.state.lookingForPassengers) {
      this.setState({ lookingForPassengers: true });

      console.log(this.state.lookingForPassengers);

      this.socket = socketIO.connect("http://192.168.0.27:3000");

      this.socket.on("connect", () => {
        this.socket.emit("passengerRequest");
      });

      this.socket.on("taxiRequest", routeResponse => {
        console.log(routeResponse);
        this.setState({
          lookingForPassengers: false,
          passengerFound: true,
          routeResponse
        });
        this.getRouteDirections(routeResponse.geocoded_waypoints[0].place_id);
      });
    }
  }

  acceptPassengerRequest() {
    const passengerLocation = this.state.pointCoords[
      this.state.pointCoords.length - 1
    ];

    BackgroundGeolocation.on("location", location => {
      //Send driver location to passenger
      this.socket.emit("driverLocation", {
        latitude: location.latitude,
        longitude: location.longitude
      });
    });

    BackgroundGeolocation.checkStatus(status => {
      // you don't need to check status before start (this is just the example)
      if (!status.isRunning) {
        BackgroundGeolocation.start(); //triggers start on start event
      }
    });

    if (Platform.OS === "ios") {
      Linking.openURL(
        `http://maps.apple.com/?daddr=${passengerLocation.latitude},${
          passengerLocation.longitude
        }`
      );
    } else {
      Linking.openURL(
        `htttps://www.google.com/dir/?api=1&destination=${
          passengerLocation.latitude
        },${passengerLocation.longitude}`
      );
    }
  }

  render() {
    let endMarker = null;
    let startMarker = null;
    let findingPassengerActIndicator = null;
    let passengerSearchText = "FIND PASSENGERS 👥";
    let bottomButtonFunction = this.findPassengers;

    if (!this.state.latitude) return null;

    if (this.state.lookingForPassengers) {
      passengerSearchText = "FINDING PASSENGERS...";
      findingPassengerActIndicator = (
        <ActivityIndicator
          size="large"
          animating={this.state.lookingForPassengers}
        />
      );
    }

    if (this.state.passengerFound) {
      passengerSearchText = "FOUND PASSENGER! ACCEPT RIDE?";
      bottomButtonFunction = this.acceptPassengerRequest;
    }

    if (this.state.pointCoords.length > 1) {
      endMarker = (
        <Marker
          coordinate={this.state.pointCoords[this.state.pointCoords.length - 1]}
        >
          <Image
            style={{ width: 40, height: 40 }}
            source={require("../images/person-marker.png")}
          />
        </Marker>
      );
    }

    return (
      <View style={styles.container}>
        <MapView
          ref={map => {
            this.map = map;
          }}
          style={styles.map}
          region={{
            latitude: this.state.latitude,
            longitude: this.state.longitude,
            latitudeDelta: 0.015,
            longitudeDelta: 0.0121
          }}
          showsUserLocation={true}
        >
          <Polyline
            coordinates={this.state.pointCoords}
            strokeWidth={4}
            strokeColor="red"
          />
          {endMarker}
          {startMarker}
        </MapView>
        <BottomButton
          onPressFunction={bottomButtonFunction}
          buttonText={passengerSearchText}
        >
          {findingPassengerActIndicator}
        </BottomButton>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  findDriver: {
    backgroundColor: "black",
    marginTop: "auto",
    margin: 20,
    padding: 15,
    paddingLeft: 30,
    paddingRight: 30,
    alignSelf: "center"
  },
  findDriverText: {
    fontSize: 20,
    color: "white",
    fontWeight: "600"
  },
  suggestions: {
    backgroundColor: "white",
    padding: 5,
    fontSize: 18,
    borderWidth: 0.5,
    marginLeft: 5,
    marginRight: 5
  },
  destinationInput: {
    height: 40,
    borderWidth: 0.5,
    marginTop: 50,
    marginLeft: 5,
    marginRight: 5,
    padding: 5,
    backgroundColor: "white"
  },
  container: {
    ...StyleSheet.absoluteFillObject
  },
  map: {
    ...StyleSheet.absoluteFillObject
  }
});
