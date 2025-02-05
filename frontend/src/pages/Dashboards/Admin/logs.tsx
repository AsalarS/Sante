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
import { ArrowUpDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Filter, Loader2 } from "lucide-react";
import api from "@/api";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";


export type User = {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
};

export type Log = {
  id: number;
  user: User;
  action: string;
  timestamp: string;
  ip_address: string;
  description: string;
};

export const columns: ColumnDef<Log>[] = [
  {
    accessorKey: "user",
    header: "User",
    cell: ({ row }) => {
      const user = row.getValue<User>("user");

      return user ? (
        <Tooltip>
            <TooltipTrigger asChild>
              <div className=" line-clamp-1 break-all">
                {user.email}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{user.first_name} {user.last_name}</p>
            </TooltipContent>
          </Tooltip>
      ) : (
        "-"
      );
    },
  },
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => <div className=" line-clamp-1 break-all">{row.getValue<string>("action") || "-"}</div>,
  },
  {
    accessorKey: "timestamp",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Timestamp <ArrowUpDown className="ml-1" />
      </Button>
    ),
    cell: ({ row }) => {
      const timestamp = row.getValue<string>("timestamp");
      return <div>{timestamp ? new Date(timestamp).toLocaleString() : "-"}</div>;
    },
  },
  {
    accessorKey: "ip_address",
    header: "IP Address",
    cell: ({ row }) => <div>{row.getValue<string>("ip_address") || "-"}</div>,
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => <div className=" line-clamp-1 break-all">{row.getValue<string>("description") || "-"}</div>,
  },
];

export function LogAdminPage() {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<Log[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [searchQuery, setSearchQuery] = useState(""); // State for search query

  const [currentPage, setCurrentPage] = useState(1); // Track current page
  const [totalPages, setTotalPages] = useState(1); // Track total pages


  const fetchLogs = async (page = 1, search = "") => { // Fetch all logs from the API
    try {
      const response = await api.get("/api/logs/admin/", {
        params: { page, search },
      });
      if (response.status === 200) {
        setLogs(response.data.results);
        setTotalPages(Math.ceil(response.data.count / 10));
      } else {
        console.error("Failed to fetch logs:", response.statusText);
      }
    } catch (error) {
      console.error("Failed to fetch logs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(currentPage, searchQuery);
  }, [currentPage, searchQuery]);

  const table = useReactTable({
    data: logs,
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
          <h1 className="text-foreground font-bold text-xl ml-1">Logs</h1>
        </div>
        <div className="flex flex-row ml-auto gap-4">
          <Input
            placeholder="Search logs..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="max-w-sm"
          />
        </div>
      </div>
      <div className="rounded-md border border-border">
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
                <TableCell colSpan={columns.length} className="h-24 text-center text-foreground">
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
