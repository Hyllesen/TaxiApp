import React, { Component } from "react";
import {
  StyleSheet,
  TextInput,
  View,
  Text,
  TouchableHighlight,
  Keyboard
} from "react-native";
import MapView from "react-native-maps";
import apiKey from "../google_api_key";
import _ from "lodash";

//Show map... select location to go to
//Get location route with Google Location API
//Send driver request
//Wait for driver to arrive
//Get picked up by driver
//Let driver drive to location

export default class Passenger extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: "",
      latitude: 0,
      longitude: 0,
      locationPredictions: []
    };
    this.onChangeDestinationDebounced = _.debounce(
      this.onChangeDestination,
      1000
    );
  }

  componentDidMount() {
    //Get current location and set initial region to this
    navigator.geolocation.getCurrentPosition(
      position => {
        this.setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      error => this.setState({ error: error.message }),
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 20000 }
    );
  }

  async onChangeDestination(destination) {
    this.setState({ destination });
    const apiUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?key=${apiKey}&input={${destination}}&location=${
      this.state.latitude
    },${this.state.longitude}&radius=2000`;
    const result = await fetch(apiUrl);
    const jsonResult = await result.json();
    this.setState({
      locationPredictions: jsonResult.predictions
    });
    console.log(jsonResult);
  }

  pressedPrediction(prediction) {
    console.log(prediction);
    Keyboard.dismiss();
    this.setState({
      locationPredictions: [],
      destination: prediction.description
    });
    Keyboard;
  }

  render() {
    const locationPredictions = this.state.locationPredictions.map(
      prediction => (
        <TouchableHighlight
          key={prediction.id}
          onPress={() => this.pressedPrediction(prediction)}
        >
          <Text style={styles.locationSuggestion}>
            {prediction.description}
          </Text>
        </TouchableHighlight>
      )
    );

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
        />
        <TextInput
          placeholder="Enter location.."
          style={styles.destinationInput}
          onChangeText={destination => {
            this.setState({ destination });
            this.onChangeDestinationDebounced(destination);
          }}
          value={this.state.destination}
        />
        {locationPredictions}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  destinationInput: {
    borderWidth: 0.5,
    borderColor: "grey",
    height: 40,
    marginTop: 50,
    marginLeft: 5,
    marginRight: 5,
    padding: 5,
    backgroundColor: "white"
  },
  locationSuggestion: {
    backgroundColor: "white",
    padding: 5,
    fontSize: 18,
    borderWidth: 0.5
  },
  container: {
    ...StyleSheet.absoluteFillObject
  },
  map: {
    ...StyleSheet.absoluteFillObject
  }
});
