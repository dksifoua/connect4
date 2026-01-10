import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { z } from "zod"

const FormValuesSchema = z.object({
    username: z.string().min(3),
    password: z.string().min(3),
    confirmedPassword: z.string().min(3)
}).refine((data): boolean => {
    return data.password === data.confirmedPassword
}, {
    message: "Passwords do not match",
    path: ["password", "confirmedPassword"]
})
type FormValues = z.infer<typeof FormValuesSchema>

export function SignUp({ ...props }: React.ComponentProps<typeof Card>): React.JSX.Element {

    const [formValues, setFormValues] = React.useState<FormValues>({
        username: '',
        password: '',
        confirmedPassword: ''
    })

    async function formAction(formData: FormData): Promise<void> {
        const parsedFormValues = FormValuesSchema.safeParse(Object.fromEntries(formData))
        if (!parsedFormValues.success) {
            console.error("Form validation failed", parsedFormValues.error)
            return
        }
        setFormValues((prev: FormValues): FormValues => ({ ...prev, ...parsedFormValues.data }))
        console.log(formValues)
    }

    return (
        <Card {...props}>
            <CardHeader>
                <CardTitle>Create an account</CardTitle>
                <CardDescription>
                    Fill the form below to create your account
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form action={formAction}>
                    <FieldGroup>
                        <Field>
                            <FieldLabel htmlFor="username">Username</FieldLabel>
                            <Input id="username" name="username" type="text"/>
                            <FieldDescription></FieldDescription>
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="password">Password</FieldLabel>
                            <Input id="password" name="password" type="password" required/>
                            <FieldDescription></FieldDescription>
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="confirm-password">
                                Confirm Password
                            </FieldLabel>
                            <Input id="confirm-password" name="confirmedPassword" type="password" required/>
                            <FieldDescription></FieldDescription>
                        </Field>
                        <FieldGroup>
                            <Field>
                                <Button type="submit">Create Account</Button>
                                <FieldDescription className="px-6 text-center">
                                    Already have an account? <a href="#">Sign in</a>
                                </FieldDescription>
                            </Field>
                        </FieldGroup>
                    </FieldGroup>
                </form>
            </CardContent>
        </Card>
    )
}