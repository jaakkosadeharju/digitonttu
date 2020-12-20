const axios = require('axios');
import AppConfig from "./app-config";
import { UserManagement } from "./user-management";

export class Api {
    userManagement: UserManagement;

    constructor() {
        this.userManagement = new UserManagement();
    }

    token(): string {
        return this.userManagement.getLoginDetails().idToken;
    }

    // Save score
    public submitScore(username: string, score: number, stats: string, startTime: Date, endTime: Date): Promise<any> {
        console.log(username, score, stats);

        const params = { 
            username,
            score,
            stats,
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString() };
        const options = {
            headers: {
                'Authorization': this.token()
            }
        };

        return axios.post(`${AppConfig.api.invokeUrl}/digitonttusaveresult`, params, options);
    }

    public getTop100(): Promise<any[]> {
        return axios.get(`${AppConfig.api.invokeUrl}/digitonttugettop100`);
    }
}