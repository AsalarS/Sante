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
  Filter,
  Loader2,
} from "lucide-react";
import api from "@/api";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
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

export const statusColors = {
  Scheduled: "bg-primary/20 text-primary font-semibold",
  Completed: "bg-green-400/20 text-green-400 font-semibold",
  Cancelled: "bg-red-400/20 text-red-400 font-semibold",
  "No Show": "bg-orange-400/20 text-orange-400 font-semibold",
};

export type User = {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
};

export type Appointment = {
  id: string;
  patient: User;
  doctor: User;
  appointment_date: string;
  appointment_time: string;
  status: string;
  notes: string | null;
};

export const columns: ColumnDef<Appointment>[] = [
  {
    accessorKey: "patient",
    header: "Patient",
    cell: ({ row }) => {
      const patient = row.getValue<User>("patient");
      return patient ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              {patient.email}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{patient.first_name} {patient.last_name}</p>
          </TooltipContent>
        </Tooltip>
      ) : (
        "-"
      );
    },
  },
  {
    accessorKey: "doctor",
    header: "Doctor",
    cell: ({ row }) => {
      const doctor = row.getValue<User>("doctor");
      return doctor ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              {doctor.email}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{doctor.first_name} {doctor.last_name}</p>
          </TooltipContent>
        </Tooltip>
      ) : (
        "-"
      );
    },
  },
  {
    accessorKey: "appointment_date",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Appointment Date <ArrowUpDown className="ml-1" />
      </Button>
    ),
    cell: ({ row }) => {
      const appointment_date = row.getValue<string>("appointment_date");
      return <div className="text-center">{appointment_date ? new Date(appointment_date).toLocaleDateString() : "-"}</div>;
    },
  },
  {
    accessorKey: "appointment_time",
    header: "Appointment Time",
    cell: ({ row }) => {
      const appointment_time = row.getValue<string>("appointment_time");
      return (
        <div>
          {appointment_time
            ? new Date(`1970-01-01T${appointment_time}Z`).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })
            : "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <div className="text-center">Status</div>
    ),
    cell: ({ row }) => {
      const status = row.getValue<string>("status");
      return <div className={`px-2 py-1 text-sm  self-center text-center rounded-md ${statusColors[status as keyof typeof statusColors]}`}>{status || "-"}</div>;
    },
  },
  {
    accessorKey: "notes",
    header: "Notes",
    cell: ({ row }) => {
      const notes = row.getValue<string | null>("notes");
      return notes ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <div className="line-clamp-1 break-all">{notes || "-"}</div>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{notes || "-"}</p>
          </TooltipContent>
        </Tooltip>
      ) : (
        "-"
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const appointment = row.original;
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
                  // Handle view details
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
                  appointment.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setIsAlertOpen(false)}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-600 hover:bg-red-500"
                  onClick={() => {
                    console.log("Appointment deleted:", row.original);
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

export function AppointmentsAdminPage() {
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [currentPage, setCurrentPage] = useState(1); // Track current page
  const [totalPages, setTotalPages] = useState(1); // Track total pages

  const fetchAppointments = async (page = 1) => { // Fetch all appointments from the API
    try {
      const response = await api.get("/api/appointments/", {
        params: { page },
      });
      if (response.status === 200) {
        console.log("Fetched appointments:", response.data);
        setAppointments(response.data.results);
        setTotalPages(Math.ceil(response.data.count / 10));
      } else {
        console.error("Failed to fetch appointments:", response.statusText);
      }
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments(currentPage);
  }, [currentPage]);

  const table = useReactTable({
    data: appointments,
    columns,
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
    return <Loader2 className="w-6 h-6 text-primary animate-spin mx-auto my-auto" />;
  }

  return (
    <div className="w-full px-4">
      <div className="flex items-center py-4">
        {/* Title */}
        <div className="flex flex-row content-center self-center">
          <h1 className="text-foreground font-bold text-xl ml-1">Appointments</h1>
        </div>
        <div className="flex flex-row ml-auto gap-4">
          {/* TODO: Add backend based search */}
          <Input
            placeholder="Filter by patient..."
            value={(table.getColumn("patient")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("patient")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
          <Button variant="outline" className="ml-auto">
            <Filter className="text-foreground" />
          </Button>
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
    </div>
  );
}