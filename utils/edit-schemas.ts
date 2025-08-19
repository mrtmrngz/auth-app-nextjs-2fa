import {z} from "zod";


export const editUsernameSchema = z.object({
    username: z.string({ message: "Username Required" })
})
export type EditUsernameFormValues = z.infer<typeof editUsernameSchema>

export const editProfileSchema = z.object({
    username: z.string().min(1, "Username required").optional(),
    email: z.email({message: "Invalid email"}).optional(),
    password: z.string().min(6, "Password min 6 chars").optional(),
    avatar: z.instanceof(File).optional(),
});

export type EditProfileFormValues = z.infer<typeof editProfileSchema>
