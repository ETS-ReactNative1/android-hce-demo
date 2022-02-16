import React, {Component} from 'react';
import {Linking, Platform, ScrollView, Text, TextInput, TouchableOpacity, View,} from 'react-native';
import NfcManager, {Ndef} from 'react-native-nfc-manager';

export const RtdType = {
    URL: 0,
    TEXT: 1,
};



class AndroidBeam {
    constructor() {
        this.isRunning = false
    }
    buildUrlPayload(valueToWrite) {
        return Ndef.encodeMessage([
            Ndef.uriRecord(valueToWrite),
        ]);
    }

    buildTextPayload(valueToWrite) {
        return Ndef.encodeMessage([
            Ndef.textRecord(valueToWrite),
        ]);
    }

    requestAndroidBeam({rtdType,data}) {
        if (this.isRunning) {
            return;
        }

        let bytes;

        if (rtdType === RtdType.URL) {
            bytes = this.buildUrlPayload(data);
        } else if (rtdType === RtdType.TEXT) {
            bytes = this.buildTextPayload(data);
        }

        this.isRunning = true
        NfcManager.setNdefPushMessage(bytes)
            .then(() => console.log('beam request completed'))
            .catch(err => {
                this.isRunning = false
                console.warn(err)
            })
    }

    cancelAndroidBeam(){
        if(this.isRunning){
            NfcManager.setNdefPushMessage(null)
                .then(() => {
                    this.isRunning = false
                    console.log('beam cancelled')
                })
                .catch(err => console.warn(err))
        }
    }
}

export default AndroidBeam;
