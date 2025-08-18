'use client'
import {ReactNode} from "react";
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import {AuthProvider} from "@/providers/AuthProvider";

export default function MainProvider({children}: {children: ReactNode}) {

    const queryClient = new QueryClient()

    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                {children}
            </AuthProvider>
        </QueryClientProvider>
    );
}

