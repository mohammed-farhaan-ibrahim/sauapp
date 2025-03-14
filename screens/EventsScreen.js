import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert, FlatList, TouchableOpacity, Image } from "react-native";
import { getFirestore, collection, addDoc, deleteDoc, doc, updateDoc, onSnapshot, Timestamp } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth } from "../firebaseConfig";
import * as ImagePicker from 'expo-image-picker';
import { AntDesign, MaterialIcons } from '@expo/vector-icons';
import { Linking } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

const EventsScreen = ({ navigation }) => {
  const db = getFirestore();
  const storage = getStorage();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventStartDate, setEventStartDate] = useState(new Date());
  const [eventEndDate, setEventEndDate] = useState(new Date());
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [image, setImage] = useState(null);
  const [registrationLink, setRegistrationLink] = useState("");
  const [events, setEvents] = useState([]);
  const [editingEvent, setEditingEvent] = useState(null);
  const [expandedEventId, setExpandedEventId] = useState(null);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const user = auth.currentUser;

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "events"), (snapshot) => {
      const eventList = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title,
          description: data.description,
          category: data.category,
          location: data.location,
          registrationLink: data.registrationLink,
          eventStartDate: data.eventStartDate ? data.eventStartDate.toDate() : null,
          eventEndDate: data.eventEndDate ? data.eventEndDate.toDate() : null,
          status: data.status,
          image: data.image,
          creatorid: data.creatorid,
          timestamp: data.timestamp ? data.timestamp.toDate() : null,
        };
      });
      setEvents(eventList);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigation.replace("LoginScreen");
    } catch (error) {
      Alert.alert("Error", "Logout failed!");
    }
  };

  const pickFile = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission required", "You need to allow access to your gallery to pick a file.");
      return;
    }
  
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaType.All, // Updated to use MediaType.All
      allowsEditing: true,
      quality: 1,
    });
  
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const uploadFile = async (fileUri) => {
    try {
      const response = await fetch(fileUri);
      const blob = await response.blob();
      const storageRef = ref(storage, `events/${user.uid}/${Date.now()}`);
      await uploadBytes(storageRef, blob);
      const url = await getDownloadURL(storageRef);
      return url;
    } catch (error) {
      console.error("Error uploading file: ", error);
      throw error;
    }
  };

  const clearInputFields = () => {
    setTitle("");
    setDescription("");
    setEventStartDate(new Date());
    setEventEndDate(new Date());
    setCategory("");
    setLocation("");
    setImage(null);
    setRegistrationLink("");
    setEditingEvent(null);
  };

  const handleCreateEvent = async () => {
    if (!title || !description || !eventStartDate || !eventEndDate || !category || !location || !registrationLink) {
      Alert.alert("Error", "All fields are required!");
      return;
    }

    try {
      let imageUrl = null;
      if (image) {
        imageUrl = await uploadFile(image);
      }

      await addDoc(collection(db, "events"), {
        title,
        description,
        eventStartDate: Timestamp.fromDate(eventStartDate),
        eventEndDate: Timestamp.fromDate(eventEndDate),
        category,
        location,
        image: imageUrl,
        registrationLink,
        creatorid: user.email,
        timestamp: Timestamp.fromDate(new Date()),
      });
      Alert.alert("Success", "Event created!");
      clearInputFields();
    } catch (error) {
      console.error("Error creating event: ", error);
      Alert.alert("Error", "Failed to create event.");
    }
  };

  const handleEditEvent = async (id) => {
    try {
      let imageUrl = editingEvent.image;
      if (image && image !== editingEvent.image) {
        imageUrl = await uploadFile(image);
      }

      await updateDoc(doc(db, "events", id), {
        title,
        description,
        eventStartDate: Timestamp.fromDate(eventStartDate),
        eventEndDate: Timestamp.fromDate(eventEndDate),
        category,
        location,
        image: imageUrl,
        registrationLink,
      });
      Alert.alert("Updated", "Event updated successfully.");
      clearInputFields();
    } catch (error) {
      Alert.alert("Error", "Failed to update.");
    }
  };

  const startEditing = (item) => {
    setEditingEvent(item);
    setTitle(item.title);
    setDescription(item.description);
    setEventStartDate(item.eventStartDate);
    setEventEndDate(item.eventEndDate);
    setCategory(item.category);
    setLocation(item.location);
    setImage(item.image);
    setRegistrationLink(item.registrationLink);
  };

  const handleDeleteEvent = async (id) => {
    Alert.alert("Delete Event", "Are you sure you want to delete this event?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        onPress: async () => {
          try {
            await deleteDoc(doc(db, "events", id));
            Alert.alert("Deleted", "Event removed successfully.");
          } catch (error) {
            Alert.alert("Error", "Failed to delete.");
          }
        },
      },
    ]);
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

  const handleDateChange = (event, selectedDate, field) => {
    const currentDate = selectedDate || new Date();
    if (field === "start") {
      setEventStartDate(currentDate);
      setShowStartDatePicker(false);
    } else {
      setEventEndDate(currentDate);
      setShowEndDatePicker(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Create Event</Text>
      <TextInput placeholder="Title" value={title} onChangeText={setTitle} style={styles.input} />
      <TextInput placeholder="Description" value={description} onChangeText={setDescription} multiline style={styles.input} />
      
      <View style={styles.datePickerContainer}>
        <TouchableOpacity onPress={() => setShowStartDatePicker(true)} style={styles.datePicker}>
          <Text style={styles.dateText}>{eventStartDate ? eventStartDate.toLocaleDateString() : 'Start Date'}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => setShowEndDatePicker(true)} style={styles.datePicker}>
          <Text style={styles.dateText}>{eventEndDate ? eventEndDate.toLocaleDateString() : 'End Date'}</Text>
        </TouchableOpacity>
      </View>
      
      {showStartDatePicker && (
        <DateTimePicker
          value={eventStartDate}
          mode="date"
          display="default"
          placeholderText="start date"
          onChange={(event, selectedDate) => handleDateChange(event, selectedDate, "start")}
        />
      )}

      {showEndDatePicker && (
        <DateTimePicker
          value={eventEndDate}
          mode="date"
          display="default"
          placeholder="start date"
          onChange={(event, selectedDate) => handleDateChange(event, selectedDate, "end")}
        />
      )}

      <TextInput placeholder="Category" value={category} onChangeText={setCategory} style={styles.input} />
      <TextInput placeholder="Location" value={location} onChangeText={setLocation} style={styles.input} />
      <TextInput placeholder="Registration Link" value={registrationLink} onChangeText={setRegistrationLink} style={styles.input} />
      <Button title="Pick File" onPress={pickFile} />
      {image && <Text>File selected: {image}</Text>}
      {image && <Image source={{ uri: image }} style={styles.image} />}
      <Button title={editingEvent ? "Update Event" : "Create Event"} onPress={editingEvent ? () => handleEditEvent(editingEvent.id) : handleCreateEvent} />

      <Text style={styles.heading}>All Events</Text>
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.card, expandedEventId === item.id && styles.expandedCard]}>
            <View style={styles.cardHeader}>
              <View style={styles.cardContent}>
                <Text style={styles.title}>{item.title}</Text>
                <Text>Start Date: {item.eventStartDate ? item.eventStartDate.toLocaleDateString() : "N/A"}</Text>
                <Text>Category: {item.category}</Text>
                <Text>Location: {item.location}</Text>
              </View>
              <View style={styles.buttonsContainer}>
                <TouchableOpacity onPress={() => setExpandedEventId(expandedEventId === item.id ? null : item.id)} style={styles.expandButton}>
                  <AntDesign name={expandedEventId === item.id ? "up" : "right"} size={24} color="black" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteEvent(item.id)} style={styles.deleteButton}>
                  <MaterialIcons name="delete" size={24} color="black" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => startEditing(item)}>
                  <Text style={styles.editButton}>Edit</Text>
                </TouchableOpacity>
              </View>
            </View>

            {expandedEventId === item.id && (
              <View style={styles.cardDetails}>
                <Text>Description: {item.description}</Text>
                <Text>End Date: {item.eventEndDate ? item.eventEndDate.toLocaleDateString() : "N/A"}</Text>
                {item.image && (
                  item.image.endsWith(".pdf") ? (
                    <TouchableOpacity onPress={() => Linking.openURL(item.image)}>
                      <Text style={styles.linkText}>Download PDF</Text>
                    </TouchableOpacity>
                  ) : (
                    <Image source={{ uri: item.image }} style={styles.image} />
                  )
                )}
                <View style={styles.buttonContainer}>
                  <TouchableOpacity onPress={() => handleRegister(item.registrationLink)} style={styles.registerButton}>
                    <Text style={styles.buttonText}>Register</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setExpandedEventId(null)} style={styles.backButton}>
                    <Text style={styles.buttonText}>Back</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  heading: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  input: { borderWidth: 1, padding: 10, marginVertical: 10, borderRadius: 5 },
  datePickerContainer: { flexDirection: "row", justifyContent: "space-between" },
  datePicker: { flex: 1, borderWidth: 1, padding: 10, marginVertical: 10, borderRadius: 5 },
  dateText: { fontSize: 16 },
  image: { width: 100, height: 100, marginVertical: 10 },
  card: { borderWidth: 1, marginVertical: 10, padding: 10, borderRadius: 5 },
  expandedCard: { backgroundColor: '#f0f0f0' },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardContent: { flex: 1 },
  buttonsContainer: { flexDirection: "row", alignItems: "center" },
  title: { fontWeight: "bold" },
  cardDetails: { marginTop: 10, alignItems: 'flex-start' },
  buttonContainer: { 
    flexDirection: "row", 
    justifyContent: "flex-end",  
    marginTop: 10 
  },
  registerButton: { backgroundColor: "blue", padding: 10, borderRadius: 5 },
  backButton: { backgroundColor: "grey", padding: 10, borderRadius: 5 },
  buttonText: { color: "white" },
  deleteButton: { padding: 10 },
  expandButton: { padding: 10 },
  logoutButton: { padding: 10 },
  logoutText: { color: 'red' },
  editButton: { color: 'blue', padding: 10 },
  linkText: {
    color: "blue",
    textDecorationLine: "underline",
    marginVertical: 10,
  },
});

export default EventsScreen;