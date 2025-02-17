import Redis from 'ioredis'

// use Singleton to create global redis client
class RedisClient{
    private static instace: Redis;

    public static getInstance(): Redis{
        if(!this.instace){
            this.instace = new Redis({
                host: "localhost", // host of redis
                port: 8001, // port of redis
                tls: {} // TODO: ? whats
            })
        }

        return this.instace
    }
}

export default RedisClient;