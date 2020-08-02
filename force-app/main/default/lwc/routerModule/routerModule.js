/**
* Basic framework to implement routing using History API in Lightning Web Components
* 
* @author  Prashant Kashyap
* @version 1.0
* @since   2020-08-02
* DO NOT MODIFY
*/

/*

    @done : decouple page level component registration using slots
    @done : create component to register page level components and their paths.
    @done : look for solutions to remove getter property bindings currently present in spaRouter, possible solution could be registration component path mapping
    @done : registration component can have multiple templates so it can perform both registration tasks and root component tasks
    @done : add isdefault
    @done : enforce auto redirect for default page
    @done : provide method to get all url params.
    @done : register all paths so when unknown path is entered, system can show 404.
    @done : expose history.state when updating params for routeMeTo()
    @done : routeMeTo - add parameters to add more page params
    @done : add more commments 

    ----------------------------------------------------------------------------------------------

    @toto : Create Readme

    ----------------------------------------------------------------------------------------------

    @nottodo : 

    remarks : works using query parameters, if pages need extra params, dev needs to implement that within component.

        
*/

/* to validate whether a page is registered */
const registeredPages = [];
/* memoizing callback to notify back to root c-router-module component after url change */
let callback;

/*
    running memoized callback to notify root c-router-module component after url change 
*/
const resolveRoutingURL = () => {
    callback.resolveURL.apply(callback.context);
}


/*
    Monkey patching history api's pushstate and added new function pushNewState to get a notification when a url is pushed
*/ 
((history) => { 
    var pushState = history.pushState; 
    history.pushNewState = function(state) { 
        if (typeof history.onpushstate == "function") 
        { 
            history.onpushstate({ 
                state: state 
            }); 
        } 
        return pushState.apply(history, arguments); 
    } 

    // eslint-disable-next-line no-restricted-globals
    history.onpushstate = (e) => {
        try{
            console.log(callback);

            console.log('History has been modified!');
            console.log(e);
            resolveRoutingURL();
        }catch(err){
            console.log(err);
        }
    };


    // eslint-disable-next-line no-restricted-globals
    window.onpopstate = history.onpushstate;


})(window.history);


/*
    method to get all the URL params from current page URL
*/
const getURLParams = () => {
    const parsedURL = new URL(window.location.href);
    console.log(parsedURL.searchParams);
    return parsedURL.searchParams;
}

/*
    method to get current Page name
*/
const getPageName = () => {
    return getURLParams().get('page');
}

/*
    to register a page
*/
const registerRoute = (customURL) => {    
    registeredPages.push(customURL);
}

/*
    to generate page url for routing
*/
const generateURL = (page) =>{
    const parsedURL = new URL(window.location.href);
    let path = parsedURL.origin + parsedURL.pathname;
    const newURL = new URL(path);
    newURL.searchParams.set('page', page);
    return newURL;
}

/*
    to throw 404 when user anters incorrect url
*/
const throw404 = () => {
    const parsedURL = new URL(window.location.href);
    let path = parsedURL.origin + parsedURL.pathname + 'error404pagenotfound';
    window.open(path, '_self');
}

/*
    to add additional params to URL if needed
*/
const addParams = (newURL, params) => {
    Object.keys(params).forEach((key) => {
        newURL.searchParams.set(key, params[key]);
    });
}

/*
    to route to another url
    params : 
        page (String)      : already registered pagename
        pagestate (object) : state object to send info about new page
        params (Object)    : to add aditional page parameters to new url
*/
const routeMeTo = (page, pagestate = {}, params = {} ) => {
    if(registeredPages.includes(page)){
        
        const title = page;
        
        const newURL = generateURL(page);
        addParams(newURL, params);

        // eslint-disable-next-line no-restricted-globals
        history.pushNewState(pagestate, title, newURL);
        
        
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        setTimeout(() => {
            resolveRoutingURL();
        }, 1);
    }else{
        throw404();
    }
}

/*
    to fetch page state of current page
*/
const fetchCurrentPageState = () => {
    // eslint-disable-next-line no-restricted-globals
    return history.state;
}

/*
    to memoize callback to notify root c-router-module component after url change 
*/
const updatedURLCallback = (context, resolveURL) => {
    callback = {
        context : context,
        resolveURL : resolveURL
    }
    
}


/*
    all exports
*/
export {
    routeMeTo,
    getURLParams,
    fetchCurrentPageState,
    getPageName
}

/*
    Object that always gets synced between all c-router-module components to ensure page updation happens after url change
*/
const currentPageName = {
    Name : ''
};

/*
    imports
*/
import { LightningElement, api, track} from 'lwc';
import registerComponent from './registerComponent.html';
import routerModule from './routerModule.html';


/*
    controller for c-router-module root and registrar components
*/
export default class RouterModule extends LightningElement {

    @api registerPage;              //do not register a page in c-router-module root component
    @api isDefault;                 //set to true if this is home

    @track currentPage;             //to store value of current page

    @track currentPageName = currentPageName;           //this object is synced in all c-router-module

    connectedCallback(){
        
        if(!this.registerPage){         //runs for c-router-module root component
            updatedURLCallback(this, this.resolveURL);
            this.resolveURL();
        }
        
        //below runs for c-router-module registrar components
        if(this.registerPage && this.isDefault && !getPageName()){          //to ensure page params are loaded on first page load
            window.open(generateURL(this.registerPage), '_self');           //to ensure URL redirect on back
        }
        
        //below runs for c-router-module registrar components
        if(this.registerPage || this.isDefault){
            console.log(registeredPages);
            registerRoute(this.registerPage);
        }
        console.log(registeredPages);
    }

    /*
        triggers automatic page component rerender after url change
    */
    resolveURL(){
        this.currentPage = getPageName();
        this.currentPageName.Name = this.currentPage;
    }


    /*
        renders routerModule when root component
        renders registerComponent when registrar component
    */
    render(){
        return this.registerPage ? registerComponent : routerModule;
    }

    /*
        shows eligible component on pageload
    */
    get doesPageMatch(){
        let doesPageMatch = false;
        if(this.registerPage === this.currentPageName.Name){
            doesPageMatch = true;
        }
        return doesPageMatch;
    }

}

