import React, { Component } from "react";
import { StyleSheet, Text, View } from "react-native";
import io from "socket.io-client";

export default class Driver extends Component {
  constructor(props) {
    super(props);
    this.state = {
      driverRequest: {}
    };
  }

  componentDidMount() {
    //Connect to socket io server... wait for a passenger
    this.socket = io("http://192.168.0.27:3000");
    this.socket.on("driver request", driverRequest => {
      this.setState({ driverRequest });
    });
    //Accept passenger request.. or not?
    //Pickup passenger
    //Start trip
    //Navigation to location
    //End trip, happy trails!
  }

  render() {
    return (
      <View style={styles.container}>
        <Text>I'm a driver that's cool</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    marginTop: 30
  }
});
