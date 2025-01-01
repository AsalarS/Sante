import { useState, useEffect } from "react";
import {
  ColumnDef,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Ellipsis,
  UserRoundPlus,
} from "lucide-react";
import api from "@/api";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import UserDialog from "@/components/Dialogs/userDetailsDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import AddUserDialog from "@/components/Dialogs/add-user-dialog";
import { ChatBubbleAvatar } from "@/components/ui/chat/chat-bubble";

export type User = {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  profile_image: string | undefined;
  gender: string | undefined;
  date_of_birth: string | undefined;
  phone_number: string | undefined;
  address: string | undefined;
};

export const columns = (
  setSelectedUser: (user: User | null) => void,
  setDialogOpen: (open: boolean) => void
): ColumnDef<User>[] => [
    {
      id: "profile_image",
      header: '',
      accessorKey: 'profile_image',

      cell: ({ row }) => (
        <div className="flex items-right">
          <ChatBubbleAvatar
            className="text-foreground bg-muted"
            src={row.original.profile_image}
            fallback={
              row.original.first_name.charAt(0).toUpperCase() +
              row.original.last_name.charAt(0).toUpperCase()
            }
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "email",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Email <ArrowUpDown className="ml-1" />
        </Button>
      ),
      cell: ({ row }) => {
        const email = row.getValue<string | null>("email");
        const first_name = row.getValue<string | null>("first_name");
        const last_name = row.getValue<string | null>("last_name");
        return email ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  {email}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{first_name} {last_name}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          "-"
        );
      },
    },
    {
      accessorKey: "first_name",
      header: "First Name",
      cell: ({ row }) => {
        const firstName = row.getValue<string | null>("first_name");
        return <div className=" line-clamp-1 break-all">{firstName || "-"}</div>;
      },
    },
    {
      accessorKey: "last_name",
      header: "Last Name",
      cell: ({ row }) => {
        const lastName = row.getValue<string | null>("last_name");
        return <div className=" line-clamp-1 break-all">{lastName || "-"}</div>;
      },
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        const role = row.getValue<string | null>("role");
        return <div>{role || "-"}</div>;
      },
    },
    {
      accessorKey: "date_of_birth",
      header: "Date of Birth",
      cell: ({ row }) => {
        const dob = row.getValue<string | null>("date_of_birth");
        return <div>{dob ? new Date(dob).toLocaleDateString() : "-"}</div>;
      },
    },
    {
      accessorKey: "gender",
      header: "Gender",
      cell: ({ row }) => {
        const gender = row.getValue<string | null>("gender");
        return <div>{gender || "-"}</div>;
      },
    },
    {
      accessorKey: "phone_number",
      header: "Phone",
      cell: ({ row }) => {
        const phone = row.getValue<string | null>("phone_number");
        return <div className=" line-clamp-1 break-all">{phone || "-"}</div>;
      },
    },
    {
      accessorKey: "address",
      header: "Address",
      cell: ({ row }) => {
        const address = row.getValue<string | null>("address");
        return <div className=" line-clamp-1 break-all">{address || "-"}</div>;
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const user = row.original;
        const [isAlertOpen, setIsAlertOpen] = useState(false);

        return (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                >
                  <Ellipsis className="text-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedUser(user);
                    setDialogOpen(true); // Open the dialog
                  }}
                >
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-500 focus:text-red-500"
                  onClick={() => setIsAlertOpen(true)}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Alert for deletion */}
            <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
              <AlertDialogContent className="text-foreground">
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the
                    user account.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setIsAlertOpen(false)}>
                    Cancel xz
                  </AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-red-600 hover:bg-red-500"
                    onClick={() => {
                      console.log("User deleted:", row.original);
                      setIsAlertOpen(false);
                    }}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        );
      },
    },
  ];

export function UserAdminPage() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [selectedUser, setSelectedUser] = useState<User | null>(null); // State for the selected user
  const [dialogOpen, setDialogOpen] = useState(false); // State for user details dialog visibility

  const [currentPage, setCurrentPage] = useState(1); // Track current page
  const [totalPages, setTotalPages] = useState(1); // Track total pages

  const fetchUsers = async (page = 1) => { // Fetch all users from the API
    try {
      const response = await api.get("/api/admin/users/", {
        params: { page },
      });
      if (response.status === 200) {

        setUsers(response.data.results);
        setTotalPages(Math.ceil(response.data.count / 10));
      } else {
        console.error("Failed to fetch users:", response.statusText);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage]);

  const handleSaveUser = async (updatedUser: User) => { // Update user details
    try {
      const response = await api.patch(
        `/api/admin/users/${updatedUser.id}/`,
        updatedUser
      );
      if (response.status === 200) {
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === updatedUser.id ? updatedUser : user
          )
        );
        setDialogOpen(false);
        toast.success("User updated successfully!");
      } else {
        console.error("Failed to update user:", response.statusText);
      }
    } catch (error) {
      console.error("Failed to update user:", error);
    }
  };

  const handleRegisterUser = async (registerData: User) => { // Register a new user
    try {
      console.log(registerData);

      const response = await api.post(`api/user/register/admin`, registerData);

      if (response.status === 200 || response.status === 201) {
        setDialogOpen(false);
        toast.success("User added successfully!");
      } else {
        toast.error("Failed to add user: " + response.statusText);
      }
    } catch (error: any) {
      if (error.response.status === 400) {
        toast.error("Missing or incorrect input: " + error.message);
        console.log(error.response);

      } else {
        toast.error("Failed to add user: " + error);
      }
    }
  };

  const table = useReactTable({
    data: users,
    columns: columns(setSelectedUser, setDialogOpen),
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
    },
  });

  const pageCount = table.getPageCount();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full px-4">
      <div className="flex items-center py-4">
        {/* Title */}
        <div className="flex flex-row content-center self-center">
          <h1 className="text-foreground font-bold text-xl ml-1">Users</h1>
        </div>
        <div className="flex flex-row ml-auto gap-4">
          {/* TODO: Add backend based search */}
          <Input
            placeholder="Filter by email..."
            value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("email")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
          <Button
            onClick={() => {
              setDialogOpen(true);
              setSelectedUser(null);
            }}
            className=""
          >
            <UserRoundPlus className="text-white" />
          </Button>
          <AddUserDialog
            open={dialogOpen && !selectedUser}
            onClose={() => { setDialogOpen(false); setSelectedUser(null) }}
            onSave={handleRegisterUser}
          />
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="text-foreground">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-foreground"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {/* Pagination Controls */}
      <div className="flex items-center justify-center py-4 space-x-1">
        <Button
          variant="ghost"
          className="light:text-gray-700 dark:text-gray-200"
          onClick={() => setCurrentPage(1)} // Go to the first page
          disabled={currentPage === 1}
        >
          <ChevronsLeft />
        </Button>
        <Button
          variant="ghost"
          className="light:text-gray-700 dark:text-gray-200"
          onClick={() => setCurrentPage(currentPage - 1)} // Go to the previous page
          disabled={currentPage === 1}
        >
          <ChevronLeft />
        </Button>
        {Array.from({ length: totalPages }, (_, i) => (
          <Button
            key={i}
            variant={currentPage === i + 1 ? "default" : "ghost"}
            onClick={() => setCurrentPage(i + 1)} // Go to the selected page
            className="text-white"
          >
            {i + 1}
          </Button>
        ))}
        <Button
          variant="ghost"
          className="light:text-gray-700 dark:text-gray-200"
          onClick={() => setCurrentPage(currentPage + 1)} // Go to the next page
          disabled={currentPage === totalPages}
        >
          <ChevronRight />
        </Button>
        <Button
          variant="ghost"
          className="light:text-gray-700 dark:text-gray-200"
          onClick={() => setCurrentPage(totalPages)} // Go to the last page
          disabled={currentPage === totalPages}
        >
          <ChevronsRight />
        </Button>
      </div>
      {dialogOpen && selectedUser && (
        <UserDialog
          user={selectedUser}
          open={dialogOpen && selectedUser}
          onClose={() => { setDialogOpen(false); setSelectedUser(null) }}
          onSave={handleSaveUser}
        />
      )}
    </div>
  );
}
