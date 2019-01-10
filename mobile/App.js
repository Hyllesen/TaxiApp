import React, { Component } from "react";
import { TextInput, StyleSheet, Text, View } from "react-native";
import MapView, { Polyline } from "react-native-maps";
import apiKey from "./google_api_key";
import PolyLine from "@mapbox/polyline";

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: "",
      latitude: 0,
      longitude: 0,
      destination: "",
      predictions: [],
      pointCoords: []
    };
  }

  componentDidMount() {
    //Get current location and set initial region to this
    navigator.geolocation.getCurrentPosition(
      position => {
        this.setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        this.getRouteDirections();
      },
      error => this.setState({ error: error.message }),
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 20000 }
    );
  }

  async getRouteDirections() {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${
          this.state.latitude
        },${
          this.state.longitude
        }&destination=Googleplex&key=AIzaSyBS3GdBm6-8tAbdAUavnq8GIyWHS1IJZgk`
      );
      const json = await response.json();
      console.log(json);
      const points = PolyLine.decode(json.routes[0].overview_polyline.points);
      console.log(points);
      const pointCoords = points.map(point => {
        return { latitude: point[0], longitude: point[1] };
      });
      this.setState({ pointCoords });
    } catch (error) {
      console.error(error);
    }
  }

  async onChangeDestination(destination) {
    this.setState({ destination });
    const apiUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?key=${apiKey}
    &input=${destination}&location=${this.state.latitude},${
      this.state.longitude
    }&radius=2000`;
    try {
      const result = await fetch(apiUrl);
      const json = await result.json();
      this.setState({
        predictions: json.predictions
      });
    } catch (err) {
      console.error(err);
    }
  }

  render() {
    const predictions = this.state.predictions.map(prediction => (
      <Text style={styles.suggestions} key={prediction.id}>
        {prediction.description}
      </Text>
    ));

    console.log(this.state.pointCoords);

    return (
      <View style={styles.container}>
        <MapView
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
        </MapView>
        <TextInput
          placeholder="Enter destination..."
          style={styles.destinationInput}
          value={this.state.destination}
          onChangeText={destination => this.onChangeDestination(destination)}
        />
        {predictions}
      </View>
    );
  }
}

const styles = StyleSheet.create({
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
