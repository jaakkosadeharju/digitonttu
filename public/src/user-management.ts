let AmazonCognitoIdentity = require('amazon-cognito-identity-js');
import AppConfig from "./app-config";

export class UserManagement {
    getLoginDetails(): any {
        return JSON.parse(localStorage.getItem('loginDetails'));
    }

    registerUser(email: string, password: string, nickname: string): void {
        var poolData = {
            UserPoolId: AppConfig.authentication.userPoolId,
            ClientId: AppConfig.authentication.clientId
        };

        var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
        var attributeList = [];

        var dataEmail = {
            Name: 'email',
            Value: email
        };

        var dataNickname = {
            Name: 'nickname',
            Value: nickname
        };

        var attributeEmail = new AmazonCognitoIdentity.CognitoUserAttribute(dataEmail);
        var attributeNickname = new AmazonCognitoIdentity.CognitoUserAttribute(dataNickname);

        attributeList.push(attributeEmail);
        attributeList.push(attributeNickname);

        userPool.signUp(email, password, attributeList, null, (error: any, result: any) => {
            if (error) {
                console.log(error);
                return;
            }

            let cognitoUser = result.user;
            console.log('Registered ' + cognitoUser.getUsername());
        });

        // UsernameExistsException
    }

    login(username: string, password: string) {
        var authenticationData = {
            Username: username,
            Password: password,
        };
        var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(authenticationData);
        var poolData = {
            UserPoolId: AppConfig.authentication.userPoolId,
            ClientId: AppConfig.authentication.clientId
        };
        var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
        var userData = {
            Username: username,
            Pool: userPool
        };
        var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: (result: any) => {
                localStorage.setItem('loginDetails', JSON.stringify({
                    username: username,
                    token: result.accessToken.jwtToken,
                    refreshToken: result.refreshToken.token,
                    idToken: result.idToken.jwtToken
                }));
            },

            onFailure: (error: any) => {
                console.log(error);
            },

        });
    }


    refreshSession() {
        const loginDetails = JSON.parse(localStorage.getItem('loginDetails'));

        var userPool = new AmazonCognitoIdentity.CognitoUserPool({
            UserPoolId: AppConfig.authentication.userPoolId,
            ClientId: AppConfig.authentication.clientId
        });
        var cognitoUser = new AmazonCognitoIdentity.CognitoUser({
            Username: loginDetails.username,
            Pool: userPool
        });

        if (!loginDetails) {
            return;
        }

        var refreshToken = new AmazonCognitoIdentity.CognitoRefreshToken({
            RefreshToken: loginDetails.refreshToken
        });

        cognitoUser.refreshSession(refreshToken, (error: any, result: any) => {
            if (error) {
                console.log(error);
                return;
            }

            console.log("refresh", result.accessToken.jwtToken);
            localStorage.setItem('loginDetails', JSON.stringify({
                ...loginDetails,
                token: result.accessToken.jwtToken,
                refreshToken: result.refreshToken.token,
                idToken: result.idToken.jwtToken
            }));
        });
    }
}

