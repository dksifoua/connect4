import type { Container } from "@/lib/ioc/container.ts"

export type Constructor<T = any> = new (...args: any[]) => T

export type Token<T = any> = string | symbol | Constructor<T>

export type Factory<T = any> = (container: Container) => T

export type Provider<T = any> = Constructor<T> | Factory<T>

export type Registration<T = any> = { token: Token<T>, provider: Provider<T> }