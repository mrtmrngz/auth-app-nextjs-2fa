import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileBody from "@/components/profile/ProfileBody";
import {Metadata} from "next";


export async function generateMetadata(): Promise<Metadata>{
    return {
        title: "Auth App | Profile"
    }
}


export default function Home() {


    return (
        <>
            <ProfileHeader />
            <ProfileBody />
        </>
    );
}
