import { useState, useEffect } from "react";
import {
  ColumnDef,
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
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
import { ArrowUpDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Loader2 } from "lucide-react";
import api from "@/api";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export type Doctor = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  specialization: string;
  available_days: string[];
  shift_start: string;
  shift_end: string;
  office_number: string;
};

export const columns: ColumnDef<Doctor>[] = [
  {
    accessorKey: "first_name",
    header: "First Name",
    cell: ({ row }) => <div>{row.getValue<string>("first_name")}</div>,
  },
  {
    accessorKey: "last_name",
    header: "Last Name",
    cell: ({ row }) => <div>{row.getValue<string>("last_name")}</div>,
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
      return email ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="line-clamp-1 break-all">
              {email}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{email}</p>
          </TooltipContent>
        </Tooltip>
      ) : (
        "-"
      );
    },
  },
  {
    accessorKey: "specialization",
    header: "Specialization",
    cell: ({ row }) => {
      const specialization = row.getValue<string | null>("specialization");
      return specialization ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="line-clamp-1 break-all">
              {specialization}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{specialization}</p>
          </TooltipContent>
        </Tooltip>
      ) : (
        "-"
      );
    },
  },
  {
    accessorKey: "available_days",
    header: "Available Days",
    cell: ({ row }) => {
      const availableDays = row.getValue<string[] | null>("available_days");
      return availableDays ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="line-clamp-1 break-all">
              {availableDays.join(", ")}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{availableDays.join(", ")}</p>
          </TooltipContent>
        </Tooltip>
      ) : (
        "-"
      );
    },
  },
  {
    accessorKey: "office_number",
    header: "Office Number",
    cell: ({ row }) => {
      const officeNumber = row.getValue<string | null>("office_number");
      return officeNumber ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="line-clamp-1 break-all">
              {officeNumber}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{officeNumber}</p>
          </TooltipContent>
        </Tooltip>
      ) : (
        "-"
      );
    },
  },
];

export default function ReceptionistDoctors() {
  const [loading, setLoading] = useState(true);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState(""); // New state for search query
  const navigate = useNavigate();

  const fetchDoctors = async (page = 1, search = "") => {
    try {
      const response = await api.get("/api/users/doctors/", {
        params: { page, search }, // Include search in API request
      });
      if (response.status === 200) {
        setDoctors(response.data.results);
        setTotalPages(Math.ceil(response.data.count / 10));
      } else {
        console.error("Failed to fetch doctors:", response.statusText);
      }
    } catch (error) {
      console.error("Failed to fetch doctors:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors(currentPage, searchQuery); // Trigger fetch on search query change
  }, [currentPage, searchQuery]);

  const table = useReactTable({
    data: doctors,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (loading) {
    return <Loader2 className="w-6 h-6 text-primary animate-spin mx-auto my-auto" />;
  }

  return (
    <div className="w-full px-4">
      <div className="flex items-center py-4">
        <h1 className="text-foreground font-bold text-xl ml-1">Doctors</h1>
        <div className="flex flex-row ml-auto gap-4">
          <Input
            placeholder="Search by name, email, or specialization..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)} 
            className="w-72"
          />
        </div>
      </div>
      <div className="rounded-md border border-border">
        <Table className="border-border">
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
                <TableRow key={row.id} onClick={() => navigate(`/receptionist/schedule/${row.original.id}`)}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="text-foreground">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-foreground">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-center py-4 space-x-1 text-foreground">
        <Button
          variant="ghost"
          onClick={() => setCurrentPage(1)}
          disabled={currentPage === 1}
        >
          <ChevronsLeft />
        </Button>
        <Button
          variant="ghost"
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft />
        </Button>
        {Array.from({ length: totalPages }, (_, i) => (
          <Button
            key={i}
            variant={currentPage === i + 1 ? "default" : "ghost"}
            onClick={() => setCurrentPage(i + 1)}
          >
            {i + 1}
          </Button>
        ))}
        <Button
          variant="ghost"
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <ChevronRight />
        </Button>
        <Button
          variant="ghost"
          onClick={() => setCurrentPage(totalPages)}
          disabled={currentPage === totalPages}
        >
          <ChevronsRight />
        </Button>
      </div>
    </div>
  );
}