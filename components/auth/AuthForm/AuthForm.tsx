'use client'
import AuthFormImage from "@/components/auth/AuthForm/AuthFormImage";
import {Input} from "@/components/ui/input";
import {FieldValues, FormProvider, Path, UseFormReturn} from "react-hook-form";
import {FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Button} from "@/components/ui/button";
import {Separator} from "@/components/ui/separator";
import Link from "next/link";
import AuthButton from "@/components/ui/AuthButton";

interface AuthFormProps<T extends FieldValues> {
    formType?: "register" | "login";
    handleSubmit: (data: T) => void;
    form: UseFormReturn<T>;
    loading: boolean
}

export default function AuthForm<T extends FieldValues>({formType="register", form, handleSubmit, loading}: AuthFormProps<T>) {

    return (
        <div className="flex h-screen w-screen">
            <div className="form-side flex-1 h-full py-10 px-5 bg-[#1F2937] text-white flex flex-col gap-10">
                <div className="auth-header-wrapper flex flex-col gap-3 text-center">
                    <h2 className="auth-header">{formType === "register" ? "Create Account": "Login" }</h2>
                    <p className="text-[14px] text-zinc-400">
                        {formType === "register" ? "Create a free account now and get started" : "Log in to your account securely"}
                    </p>
                </div>
                <div className="auth-form-wrapper">
                    <FormProvider {...form}>
                        <form className="flex flex-col gap-5" onSubmit={form.handleSubmit(handleSubmit)}>
                            {formType === "register" && (
                                <FormField name={"username" as Path<T>} control={form.control} render={({field}) => (
                                    <FormItem className="auth-form-group">
                                        <FormLabel>Username</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Enter your username" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            )}

                            <FormField name={"email" as Path<T>} control={form.control} render={({field}) => (
                                <FormItem className="auth-form-group">
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="Enter your email" type="email" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />

                            <FormField name={"password" as Path<T>} control={form.control} render={({field}) => (
                                <FormItem className="auth-form-group">
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="Enter your password" type="password" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />

                            {formType === "login" && (
                                <div className="w-full flex justify-end">
                                    <Link className="text-[13px] text-text-color" href="/auth/reset-password">Forgot Password?</Link>
                                </div>
                            )}

                            {formType === "register" && (
                                <FormField name={"confirmPassword" as Path<T>} control={form.control} render={({field}) => (
                                    <FormItem className="auth-form-group">
                                        <FormLabel>Confirm Password</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Please confirm your password!" type="password" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            )}

                            <AuthButton disabled={loading} loading={loading} className="mt-2">
                                {formType === "register" ? "Register": "Login"}
                            </AuthButton>
                        </form>
                    </FormProvider>
                </div>
                <div className="flex flex-col gap-5">
                    <Separator className="bg-gray-500" />
                    <p className="flex gap-2 text-[14px] justify-center text-zinc-500">
                       <span>{formType === "register" ? "Do you already have an account?" : "Don't have an account?"}</span>
                        <Link className="text-text-color font-semibold hover:underline transition-all" href={formType === "register" ? "/auth/login" : "/auth/register"}>
                            {formType === "register" ? "Login" : "Create Account"}
                        </Link>
                    </p>
                </div>
            </div>
            <AuthFormImage />
        </div>
    );
}

