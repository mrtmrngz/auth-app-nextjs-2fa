'use client'

import {useMutation, useQuery} from "@tanstack/react-query";
import {useParams, useRouter} from "next/navigation";
import {apiRequest} from "@/libs/apiRequest";
import {z} from "zod";
import {FormProvider, Path, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import Image from "next/image";
import {useEffect, useState} from "react";
import {FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Button} from "@/components/ui/button";

const formSchema = z.object({
    username: z.string().min(3, "Username must be minimum 3 character!").optional(),
    email: z.email({message: "Invalid Email Type"}).optional(),
    role: z.enum(["USER", "ADMIN"]).optional(),
})

type UserFormValues = z.infer<typeof formSchema>

export default function UpdateUserPage() {

    const {id} = useParams()
    const router = useRouter()
    const [currAvatar, setCurrAvatar] = useState("https://res.cloudinary.com/mertmarangoz/image/upload/v1755548317/user-icon_nethan.jpg")

    const {data, isError, isPending, isFetching} = useQuery({
        queryKey: ['users', id],
        queryFn: async () => {
            const res = await apiRequest.get(`/admin/user-edit-info/${id}`)
            return res.data
        },
    })

    const form = useForm<UserFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: data && data.user?.username ? data.user.username : "",
            email: data && data.user?.email ? data.user.email : "",
            role: undefined
        }
    })

    useEffect(() => {
        if (data && data.user) {
            setCurrAvatar(data?.user?.avatar?.url || "https://res.cloudinary.com/mertmarangoz/image/upload/v1755548317/user-icon_nethan.jpg")
        }
    }, [data])

    useEffect(() => {
        if (data?.user) {
            form.reset({
                username: data.user.username || "",
                email: data.user.email || "",
                role: data.user.role || "USER",
            })
        }
    }, [data, form])

    const handleSubmit = (values: any) => {
        const formData = new FormData()
        if (data) {
            if (form.getValues('email') && form.getValues('email') !== data.user?.email) formData.append('email', values.email)
            if (form.getValues('username') && form.getValues('username') !== data.user?.username) formData.append('username', values.username)
            if (form.getValues('role') && form.getValues('role').toUpperCase() !== data.user?.role.toUpperCase()) formData.append('role', values.role)
        }

        console.log(Object.fromEntries(formData))
    }

    console.log(data)

    if (isFetching || isPending) return <h1>Loading....</h1>

    if ((!isPending || !isFetching) && isError) {
        return router.replace("/admin/users")
    }

    return (
        <div className="px-[3%] flex flex-col gap-5">

            <div className="avatar-side w-full flex flex-col gap-3 items-center justify-center">
                <div className="h-[150px] w-[150px] mt-7 relative overflow-hidden rounded-full">
                    <Image priority src={currAvatar} alt={data?.user?.username} width={150} height={150}/>
                </div>
                <label className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded">
                    Upload
                    <input type="file" accept="image/*" className="hidden"/>
                </label>
            </div>

            <FormProvider {...form} >
                <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col gap-3">
                    <FormField name={"username"} control={form.control} render={({field}) => (
                        <FormItem className="auth-form-group">
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                                <Input {...field} value={field.value} placeholder="Enter your username"
                                       className="text-white"/>
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}/>

                    <FormField name={"email"} control={form.control} render={({field}) => (
                        <FormItem className="auth-form-group">
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input {...field} placeholder="Enter your email" type="email" className="text-white"/>
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}/>

                    <FormField
                        name="role"
                        control={form.control}
                        render={({field}) => (
                            <FormItem>
                                <FormLabel className="text-zinc-300">Role</FormLabel>
                                <FormControl>
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                    >
                                        <SelectTrigger className="w-full text-white placeholder:text-white">
                                            <SelectValue placeholder="Select role"
                                                         className="text-white [&>span]:text-white"/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="USER">USER</SelectItem>
                                            <SelectItem value="ADMIN">ADMIN</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    <Button className="!bg-orange-400">Update User</Button>
                </form>
            </FormProvider>
        </div>
    );
}

