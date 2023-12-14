'use strict';

const sourceCoookie = 'X-Source';
const sourceMain = 'main';
const sourceExperiment = 'experiment';
const originSourceMain = 'orangewallcreative.com';
const originSourceExperiment = 'sharingtheflavor.com';

// Origin Request handler
exports.handler = (event, context, callback) => {
    const request = event.Records[0].cf.request;
    const headers = request.headers;

    const source = decideSource(headers);

    // If Source is Experiment, change Origin and Host header
    if ( source === sourceExperiment ) {
        console.log('Setting Origin to experiment origin');
        // Specify Origin
        request.origin = {
            custom: {
                domainName: originSourceExperiment,
                path: '',
                port: 443,
                protocol: 'https',
                keepaliveTimeout: 5,
                readTimeout: 30,
                sslProtocols: [
                'TLSv1',
                'TLSv1.1',
                'TLSv1.2'
                ]
            }
        };

        // Also set Host header to prevent “The request signature we calculated does not match the signature you provided” error
        headers['host'] = [{key: 'host', value: originSourceExperiment }];
    } else {
        console.log('Setting Origin to main origin');
        // Specify Origin
        request.origin = {
            custom: {
                domainName: originSourceMain,
                path: '',
                port: 443,
                protocol: 'https',
                keepaliveTimeout: 5,
                readTimeout: 30,
                sslProtocols: [
                'TLSv1',
                'TLSv1.1',
                'TLSv1.2'
                ]
            }
        };

        // Also set Host header to prevent “The request signature we calculated does not match the signature you provided” error
        headers['host'] = [{key: 'host', value: originSourceMain }];
    }
    // No need to change anything if Source was Main or undefined
    
    callback(null, request);
};


// Decide source based on source cookie.
const decideSource = function(headers) {
    const sourceMainCookie = `${sourceCoookie}=${sourceMain}`;
    const sourceExperimenCookie = `${sourceCoookie}=${sourceExperiment}`;
    
    // Remember a single cookie header entry may contains multiple cookies
    if (headers.cookie) {
        console.log('Cookies: ');
        console.log(headers.cookie);
        // ...ugly but simple enough for now
        for (let i = 0; i < headers.cookie.length; i++) {        
            if (headers.cookie[i].value.indexOf(sourceExperimenCookie) >= 0) {
                console.log('Experiment Source cookie found');
                return sourceExperiment;
            }
            if (headers.cookie[i].value.indexOf(sourceMainCookie) >= 0) {
                console.log('Main Source cookie found');
                return sourceMain;
            }            
        }
    }
    console.log('No Source cookie found (Origin undecided)');
}