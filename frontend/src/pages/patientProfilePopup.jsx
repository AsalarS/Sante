export default function PatientProfilePopup() {
    return(
        <Card className=" bg-background rounded-lg flex flex-col border-none h-fit">
            <CardHeader className="flex flex-row justify-between">
              <div className="flex items-center space-x-2">
                <Avatar className="size-12 mr-2">
                  <AvatarImage src="link" alt="Profile Image" />
                  <AvatarFallback className="bg-muted text-foreground">
                    {`${patient?.first_name.charAt(0).toUpperCase()}${patient?.last_name.charAt(0).toUpperCase()}`}
                  </AvatarFallback>
                </Avatar>
                <Label className="text-2xl font-semibold text-foreground line-clamp-1 break-all">
                  {patient?.first_name} {patient?.last_name}
                </Label>
              </div>
              {(userRole === "doctor" || userRole === "receptionist") && (
                <Button onClick={() => setDialogOpen(true)}>Edit</Button>
              )}
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div>
                  <label className="block text-gray-500 text-sm">Address</label>
                  <span>{patient?.address || "None"}</span>
                </div>
                <div>
                  <label className="block text-gray-500 text-sm">Age</label>
                  <span>{calculateAge(patient?.date_of_birth) || "None"}</span>
                </div>
                <div>
                  <label className="block text-gray-500 text-sm">
                    Date of Birth
                  </label>
                  <span>{patient?.date_of_birth || "None"}</span>
                </div>
                <div>
                  <label className="block text-gray-500 text-sm">
                    Blood Type
                  </label>
                  <span>{patient?.blood_type || "None"}</span>
                </div>
                <div>
                  <label className="block text-gray-500 text-sm">CPR</label>
                  <span>{patient?.CPR_number || "None"}</span>
                </div>
                <div>
                  <label className="block text-gray-500 text-sm">
                    Emergency Contact Name
                  </label>
                  <span>{patient?.emergency_contact_name || "None"}</span>
                </div>
                <div>
                  <label className="block text-gray-500 text-sm">
                    Emergency Contact Number
                  </label>
                  <span>{patient?.emergency_contact_phone || "None"}</span>
                </div>
                <div>
                  <label className="block text-gray-500 text-sm">Gender</label>
                  <span>{patient?.gender || "None"}</span>
                </div>
                <div>
                  <label className="block text-gray-500 text-sm">
                    Place of Birth
                  </label>
                  <span>{patient?.place_of_birth || "None"}</span>
                </div>
                <div>
                  <label className="block text-gray-500 text-sm">
                    Religion
                  </label>
                  <span>{patient?.religion || "None"}</span>
                </div>
              </div>
            </CardContent>
          </Card>
    );   
}