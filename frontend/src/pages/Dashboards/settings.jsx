import { TabsList, Tabs, TabsTrigger, TabsContent } from "@/components/ui/tabs";

function SettingsPage () {
    return(
        <>
            <Tabs defaultValue="Profile" className="w-[400px] p-8">
                <TabsList  className="grid w-full grid-cols-2 ">
                    <TabsTrigger value="Profile">Profile</TabsTrigger>
                    <TabsTrigger value="Theme">Theme</TabsTrigger>
                </TabsList>
                <TabsContent value="Profile">
                    <p>Profile</p>
                </TabsContent>
                <TabsContent value="Theme">
                    <p>Theme</p>
                </TabsContent>
            </Tabs>
        </>
    );
}

export default SettingsPage