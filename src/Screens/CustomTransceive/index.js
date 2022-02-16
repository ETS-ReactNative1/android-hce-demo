import React from 'react';
import {
  Alert,
  StyleSheet,
  View,
  Text,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import {Button} from 'react-native-paper';
import CustomTransceiveModal from '../../Components/CustomTransceiveModal';
import CommandItem from '../../Components/CustomCommandItem';
import NfcProxy, {setBeforeTransceive} from '../../NfcProxy';
import ScreenHeader from '../../Components/ScreenHeader';
import {NfcTech} from 'react-native-nfc-manager';

function hex2Dec(hexString) {
    let decArray = [];
    let remainingHex = hexString
    while (remainingHex.substr(2).length>=2){
        let firstHex =remainingHex.substr(0,2);
        remainingHex = remainingHex.substr(2)
        decArray.push(firstHex,16)
    }


    return decArray
}

function CustomTransceiveScreen(props) {
  const {params} = props.route;
  const nfcTech = params.savedRecord?.payload.tech || params.nfcTech;
  const [showCommandModal, setShowCommandModal] = React.useState(false);
  const [currEditIdx, setCurrEditIdx] = React.useState(null);
  const [commands, setCommands] = React.useState(
    params.savedRecord?.payload.value ||  [
        // {"payload": ['00','A4','04','00','07','D2','76','00','00','85','01','01','00'], "type": "command"}, //select
        {"payload": [0,164,4,0,14,68 ,50, 55, 54, 48, 48, 48, 48, 56 , 53 ,48 ,49, 48, 49,0], "type": "command"}, //select
        // {"payload": hex2Dec('00A4000C02E103'), "type": "command"}, //select
        // {"payload": hex2Dec('00B000000F'), "type": "command"}, //select
        // {"payload": hex2Dec('00A4000C02E104'), "type": "command"}, //select
        {"payload": hex2Dec('00B0000002'), "type": "command"}, //select
        {"payload": hex2Dec('00B0'), "type": "command"}, //select

      ]
      // [0,164,4,0,14,68 ,50, 55, 54, 48, 48, 48, 48, 56 , 53 ,48 ,49, 48, 49,0],
    // params.savedRecord?.payload.value || ['00','A4','04','00','0E','44' ,'32', '37', '36', '30', '30', '30', '30', '38', '35' ,'30' ,'31', '30', '31','00'],
  );
  console.log('commands',commands)
  const {readOnly, title} = params;
  const [responses, setResponses] = React.useState([]);
  const [currEditParamIdx, setCurrEditParamIdx] = React.useState(null);
  const [editableParameters, setEditableParameters] = React.useState(
    (Array.isArray(params.savedRecord?.parameters) &&
      params.savedRecord.parameters.map((p) => ({...p, payload: []}))) ||
      null,
  );
  const hasCustomExecuteFunc =
    typeof params.savedRecord?.onExecute === 'function';

  React.useEffect(() => {
    if (!showCommandModal) {
      setCurrEditIdx(null);
    }
  }, [showCommandModal]);

  function addCommand(cmd) {
    setCommands([...commands, cmd]);
    setResponses([]);
  }

  function deleteCommand(idx) {
    const nextCommands = [...commands];
    nextCommands.splice(idx, 1);
    setCommands(nextCommands);
    setResponses([]);
  }

  function editCommand(cmd) {
    if (currEditIdx === null) {
      return;
    }
    const nextCommands = [...commands];
    nextCommands[currEditIdx] = cmd;
    setCommands(nextCommands);
    setResponses([]);
  }

  function editParameter(cmd) {
    const nextValues = [...editableParameters];
    nextValues[currEditParamIdx].payload = cmd.payload;
    setEditableParameters(nextValues);

    // apply parameters into command template
    setCommands(
      params.savedRecord.onParameterChanged({
        parameters: nextValues,
        commands,
      }),
    );

    setCurrEditParamIdx(null);
  }

  async function executeCommands() {
    if (hasCustomExecuteFunc) {
      params.savedRecord?.onExecute();
      return;
    }

    let result = [];

    try {
      if (typeof params.savedRecord?.beforeTransceive === 'function') {
        console.warn('setBeforeTransceive');
        setBeforeTransceive(params.savedRecord?.beforeTransceive);
      }

      if (nfcTech === NfcTech.NfcA) {
        result = await NfcProxy.customTransceiveNfcA(
          commands,
          params.savedRecord?.onPostExecute,
        );
      } else if (nfcTech === NfcTech.NfcV) {
        result = await NfcProxy.customTransceiveNfcV(
          commands,
          params.savedRecord?.onPostExecute,
        );
      } else if (nfcTech === NfcTech.IsoDep) {
        result = await NfcProxy.customTransceiveIsoDep(
          commands,
          params.savedRecord?.onPostExecute,
        );
      }
    } catch (ex) {
      console.warn('executeCommands w unexpected ex', ex);
    } finally {
      console.warn('setBeforeTransceive back');
      setBeforeTransceive(null);
    }

    const [success, resps] = result;

    if (!success) {
      Alert.alert('Commands Not Finished', '', [
        {text: 'OK', onPress: () => 0},
      ]);
    }

    setResponses(resps);
  }

  function getRecordPayload() {
    return {
      tech: nfcTech,
      value: commands,
    };
  }

  return (
    <>
      <ScreenHeader
        title={title || params.savedRecord?.name || 'CUSTOM TRANSCEIVE'}
        navigation={props.navigation}
        getRecordPayload={getRecordPayload}
        savedRecord={params.savedRecord}
        savedRecordIdx={params.savedRecordIdx}
        readOnly={readOnly}
      />
      <View style={[styles.wrapper]}>
        {editableParameters && (
          <View style={{padding: 10}}>
            <Text style={{paddingVertical: 10}}>Configurations</Text>
            {editableParameters.map((p, idx) => {
              const hexString = p.payload
                .map((b) => ('00' + b.toString(16)).slice(-2))
                .join(' ');
              return (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                  <Text style={{color: '#888'}}>{p.name}:</Text>
                  <Button
                    onPress={() => {
                      setShowCommandModal(true);
                      setCurrEditParamIdx(idx);
                    }}>
                    {hexString || 'update'}
                  </Button>
                </View>
              );
            })}
          </View>
        )}
        {editableParameters ? (
          <ScrollView style={[styles.wrapper, {padding: 10}]}>
            <View
              style={{
                backgroundColor: 'white',
                borderRadius: 4,
                padding: 10,
              }}>
              <Text>{params.savedRecord?.description || 'No description'}</Text>
            </View>
          </ScrollView>
        ) : (
          <>
            <Text style={{padding: 10}}>Tech / {nfcTech}</Text>
            <ScrollView style={[styles.wrapper, {padding: 10}]}>
              {commands.map((cmd, idx) => (
                <CommandItem
                  cmd={cmd}
                  resp={responses[idx]}
                  key={idx}
                  onDelete={() => deleteCommand(idx)}
                  onEdit={() => {
                    setShowCommandModal(true);
                    setCurrEditIdx(idx);
                  }}
                  readOnly={readOnly}
                />
              ))}
            </ScrollView>
          </>
        )}

        <View style={styles.actionBar}>
          {!readOnly && (
            <Button
              mode="contained"
              style={{marginBottom: 8}}
              onPress={() => setShowCommandModal(true)}>
              ADD
            </Button>
          )}

          <Button
            mode="outlined"
            disabled={commands.length === 0 && !hasCustomExecuteFunc}
            style={{backgroundColor: 'pink'}}
            onPress={executeCommands}>
            EXECUTE
          </Button>
        </View>
        <SafeAreaView />
      </View>

      <CustomTransceiveModal
        cmdType={currEditParamIdx !== null ? 'command' : null}
        isEditing={currEditIdx !== null || currEditParamIdx !== null}
        visible={showCommandModal}
        setVisible={setShowCommandModal}
        editCommand={
          currEditParamIdx !== null
            ? editParameter
            : currEditIdx !== null
            ? editCommand
            : addCommand
        }
      />
    </>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  actionBar: {
    padding: 10,
  },
});

export default CustomTransceiveScreen;
