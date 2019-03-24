import React, { Component } from "react";
import { Text, StyleSheet, View, Platform, Alert, Image } from "react-native";
import LoginForm from "../components/LoginForm";
import axios from "axios";
import baseUrl from "../baseUrl";
axios.defaults.baseURL = baseUrl;

export default class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "stefan@reactnativetutorial.net4",
      password: "MySuperSecretPassword!!11",
      errorMessage: ""
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSignIn = this.handleSignIn.bind(this);
    this.handleSignUp = this.handleSignUp.bind(this);
  }

  handleChange(name, value) {
    this.setState({
      [name]: value
    });
  }

  async handleSignUp() {
    try {
      const { email, password } = this.state;
      await axios.post("/auth/signup", { email, password });
      this.handleSignIn();
    } catch (error) {
      this.setState({ errorMessage: error.response.data.message });
    }
  }

  async handleSignIn() {
    try {
      this.setState({ errorMessage: "" });
      const { email, password } = this.state;
      const result = await axios.post("/auth/login", { email, password });
      Alert.alert("", result.data.token);
    } catch (error) {
      this.setState({ errorMessage: error.response.data.message });
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.headerText}>React Native Taxi</Text>
        <LoginForm
          email={this.state.email}
          password={this.state.password}
          handleChange={this.handleChange}
          handleSignIn={this.handleSignIn}
          handleSignUp={this.handleSignUp}
        />
        <Text style={styles.errorMessage}>{this.state.errorMessage}</Text>
        <Image source={require("../images/greencar.png")} style={styles.logo} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#3A3743"
  },
  errorMessage: {
    marginHorizontal: 10,
    fontSize: 18,
    color: "#F5D7CC",
    fontWeight: "bold"
  },
  headerText: {
    fontSize: 44,
    textAlign: "center",
    color: "#C1D76D",
    fontFamily: Platform.OS === "android" ? "sans-serif-light" : undefined,
    marginTop: 30,
    fontWeight: "200"
  },
  logo: {
    height: 300,
    width: 300,
    alignSelf: "center"
  }
});
