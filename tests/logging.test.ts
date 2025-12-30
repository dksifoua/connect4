import { Logging } from "@/lib/logging"
import { Container } from "@/lib/ioc/container"

const logger = new Logging("UserRepository","debug")

logger.debug("This is a debug message")
logger.info("This is an info message")
logger.warn("This is a warning message")
logger.error("This is an error message")

const container = new Container()
container.resolve(Logging)

