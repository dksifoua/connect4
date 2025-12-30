import type { Token } from "@/lib/ioc/types.ts"

export function Injectable(token?: Token): ClassDecorator {
    return (target: any): void => {
        Reflect.defineMetadata("ioc:injectable", true, target)
        if (token) {
            Reflect.defineMetadata("ioc:token", token, target)
        }
    }
}

export function Inject(token?: Token): ParameterDecorator {
    return (target: Object, _propertyKey: (string | symbol | undefined), parameterIndex: number): void => {
        const injectTokens: any = Reflect.getMetadata("inject:tokens", target) || []
        injectTokens[parameterIndex] = token || Reflect.getMetadata("design:paramtypes", target)[parameterIndex]

        Reflect.defineMetadata("inject:tokens", injectTokens, target)
    }
}