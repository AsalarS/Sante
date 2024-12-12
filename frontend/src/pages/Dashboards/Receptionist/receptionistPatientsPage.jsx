import CompactListBox from "@/components/compactListBox";
import PatientList from "@/components/patientList"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Copy, Ellipsis } from "lucide-react";
import { useNavigate } from "react-router-dom";

function ReceptionistPatientProfile() {
    const statusColors = {
        Scheduled: "bg-primary/20 text-primary font-semibold",
        Completed: "bg-green-400/20 text-green-400 font-semibold",
        Canceled: "bg-red-400/20 text-red-400 font-semibold",
    };

    return (
        <>
        </>
    )
}

export default ReceptionistPatientProfile