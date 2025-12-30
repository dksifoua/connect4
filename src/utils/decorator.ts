import type { Constructor } from "@/lib/ioc/types"
import type { BunRequest } from "bun"
import type { Middleware } from "@/middleware/middleware"
import type { Nullable } from "@/utils/types"
import { container } from "@/app"

export function Use(middlewareClass: Constructor): MethodDecorator {
    return (_target: any, _propertyKey: (string | symbol), descriptor: PropertyDescriptor): PropertyDescriptor => {
        const originalMethod: any = descriptor.value

        descriptor.value = async function (request: BunRequest, ...args: any[]): Promise<any> {
            const middleware = container.resolve(middlewareClass) as Middleware
            const middlewareResponse: Nullable<Response> = await middleware.handle(request)

            if (middlewareResponse) {
                return middlewareResponse
            }

            return originalMethod.apply(this, [request, ...args])
        }

        return descriptor
    }
}