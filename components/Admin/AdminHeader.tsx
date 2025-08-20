'use client'

import {SidebarTrigger} from "@/components/ui/sidebar";

export default function AdminHeader() {
    return (
        <header className="w-full h-[80px] bg-container-color-1">
            <div className="container h-full mx-auto px-[3%]">
                <div className="h-full w-full flex items-center gap-10">
                    <SidebarTrigger className="text-white" />

                    <div>
                        <h3 className="text-2xl font-semibold text-white">Hello Admin</h3>
                    </div>
                </div>
            </div>
        </header>
    );
}

