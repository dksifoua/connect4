export type ClassMethods<Class> = {
    [Method in keyof Class]: Class[Method] extends Function ? Class[Method] : never
}