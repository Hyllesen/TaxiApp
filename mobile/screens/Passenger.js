import React, { Component } from "react";
import {
  TextInput,
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
  Image,
  ActivityIndicator
} from "react-native";
import MapView, { Polyline, Marker } from "react-native-maps";
import apiKey from "../google_api_key";
import _ from "lodash";
import socketIO from "socket.io-client";
import BottomButton from "../components/BottomButton";

export default class Passenger extends Component {
  constructor(props) {
    super(props);
    this.state = {
      lookingForDriver: false,
      driverIsOnTheWay: false,
      predictions: []
    };
    this.onChangeDestinationDebounced = _.debounce(
      this.onChangeDestination,
      1000
    );
  }

  async onChangeDestination(destination) {
    const apiUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?key=${apiKey}
    &input=${destination}&location=${this.props.latitude},${
      this.props.longitude
    }&radius=2000`;
    console.log(apiUrl);
    try {
      const result = await fetch(apiUrl);
      const json = await result.json();
      this.setState({
        predictions: json.predictions
      });
      console.log(json);
    } catch (err) {
      console.error(err);
    }
  }

  async requestDriver() {
    this.setState({ lookingForDriver: true });
    var socket = socketIO.connect("http://192.168.0.27:3000");

    socket.on("connect", () => {
      console.log("client connected");
      //Request a taxi!
      socket.emit("taxiRequest", this.props.routeResponse);
    });

    socket.on("driverLocation", driverLocation => {
      const pointCoords = [...this.props.pointCoords, driverLocation];
      this.map.fitToCoordinates(pointCoords, {
        edgePadding: { top: 140, bottom: 140, left: 20, right: 20 }
      });
      this.setState({
        lookingForDriver: false,
        driverIsOnTheWay: true,
        driverLocation
      });
    });
  }

  render() {
    let marker = null;
    let getDriver = null;
    let findingDriverActIndicator = null;
    let driverMarker = null;

    if (!this.props.latitude) return null;

    if (this.state.driverIsOnTheWay) {
      driverMarker = (
        <Marker coordinate={this.state.driverLocation}>
          <Image
            source={require("../images/carIcon.png")}
            style={{ width: 40, height: 40 }}
          />
        </Marker>
      );
    }

    if (this.state.lookingForDriver) {
      findingDriverActIndicator = (
        <ActivityIndicator
          size="large"
          animating={this.state.lookingForDriver}
        />
      );
    }

    if (this.props.pointCoords.length > 1) {
      marker = (
        <Marker
          coordinate={this.props.pointCoords[this.props.pointCoords.length - 1]}
        />
      );
      getDriver = (
        <BottomButton
          onPressFunction={() => this.requestDriver()}
          buttonText="REQUEST 🚗"
        >
          {findingDriverActIndicator}
        </BottomButton>
      );
    }

    const predictions = this.state.predictions.map(prediction => (
      <TouchableHighlight
        onPress={async () => {
          const destinationName = await this.props.getRouteDirections(
            prediction.place_id,
            prediction.structured_formatting.main_text
          );
          this.setState({ predictions: [], destination: destinationName });
          this.map.fitToCoordinates(this.props.pointCoords, {
            edgePadding: { top: 20, bottom: 20, left: 20, right: 20 }
          });
        }}
        key={prediction.id}
      >
        <View>
          <Text style={styles.suggestions}>
            {prediction.structured_formatting.main_text}
          </Text>
        </View>
      </TouchableHighlight>
    ));

    return (
      <View style={styles.container}>
        <MapView
          ref={map => {
            this.map = map;
          }}
          style={styles.map}
          initialRegion={{
            latitude: this.props.latitude,
            longitude: this.props.longitude,
            latitudeDelta: 0.015,
            longitudeDelta: 0.0121
          }}
          showsUserLocation={true}
        >
          <Polyline
            coordinates={this.props.pointCoords}
            strokeWidth={4}
            strokeColor="red"
          />
          {marker}
          {driverMarker}
        </MapView>
        <TextInput
          placeholder="Enter destination..."
          style={styles.destinationInput}
          value={this.state.destination}
          clearButtonMode="always"
          onChangeText={destination => {
            console.log(destination);
            this.setState({ destination });
            this.onChangeDestinationDebounced(destination);
          }}
        />
        {predictions}
        {getDriver}
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
