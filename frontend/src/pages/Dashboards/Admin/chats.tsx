import React, { useState, useEffect } from "react";
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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowUpDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Filter, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "@/api";

export type User = {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
};

export type Chat = {
  id: string;
  user1: User;
  user2: User;
  created_date: string;
  last_updated_date: string;
};

export const columns: ColumnDef<Chat>[] = [
  {
    accessorKey: "user1",
    header: "User 1",
    cell: ({ row }) => {
      const user1 = row.getValue<User>("user1");
      return user1 ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className=" line-clamp-1 break-all">
              {user1.email}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{user1.first_name} {user1.last_name}</p>
          </TooltipContent>
        </Tooltip>
      ) : (
        "-"
      );
    },
  },
  {
    accessorKey: "user2",
    header: "User 2",
    cell: ({ row }) => {
      const user2 = row.getValue<User>("user2");
      return user2 ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className=" line-clamp-1 break-all">
              {user2.email}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{user2.first_name} {user2.last_name}</p>
          </TooltipContent>
        </Tooltip>
      ) : (
        "-"
      );
    },
  },
  {
    accessorKey: "created_date",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Created Date <ArrowUpDown className="ml-1" />
      </Button>
    ),
    cell: ({ row }) => {
      const created_date = row.getValue<string>("created_date");
      return <div>{created_date ? new Date(created_date).toLocaleString() : "-"}</div>;
    },
  },
  {
    accessorKey: "last_updated_date",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Last Updated Date <ArrowUpDown className="ml-1" />
      </Button>
    ),
    cell: ({ row }) => {
      const last_updated_date = row.getValue<string>("last_updated_date");
      return <div>{last_updated_date ? new Date(last_updated_date).toLocaleString() : "-"}</div>;
    },
  },
];

export function ChatsAdminPage() {
  const [loading, setLoading] = useState(true);
  const [chats, setChats] = useState<Chat[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1); // Track current page
  const [totalPages, setTotalPages] = useState(1); // Track total pages

  const navigate = useNavigate();

  const fetchChats = async (page = 1, search = "") => {
    try {
      const response = await api.get("/api/admin/chats/", {
        params: { page, search },
      });
      if (response.status === 200) {
        setChats(response.data.results);
        setTotalPages(Math.ceil(response.data.count / 10));
      } else {
        console.error("Failed to fetch chats:", response.statusText);
      }
    } catch (error) {
      console.error("Failed to fetch chats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChats(currentPage, searchQuery);
  }, [currentPage, searchQuery]);

  const table = useReactTable({
    data: chats,
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
    return <Loader2 className="w-6 h-6 animate-spin m-auto" />;
  }

  return (
    <div className="w-full px-4">
      <div className="flex items-center py-4">
        {/* Title */}
        <div className="flex flex-row content-center self-center">
          <h1 className="text-foreground font-bold text-xl ml-1">Chats</h1>
        </div>
        <div className="flex flex-row ml-auto gap-4">
          <Input
            placeholder="Filter by user..."
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
                  onClick={() => navigate(`/admin/chat/messages/${row.original.id}`)} // Navigate to chat messages page
                  className="cursor-pointer"
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