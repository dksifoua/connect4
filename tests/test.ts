import config from "../config.yaml"

console.log(config)

/*
@Injectable()
class ConfigService {

    public getConfig() {
        return { env: "production" };
    }
}

container.register("url", () => "http://localhost:3000")

@Injectable()
class LibService {
    private readonly configService: ConfigService
    private readonly url: string

    constructor(configService: ConfigService, @Inject("url") url: string) {
        this.configService = configService
        this.url = url
    }

    public getConfig() {
        return JSON.stringify(this.configService.getConfig()) + " " + this.url
    }
}

const libService = container.resolve(LibService)

console.log(libService.getConfig())
 */