import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { getFirestore, collection, onSnapshot } from "firebase/firestore";
import { auth } from "../firebaseConfig";
import moment from "moment";

const StudentDashboard = ({ navigation }) => {
  const [notifications, setNotifications] = useState([]);
  const db = getFirestore();

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "notifications"), (snapshot) => {
      const notificationsList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Define priority order
      const priorityOrder = { high: 1, medium: 2, low: 3 };

      // Sort notifications: First by priority, then by timestamp (most recent first)
      const sortedNotifications = notificationsList.sort((a, b) => {
        const priorityA = priorityOrder[a.priority] || 4;
        const priorityB = priorityOrder[b.priority] || 4;

        if (priorityA !== priorityB) {
          return priorityA - priorityB; // Sort by priority
        }

        const timeA = a.timestamp?.toDate?.() || 0;
        const timeB = b.timestamp?.toDate?.() || 0;

        return timeB - timeA; // Sort by most recent timestamp
      });

      setNotifications(sortedNotifications);
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

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "#ffcccc"; // Red for high priority
      case "medium":
        return "#ffffcc"; // Yellow for medium priority
      case "low":
        return "#ccffcc"; // Green for low priority
      default:
        return "#f8f8f8"; // Default color
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Notifications</Text>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: getPriorityColor(item.priority) }]}>
            <Text style={styles.title}>{item.title}</Text>
            <Text>{item.description}</Text>
            <Text style={styles.timestamp}>Priority: {item.priority?.toUpperCase()}</Text>
            <Text style={styles.timestamp}>Target: {item.target}</Text>
            <Text style={styles.timestamp}>
              Created: {item.timestamp ? moment(item.timestamp.toDate()).fromNow() : "Unknown"}
            </Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  heading: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  card: { padding: 15, marginVertical: 8, borderRadius: 8, elevation: 3 },
  title: { fontSize: 18, fontWeight: "bold" },
  timestamp: { fontSize: 12, color: "#999", marginTop: 5 },
  logoutButton: { marginRight: 15, padding: 5, backgroundColor: "red", borderRadius: 5 },
  logoutText: { color: "white", fontWeight: "bold" },
});

export default StudentDashboard;
