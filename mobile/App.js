import React, { Component } from "react";
import { StyleSheet, Text, View, Button } from "react-native";
import Driver from "./screens/Driver";
import Passenger from "./screens/Passenger";

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isDriver: false,
      isPassenger: false
    };
  }

  componentDidMount() {}

  render() {
    if (this.state.isDriver) {
      return <Driver />;
    }

    if (this.state.isPassenger) {
      return <Passenger />;
    }

    return (
      <View style={styles.container}>
        <Button
          onPress={() => this.setState({ isPassenger: true })}
          title="Passenger"
        />
        <Button
          onPress={() => this.setState({ isDriver: true })}
          title="Driver"
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 50
  }
});
