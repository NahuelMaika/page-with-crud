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

import Link from "next/link";
import { updatePassword } from "@/actions/auth/auth";
import { useRouter } from "next/navigation";


const UpdatePasswordForm = () => {
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const router = useRouter();

    const formSchema = z.object({
        password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
        confirmPassword: z.string()
    }).refine((data) => data.password === data.confirmPassword, {
        message: "Las contraseñas no coinciden",
        path: ["confirmPassword"],
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            password: '',
            confirmPassword: ''
        }
    })

    const { handleSubmit, control } = form;

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        setIsLoading(true);

        try {

            const response = await updatePassword(data);
            if(response.success) {
                toast.success(response.message || 'Contraseña actualizada correctamente', { duration: 2500 });
                router.push('/profile');
            } else {
                toast.error(response.error || 'Error al actualizar la contraseña', { duration: 2500 });
            }
        } catch (error: any) {
            toast.error(error.message, { duration: 2500 });
        } finally {
            setIsLoading(false);
        }
    }


    return (
        <div className="w-full max-w-md backdrop-blur-xl bg-background py-6 rounded-4xl lg:border lg:border-white/50">
            <div className="rounded-xl px-6">
                <div className="text-center">
                    <h1 className="text-3xl font-semibold text-center my-4">
                        Nueva Contraseña
                    </h1>
                    <p className="text-sm text-muted-foreground mb-8">
                        Ingresa tu nueva contraseña
                    </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid gap-2">
                        {/* ========== Password ========= */}
                        <Controller
                            control={control}
                            name="password"
                            render={({ field, fieldState }) => (
                                <Field className="mb-3" data-invalid={!!fieldState.error}>
                                    <FieldLabel htmlFor="password">Nueva Contraseña</FieldLabel>
                                    <Input
                                        {...field}
                                        id="password"
                                        type="password"
                                        autoComplete="new-password"
                                        disabled={isLoading}
                                    />
                                    <FieldError errors={fieldState.error ? [fieldState.error] : undefined} />
                                </Field>
                            )}
                        />

                        {/* ========== Confirm Password ========= */}
                        <Controller
                            control={control}
                            name="confirmPassword"
                            render={({ field, fieldState }) => (
                                <Field className="mb-3" data-invalid={!!fieldState.error}>
                                    <FieldLabel htmlFor="confirmPassword">Confirmar Contraseña</FieldLabel>
                                    <Input
                                        {...field}
                                        id="confirmPassword"
                                        type="password"
                                        autoComplete="new-password"
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
                            Actualizar Contraseña
                        </Button>

                        {/* ========== Volver ========= */}
                        <Link href="/profile" className="text-center text-sm text-white mt-3 underline underline-offset-4 hover:text-primary cursor-pointer">
                            Volver
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default UpdatePasswordForm;