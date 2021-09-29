import React from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Alert,
  Keyboard,
  Platform,
  Modal,
} from 'react-native';
import { connect } from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import PropTypes from 'prop-types';
import { Button, Input } from 'react-native-elements';

import { sendMsejrafoToServer } from '../../redux/actions/app.actions';
import ButtonCamera from '../../components/other/ButtonCamera';
import TextButton from '../../components/global/ui/TextButton';
import Icon from 'react-native-vector-icons/Feather';

const styles = StyleSheet.create({
  containerApiResult: {
    marginTop: 10,
  },
  danger: {
    textAlign: 'center',
    color: 'red',
  },
});

const UselessTextInput = (props) => (
  <Input
    {...props}
    editable
    // eslint-disable-next-line react-native/no-inline-styles
    inputStyle={{ fontSize: 18, color: 'white', padding: 15 }}
  // leftIcon={<Ionicons name="pencil" size={24} color="white" />}
  />
);

const SceneNewEvent = ({
  navigation,
  sendMsejrafoToServerAction,
  storedError,
  isFetching,
  token,
}) => {
  // personalizar el headbar de esta pantalla
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <Button
          type="clear"
          icon={<Ionicons name="menu-outline" size={20} color="white" />}
          iconRight
          title=""
          onPress={() => navigation.openDrawer()}
          // eslint-disable-next-line react-native/no-inline-styles
          titleStyle={{ color: 'white' }}
        />
      ),
      tabBarIcon: () => {
        return <Ionicons name="eye" size={25} />;
      },
    });
  }, [navigation]);

  const [value, onChangeText] = React.useState('');
  // varaibles for the btn img load
  const [imgEvent, setImgEvent] = React.useState({});
  const [imageAllProperties, setImageAllProperties] = React.useState({});
  const [loading, setLoading] = React.useState(false);
  const [visibleCameraModal, setVisibleCameraModal] = React.useState(false);
  
  // END varaibles for the btn img load

  const openPhoto = (type) => {
    const options = {
      title: 'Añade una imágen',
      cancelButtonTitle: 'Cancelar',
      chooseFromLibraryButtonTitle: 'Abrir galería',
      takePhotoButtonTitle: 'Tomar foto',
      durationLimit: 120, // seconds
      storageOptions: {
        skipBackup: true,
        path: 'images',
        cameraRoll: true,
      },
    };

   
    if (type === "camera") {
      setLoading(true);
      launchCamera(options, (response) => {
        if (response.didCancel) {
          console.log('User cancelled image picker');
        } else if (response.error) {
          // console.log(response)
          console.log('ImagePicker Error: ', response.error);
        } else if (response.customButton) {
          console.log('User tapped custom button: ', response.customButton);
        } else {
          // console.log(response.assets[0].uri)
          setImgEvent({ uri: response.assets[0].uri });
          setImageAllProperties(response);
        }

        setLoading(false);
      });
    } else {
      setLoading(true);
      launchImageLibrary(options, (response) => {
        if (response.didCancel) {
          console.log('User cancelled image picker');
        } else if (response.error) {
          // console.log(response)
          console.log('ImagePicker Error: ', response.error);
        } else if (response.customButton) {
          console.log('User tapped custom button: ', response.customButton);
        } else {
          // console.log(response.assets[0].uri)
          setImgEvent({ uri: response.assets[0].uri });
          setImageAllProperties(response);
        }

        setLoading(false);
      });
    }

  };

  const removeImg = () => {
    setImgEvent({});
    setImageAllProperties({});
  };

  const onPress = () => {
    Alert.alert(
      'Crear evento',
      'Seguro de compartir la siguiente información?',
      [
        { text: 'Cancel', onPress: () => { }, style: 'cancel' },
        {
          text: 'OK',
          onPress: () => {
            sendMsejrafoToServerAction(token, value, imageAllProperties);
            // clean form
            setImgEvent({});
            setImageAllProperties({});
            onChangeText('');
          },
        },
      ],
      { cancelable: false },
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View
          // eslint-disable-next-line react-native/no-inline-styles
          style={{
            backgroundColor: 'transparent',
            padding: 20,
          }}>
          <UselessTextInput
            multiline
            onChangeText={(text) => onChangeText(text)}
            value={value}
            placeholder="Descripción del evento"
            placeholderTextColor="grey"
          />

          <ButtonCamera
            openPhoto={()=>setVisibleCameraModal(true)}
            sourceImg={imgEvent}
            loading={loading}
            onClose={removeImg}
          />

          <TextButton
            title="Enviar"
            type="default"
            onPress={onPress}
            enable={value && !isFetching ? true : false}
          />

          {/* api result */}
          <View style={styles.containerApiResult}>
            {isFetching ? <ActivityIndicator /> : null}
            <Text style={styles.danger}>{storedError}</Text>
          </View>
        </View>
      </TouchableWithoutFeedback>
      <Modal
        animationType="slide"
        transparent={true}
        visible={visibleCameraModal}
        onRequestClose={() => {
          // Alert.alert("Modal has been closed.");
          // this.setModalVisible(!modalVisible);
          setVisibleCameraModal(false)
        }}

      >
        <View style={{ marginHorizontal: 50, flex: 1, marginVertical: 300, backgroundColor: "white", alignContent: "center" }}>
          <Text style={{ textAlign: "center", fontSize: 18, paddingVertical: 20 }}>Añade una imágen</Text>
          <Icon name="x" size={20} style={{ position: "absolute", top: 2, right: 2 }} onPress={()=>setVisibleCameraModal(false)}/>
          <View style={{ justifyContent: 'space-between', flexDirection: "row", paddingHorizontal: 20 }}>
            <Button
              onPress={() => openPhoto("camera")}
              title="Tomar foto"
              type="clear"
            />
            <Button
              onPress={() => openPhoto("gallery")}
              title="Abrir galería"
              type="clear"
            />
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

SceneNewEvent.defaultProps = {
  storedError: '',
  isFetching: false,
};

SceneNewEvent.propTypes = {
  sendMsejrafoToServerAction: PropTypes.func.isRequired,
  storedError: PropTypes.string,
  isFetching: PropTypes.bool,
  token: PropTypes.string.isRequired,
  navigation: PropTypes.shape({}).isRequired,
};

const mapStateToProps = (state) => ({
  token: state.user.token,
  storedError: state.api.error,
  isFetching: state.api.isFetching,
});

const mapDispatchToProps = (dispatch) => ({
  sendMsejrafoToServerAction: (token, text, image) =>
    dispatch(sendMsejrafoToServer({ token, text, image })),
});

export default connect(mapStateToProps, mapDispatchToProps)(SceneNewEvent);
