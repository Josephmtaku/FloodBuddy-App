import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Modal, Pressable, Image, TextInput, Text } from 'react-native';
import MapView, { MapMarker, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { db } from '../firebaseConfig';
import { collection, addDoc, getDocs, onSnapshot } from 'firebase/firestore';

export const MapScreen = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSeverity, setSelectedSeverity] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null); 
  const [initialRegion, setInitialRegion] = useState(null);
  const [reports, setReports] = useState([]);

  // Function to handle setting current location
  const handleCurrentLocation = (location) => {
    setCurrentLocation(location);

    // Sets the initial region to the user's location with adjusted delta values for zooming
    setInitialRegion({
      latitude: location.latitude,
      longitude: location.longitude,
      latitudeDelta: 0.01, // control the zoom level
      longitudeDelta: 0.01
    });
  };

  useEffect(() => {
    const fetchReports = async () => {
      const reportsCollection = collection(db, 'reports');
      const querySnapshot = await getDocs(reportsCollection);
      const fetchedReports = [];
      querySnapshot.forEach((doc) => {
        fetchedReports.push({ id: doc.id, ...doc.data() });
      });
      setReports(fetchedReports);
    };
  
    // Call fetchReports initially
    fetchReports();
  
    // Listen for changes in the reports collection
    const unsubscribe = onSnapshot(collection(db, 'reports'), (snapshot) => {
      const fetchedReports = [];
      snapshot.forEach((doc) => {
        fetchedReports.push({ id: doc.id, ...doc.data() });
      });
      setReports(fetchedReports);
    });
  
    // Clean up listener on unmount
    return () => unsubscribe();
  }, []);
  

  const handleSeverityPress = (severity) => {
    setModalVisible(false);
    setSelectedSeverity(severity);
  };

  const handleCloseBottomSheet = () => {
    setSelectedSeverity(null);
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <MapView
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          showsUserLocation={true}
          customMapStyle={customMapStyle}
          initialRegion={initialRegion}
          onUserLocationChange={(event) => handleCurrentLocation(event.nativeEvent.coordinate)} //Handle user location change
        >
         {reports.map((report) => (
            <Marker
              key={report.id}
              coordinate={{ latitude: report.latitude, longitude: report.longitude }}
              pinColor={getColorForSeverity(report.severity)}
            />
          ))}
        </MapView> 

        <Pressable style={styles.hazardButton} onPress={() => setModalVisible(true)}>
          <Image source={require('../assets/hazard_icon.png')} style={{ width: 60, height: 60 }} />
        </Pressable>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
      
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
              <Pressable
                style={[styles.button, styles.buttonClose]}
                onPress={() => setModalVisible(!modalVisible)}
              >
                <Image source={require('../assets/close.png')} style={{ width: 15, height: 15 }} />
              </Pressable>
            </View>

            <Text style={styles.modalText}>What is the severity of the flood?</Text>
            <Pressable onPress={() => handleSeverityPress('Minor')} style={styles.severityBox}>
              <View style={styles.imageCircle}>
                <Image source={require('../assets/hazard_icon.png')} style={{ width: 60, height: 60 }} />
              </View>
              <View>
                <Text style={styles.severityText}>Minor</Text>
              </View>
            </Pressable>
            <Pressable onPress={() => handleSeverityPress('Moderate')} style={styles.severityBox}>
              <View style={styles.imageCircle}>
                <Image source={require('../assets/hazard_icon_amber.png')} style={{ width: 60, height: 60 }} />
              </View>
              <View>
                <Text style={styles.severityText}>Moderate</Text>
              </View>
            </Pressable>
            <Pressable onPress={() => handleSeverityPress('Severe')} style={styles.severityBox}>
              <View style={styles.imageCircle}>
                <Image source={require('../assets/hazard_icon_red.png')} style={{ width: 60, height: 60 }} />
              </View>
              <View>
                <Text style={styles.severityText}>Severe</Text>
              </View>
            </Pressable>
          </View>
        </View>
      </Modal>
          {selectedSeverity === 'Minor' && <MinorBottomSheet onClose={handleCloseBottomSheet} currentLocation={currentLocation} />}
          {selectedSeverity === 'Moderate' && <ModerateBottomSheet onClose={handleCloseBottomSheet} currentLocation={currentLocation} />}
          {selectedSeverity === 'Severe' && <SevereBottomSheet onClose={handleCloseBottomSheet} currentLocation={currentLocation} />}
    </View>
  );
};

const MinorBottomSheet = ({ onClose, currentLocation }) => {
  const [comment, setComment] = useState('');

  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);
  const [severity, setSeverity] = useState(0);

  const handleReport = async () => {
    try {
      const newReport = {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        severity: 1,
      };
  
      await addDoc(collection(db, "reports"), newReport);
      alert('Report has been sent successfully');
    } catch (error) {
      alert('Error adding report:', error);
    }
  };
  
  return (
    <View style={[styles.bottomSheet, styles.fullScreen]}>
      <View style={styles.innerContainer}>
        <Text style={styles.sectionTitle}>Current Location:</Text>
        {currentLocation && (
          <>
            <Text style={styles.locationText}>Latitude: {currentLocation.latitude}</Text>
            <Text style={styles.locationText}>Longitude: {currentLocation.longitude}</Text>
          </>
        )}

        <View style={styles.severityContainer}>
          <Text style={styles.sectionTitle}>Flood Severity:</Text>
          <View style={styles.severityBottomSheetBox}>
            <View style={styles.imageCircle}>
              <Image source={require('../assets/hazard_icon.png')} style={{ width: 60, height: 60 }} />
            </View>
            <Text style={styles.severityText}>Minor</Text>
          </View>
        </View>
      </View>


      <View style={styles.buttonContainer}>
        <Pressable style={[styles.severitybutton, styles.reportButton]} onPress={handleReport}>
          <Text style={styles.buttonText}>Report</Text>
        </Pressable>
        <Pressable style={[styles.severitybutton, styles.cancelButton]} onPress={onClose}>
          <Text style={styles.buttonText}>Close</Text>
        </Pressable>
      </View>
    </View>
  );
};

const ModerateBottomSheet = ({ onClose, currentLocation }) => {
  const [comment, setComment] = useState('');

  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);
  const [severity, setSeverity] = useState(0);

  const handleReport = async () => {
    try {
      const newReport = {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        severity: 2,
      };
  
      await addDoc(collection(db, "reports"), newReport);
      alert('Report has been sent successfully');
    } catch (error) {
      alert('Error adding report:', error);
    }
  };

  return (
    <View style={styles.bottomSheet}>
      <Text style={styles.sectionTitle}>Current Location</Text>
      {currentLocation && (
        <>
          <Text style={styles.locationText}>Latitude: {currentLocation.latitude}</Text>
          <Text style={styles.locationText}>Longitude: {currentLocation.longitude}</Text>
        </>
      )}

      <Text style={styles.sectionTitle}>Flood Severity</Text>

      <View style={styles.severityContainer}>
        <Image source={require('../assets/hazard_icon_amber.png')} style={styles.severityImage} />
        <Text style={styles.severityTypeText}>Moderate</Text>
      </View>


      <View style={styles.buttonContainer}>
        <Pressable style={[styles.severitybutton, styles.reportButton]} onPress={handleReport}>
          <Text style={styles.buttonText}>Report</Text>
        </Pressable>
        <Pressable style={[styles.severitybutton, styles.closeButton]} onPress={onClose}>
          <Text style={styles.buttonText}>Close</Text>
        </Pressable>
      </View>
    </View>
  );
};

const SevereBottomSheet = ({ onClose, currentLocation }) => {
  const [comment, setComment] = useState('');

  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);
  const [severity, setSeverity] = useState(0);

  const handleReport = async () => {
    try {
      const newReport = {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        severity: 3, 
      };
  
      await addDoc(collection(db, "reports"), newReport);
      alert('Report has been sent successfully');
    } catch (error) {
      alert('Error adding report:', error);
    }
  };

  return (
    <View style={styles.bottomSheet}>
      <Text style={styles.sectionTitle}>Current Location</Text>
      {currentLocation && (
        <>
          <Text style={styles.locationText}>Latitude: {currentLocation.latitude}</Text>
          <Text style={styles.locationText}>Longitude: {currentLocation.longitude}</Text>
        </>
      )}
      
      <View style={styles.severityContainer}>
        <Text style={styles.sectionTitle}>Flood Severity</Text>
        <Image source={require('../assets/hazard_icon_red.png')} style={styles.severityImage} />
        <Text style={styles.severityTypeText}>Severe</Text>
      </View>


      <View style={styles.buttonContainer}>
        <Pressable style={[styles.severitybutton, styles.reportButton]} onPress={handleReport}>
          <Text style={styles.buttonText}>Report</Text>
        </Pressable>
        <Pressable style={[styles.severitybutton, styles.closeButton]} onPress={onClose}>
          <Text style={styles.buttonText}>Close</Text>
        </Pressable>
      </View>
    </View>
  );
};

const getColorForSeverity = (severity) => {
  switch (severity) {
    case 1:
      return 'green';
    case 2:
      return 'yellow';
    case 3:
      return 'red';
    default:
      return 'blue'; // Default color if severity is not recognized
  }
};

const styles = StyleSheet.create({
  mapContainer: {
    width: '100%',
    height: '100%',
    flex: 1,
    alignItems: 'flex-end',
  },
  map: {
    flex: 1,
  },
  hazardButton: {
    position: 'absolute',
    left: '80%',
    top: '80%',
    backgroundColor: '#fff',
    borderRadius: 50,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    justifyContent: 'center',
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2
  },
  buttonClose: {
    left: '450%',
    top: '-3%',
    backgroundColor: '#ffffff',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '100%'
  },
  modalText: {
    marginBottom: 10,
    textAlign: 'left',
    fontSize: 20,
    fontWeight: 'bold',
  },
  severityBox: {
    borderColor: '#000',
    borderStyle: 'solid',
    borderRadius: 10,
    borderWidth: 2.5,
    margin: 7,
    width: '100%',
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  severityBottomSheetBox: {
    borderColor: '#000',
    borderStyle: 'solid',
    borderRadius: 10,
    borderWidth: 2.5,
    margin: 7,
    width: '100%',
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    top: 15,
    left: -140,
  },
  severityText: {
    paddingLeft: 20,
    fontSize: 20
  },
  imageCircle: {
    backgroundColor: '#fff',
    borderRadius: 50,
    width: 60,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    justifyContent: 'center',
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#00AEFF',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 100,
  },
  locationText: {
    fontSize: 16,
    marginBottom: 5,
  },
  severityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  severityImage: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  severityTypeText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  commentInput: {
    borderWidth: 2,
    borderColor: '#ced4da',
    borderRadius: 5,
    padding: 10,
    marginBottom: 280,
    maxHeight: 100,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  severitybutton: {
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#00AEFF',
  },
  reportButton: {
    backgroundColor: '#00AEFF',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  fullScreen: {
    position: 'absolute',
    top: 90,
    left: 0,
    right: 0,
    bottom: 0,
  },
  innerContainer: {
    flex: 1,
    padding: 20,
  },
});


// Custom map style
const customMapStyle = [
  {
    elementType: 'geometry',
    stylers: [
      {
        color: '#f5f5f5', // Background color
      },
    ],
  },
  {
    elementType: 'labels.icon',
    stylers: [
      {
        visibility: 'off', // Hide icons
      },
    ],
  },
  {
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#616161', // Text color
      },
    ],
  },
  {
    elementType: 'labels.text.stroke',
    stylers: [
      {
        color: '#f5f5f5', // Text outline color
      },
    ],
  },
  {
    featureType: 'administrative.land_parcel',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#bdbdbd', // Administrative land parcel text color
      },
    ],
  },
  {
    featureType: 'poi',
    elementType: 'geometry',
    stylers: [
      {
        color: '#eeeeee', // Point of interest color
      },
    ],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#757575', // Point of interest text color
      },
    ],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [
      {
        color: '#e5e5e5', // Park color
      },
    ],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#9e9e9e', // Park text color
      },
    ],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [
      {
        color: '#ffffff', // Road color
      },
    ],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#3d3d3d', // Road text color
      },
    ],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [
      {
        color: '#dadada', // Road highway color
      },
    ],
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#616161', // Road highway text color
      },
    ],
  },
  {
    featureType: 'transit.line',
    elementType: 'geometry',
    stylers: [
      {
        color: '#e5e5e5', // Transit line color
      },
    ],
  },
  {
    featureType: 'transit.station',
    elementType: 'geometry',
    stylers: [
      {
        color: '#eeeeee', // Transit station color
      },
    ],
  },
  {
    featureType: 'water',
    elementType: 'geometry.fill',
    stylers: [
      {
        color: '#74ccf4', // Water color
      },
    ],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '##999999', // Water text color
      },
    ],
  },
  {
    featureType: 'administrative',
    elementType: 'geometry.stroke',
    stylers: [
      {
        visibility: 'off', // Hide administrative boundaries
      },
    ],
  },
];
export default MapScreen;