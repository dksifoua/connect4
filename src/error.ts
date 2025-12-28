export class UserAlreadyExistsError extends Error {

    constructor(message: string) {
        super(message)

        this.name = "UserAlreadyExistsError"
    }
}

export class UserNotFoundError extends Error {

    constructor(message: string) {
        super(message)

        this.name = "UserNotFoundError"
    }
}

export class UserCredentialsError extends Error {

    constructor(message: string) {
        super(message)

        this.name = "UserCredentialsError"
    }
}

export class UserAlreadyConnectedError extends Error {

    constructor(message: string) {
        super(message)

        this.name = "UserAlreadyConnectedError"
    }
}