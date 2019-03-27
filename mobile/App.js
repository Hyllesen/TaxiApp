import React, { Component } from "react";
import { StyleSheet, Text, View, Button } from "react-native";
import Driver from "./screens/Driver";
import Passenger from "./screens/Passenger";
import Login from "./screens/Login";
import GenericContainer from "./components/GenericContainer";

const DriverWithGenericContainer = GenericContainer(Driver);
const PassengerWithGenericContainer = GenericContainer(Passenger);

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isDriver: false,
      isPassenger: false,
      token: ""
    };
    this.handleChangeToken = this.handleChangeToken.bind(this);
  }

  handleChangeToken(token) {
    this.setState({ token });
  }

  render() {
    if (this.state.token === "") {
      return <Login handleChangeToken={this.handleChangeToken} />;
    }

    if (this.state.isDriver) {
      return <DriverWithGenericContainer token={this.state.token} />;
    }

    if (this.state.isPassenger) {
      return <PassengerWithGenericContainer token={this.state.token} />;
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
