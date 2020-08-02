import { LightningElement, track } from 'lwc';
import getContacts from '@salesforce/apex/ApexMethods.getContacts';
import {routeMeTo} from 'c/routerModule';

export default class RouterTestContacts extends LightningElement {

    @track contacts;

    connectedCallback(){
        getContacts().then(response => {
            this.contacts = response;
        });
    }

    gotohome(){
        routeMeTo('home');
    }
}