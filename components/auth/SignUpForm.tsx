"use client"

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Field,
    FieldLabel,
    FieldError,
} from "@/components/ui/field";

import * as z from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useState } from "react";
import { LoaderCircle } from "lucide-react";
import toast from "react-hot-toast";
import { AuthFormProps } from "./AuthForm";
import { signup } from "@/actions/auth/auth";


const SignUpForm = ({ setTypeSelected }: AuthFormProps) => {

    const [isLoading, setisLoading] = useState<boolean>(false)

    // ============ Form ============
    const formSchema = z.object({
        name: z.string()
            .min(4, 'El nombre debe tener al menos 4 caracteres')
            .max(20, 'El nombre no puede tener más de 20 caracteres')
            .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras'),

        email: z.email('Por favor ingresa un correo válido. Ejemplo: user@mail.com').min(1, {
            message: 'Este campo es requerido'
        }),
        password: z.string().min(6, {
            message: 'La contraseña debe tener al menos 6 caracteres'
        })
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            email: '',
            password: '',
        }
    })

    const { handleSubmit, control } = form;


    // ============ Sign Up ===========
    const onSubmit = async (user: z.infer<typeof formSchema>) => {
        setisLoading(true);

        try {
            const response = await signup(user);
            if (response.success) {
                toast.success(`Hola, ${user.name}. Te hemos enviado un correo para verificar tu cuenta`, { duration: 4000, icon: '👋' });
                setTypeSelected('sign-in');
                form.reset(); 
            } 

        } catch (error: any) {
            // Manejar errores específicos de Supabase
            if (error.message.includes('User already registered')) {
                toast.error('Este correo electrónico ya está registrado', { duration: 4000 });
            } else if (error.message.includes('Password should be at least 6 characters')) {
                toast.error('La contraseña debe tener al menos 6 caracteres', { duration: 4000 });
            } else if (error.message.includes('Invalid email')) {
                toast.error('Por favor ingresa un correo electrónico válido', { duration: 4000 });
            } else {
                toast.error(error.message || 'Error al registrar el usuario', { duration: 4000 });
            }

        } finally {
            setisLoading(false);
        }
    }

    return (
        <div>
            <div className="w-full backdrop-blur-xl rounded-4xl pb-4">

                <div className="text-center">
                    <h1 className="lg:text-5xl md:text-4xl text-3xl font-semibold text-center my-4">
                        Crear Cuenta
                    </h1>

                    <p className="text-sm text-muted-foreground mb-8">
                        Crea una cuenta para acceder a todo el contenido
                    </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="mx-4">
                        <div className="grid gap-2">

                            {/* ========== Name ========= */}
                            <Controller
                                control={control}
                                name="name"
                                render={({ field, fieldState }) => (
                                    <Field className="mb-3" data-invalid={!!fieldState.error}>
                                        <FieldLabel htmlFor="name">Nombre</FieldLabel>
                                        <Input
                                            {...field}
                                            id="name"
                                            placeholder="John"
                                            type="text"
                                            autoComplete="name"
                                            maxLength={20}
                                            disabled={isLoading}
                                        />
                                        <FieldError errors={fieldState.error ? [fieldState.error] : undefined} />
                                    </Field>
                                )}
                            />

                            {/* ========== Email ========= */}
                            <Controller
                                control={control}
                                name="email"
                                render={({ field, fieldState }) => (
                                    <Field className="mb-3" data-invalid={!!fieldState.error}>
                                        <FieldLabel htmlFor="email">Correo</FieldLabel>
                                        <Input
                                            {...field}
                                            id="email"
                                            placeholder="name@example.com"
                                            type="email"
                                            autoComplete="email"
                                            maxLength={50}
                                            disabled={isLoading}
                                        />
                                        <FieldError errors={fieldState.error ? [fieldState.error] : undefined} />
                                    </Field>
                                )}
                            />

                            {/* ========== Password ========= */}
                            <Controller
                                control={control}
                                name="password"
                                render={({ field, fieldState }) => (
                                    <Field className="mb-3" data-invalid={!!fieldState.error}>
                                        <FieldLabel htmlFor="password">Contraseña</FieldLabel>
                                        <Input
                                            {...field}
                                            id="password"
                                            placeholder="*****"
                                            type="password"
                                            maxLength={50}
                                            disabled={isLoading}
                                        />
                                        <FieldError errors={fieldState.error ? [fieldState.error] : undefined} />
                                    </Field>
                                )}
                            />

                            {/* ========== Submit ========= */}
                            <Button className="mt-6" type="submit" disabled={isLoading}>
                                {isLoading && (
                                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Crear cuenta
                            </Button>

                        </div>
                    </form>

                {/* ========== Sign In ========= */}
                <p className="text-center text-sm mt-6 text-white">
                    ¿Ya tienes una cuenta?{" "}
                    <span
                        onClick={() => !isLoading && setTypeSelected('sign-in')}
                        className="underline underline-offset-4 hover:text-primary cursor-pointer"
                    >
                        Inicia Sesión
                    </span>
                </p>

            </div>
        </div>
    );
}

export default SignUpForm;