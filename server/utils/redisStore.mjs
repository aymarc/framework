import { createClient } from 'redis';

export default class RedisStore {
    constructor() {
        const REDIS_PORT = process.env.REDIS_PORT || 6379;
        this.client = createClient({
            socket: {
                port: REDIS_PORT
            }
        });

        this.client.on('error', (err) => {
            console.error("=======Redis Error====", err, "======Redis Error End======");
        });

        this.client.connect(); // Only connect once when the instance is created
    }

    async connectRedis() {
        await this.client.set('started', 'true');
        const hasRedisStarted = await this.client.get('started');
        if (hasRedisStarted === "true") {
            console.info("=========Redis Server Is Ready==============");
        }
    }

    async setInRedis(key, value) {
        try {
            await this.client.set(key, value);
        } catch (err) {
            console.error(`Error setting key ${key} in Redis:`, err);
        }
    }

    async setExInRedis(key, expiry, value) {
        try {
            await this.client.set(key, value);
            await this.client.expire(key, expiry);
        } catch (err) {
            console.error(`Error setting key ${key} with expiry in Redis:`, err);
        }
    }

    async getInRedis(key, json = false) {
        try {
            if (!key) return;
            let res = await this.client.get(key);
            if (json && typeof res === "string") {
                res = JSON.parse(res);
            }
            return res;
        } catch (err) {
            console.error(`Error getting key ${key} from Redis:`, err);
        }
    }

    async delInRedis(key) {
        try {
            await this.client.del(key);
        } catch (err) {
            console.error(`Error deleting key ${key} from Redis:`, err);
        }
    }

    // Optional method to close the connection when needed
    async disconnect() {
        try {
            await this.client.disconnect();
        } catch (err) {
            console.error("Error disconnecting from Redis:", err);
        }
    }
}
