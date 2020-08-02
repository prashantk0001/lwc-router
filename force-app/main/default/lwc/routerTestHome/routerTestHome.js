import { LightningElement } from 'lwc';
import {routeMeTo} from 'c/routerModule';

export default class RouterTestHome extends LightningElement {

    gotocontact(){
        routeMeTo('contacts', {}, { listview : 1 });
        //resultant url: "/SimpleRouterApp.app?page=contacts&listview=1"
        
    }

    wrongurl(){
        routeMeTo('fakeurl');
        //throws error since page is not registered
    }
}