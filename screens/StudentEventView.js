import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, Image } from "react-native";
import { getFirestore, collection, onSnapshot } from "firebase/firestore";
import { auth } from "../firebaseConfig";
import moment from "moment";

const StudentEventView = ({ navigation }) => {
  const [events, setEvents] = useState([]);
  const db = getFirestore();

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "events"), (snapshot) => {
      const eventsList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Sort events by start date (most recent first)
      const sortedEvents = eventsList.sort((a, b) => {
        const timeA = a.eventStartDate?.toDate?.() || 0;
        const timeB = b.eventStartDate?.toDate?.() || 0;
        return timeB - timeA; // Sort by most recent start date
      });

      setEvents(sortedEvents);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigation.replace("LoginScreen");
    } catch (error) {
      Alert.alert("Error", "Logout failed!");
    }
  };

  const handleRegister = (registrationLink) => {
    if (registrationLink) {
      const formattedLink = registrationLink.trim();
      if (formattedLink.startsWith("http://") || formattedLink.startsWith("https://")) {
        Linking.openURL(formattedLink).catch((err) =>
          Alert.alert("Error", "Failed to open registration link.")
        );
      } else {
        Alert.alert("Invalid Link", "The registration link is not valid.");
      }
    } else {
      Alert.alert("No Registration Link", "This event does not have a registration link.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Events</Text>
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.title}</Text>
            <Text>{item.description}</Text>
            <Text style={styles.timestamp}>
              Start Date: {item.eventStartDate ? moment(item.eventStartDate.toDate()).format("MMMM Do YYYY") : "N/A"}
            </Text>
            <Text style={styles.timestamp}>
              End Date: {item.eventEndDate ? moment(item.eventEndDate.toDate()).format("MMMM Do YYYY") : "N/A"}
            </Text>
            <Text style={styles.timestamp}>Category: {item.category}</Text>
            <Text style={styles.timestamp}>Location: {item.location}</Text>
            {item.image && <Image source={{ uri: item.image }} style={styles.image} />}
            <TouchableOpacity onPress={() => handleRegister(item.registrationLink)} style={styles.registerButton}>
              <Text style={styles.buttonText}>Register</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  heading: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  card: { padding: 15, marginVertical: 8, borderRadius: 8, elevation: 3, backgroundColor: "#f8f8f8" },
  title: { fontSize: 18, fontWeight: "bold" },
  timestamp: { fontSize: 14, color: "#666", marginTop: 5 },
  image: { width: "100%", height: 150, marginTop: 10, borderRadius: 5 },
  registerButton: { backgroundColor: "blue", padding: 10, borderRadius: 5, marginTop: 10, alignItems: "center" },
  buttonText: { color: "white", fontWeight: "bold" },
  logoutButton: { marginRight: 15, padding: 5, backgroundColor: "red", borderRadius: 5 },
  logoutText: { color: "white", fontWeight: "bold" },
});

export default StudentEventView;