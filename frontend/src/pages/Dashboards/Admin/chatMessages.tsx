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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowUpDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Filter, Loader2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useNavigate, useParams } from "react-router-dom";
import api from "@/api";

export type User = {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
};

export type ChatMessage = {
  id: string;
  sender: User;
  message_text: string;
  timestamp: string;
  is_read: boolean;
};

export const columns: ColumnDef<ChatMessage>[] = [
  {
    accessorKey: "message_text",
    header: "Message",
    cell: ({ row }) => {
      const message_text = row.getValue<string>("message_text");
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className=" line-clamp-1 break-all">{message_text}</div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{message_text}</p>
          </TooltipContent>
        </Tooltip>
      );
    },
  },
  {
    accessorKey: "sender",
    header: "Sender",
    cell: ({ row }) => {
      const sender = row.getValue<User>("sender");
      return sender ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              {sender.email}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{sender.first_name} {sender.last_name}</p>
          </TooltipContent>
        </Tooltip>
      ) : (
        "-"
      );
    },
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
    accessorKey: "is_read",
    header: () => (
      <div className="text-center">Read Status</div>
    ),
    cell: ({ row }) => {
      const is_read = row.getValue<boolean>("is_read");
      return (
        <div className={`px-2 py-1 text-center rounded-md ${is_read ? "bg-primary/20 text-primary" : "bg-chart-5/20 text-chart-5"}`}>
          {is_read ? "Read" : "Unread"}
        </div>
      );
    },
  },
];

export function ChatMessagesPage() {
  const { chatID } = useParams();
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [currentPage, setCurrentPage] = useState(1); // Track current page
  const [totalPages, setTotalPages] = useState(1); // Track total pages

  const navigate = useNavigate();

  const fetchMessages = async (page = 1) => {
    try {
      const response = await api.get(`/api/admin/chat/${chatID}/messages/`, {
        params: { page },
      });
      if (response.status === 200) {
        console.log("Fetched messages:", response.data);
        setMessages(response.data.results);
        setTotalPages(Math.ceil(response.data.count / 10));
      } else {
        console.error("Failed to fetch messages:", response.statusText);
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages(currentPage);
  }, [currentPage, chatID]);

  const table = useReactTable({
    data: messages,
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
    return <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto my-auto" />;
  }

  return (
    <div className="w-full px-4">
      <div className="flex items-center py-4">
        {/* Title */}
        <div className="flex text-foreground bg-btn-normal rounded-md mr-4 items-center p-1 hover:bg-btn-normal/80 w-fit"
          onClick={() => {
            if (window.history.length > 1) {
              // Go back to the previous page
              navigate(-1);
            } else {
              // If there's no history, navigate to the /patients page
              navigate('/chat');
            }
          }}>
          <ChevronLeft size={24} />
        </div>
        <div className="flex flex-row content-center self-center">
          <h1 className="text-foreground font-bold text-xl ml-1">Chat Messages</h1>
        </div>
        <div className="flex flex-row ml-auto gap-4">
          {/* TODO: Make search work */}
          <Input
            placeholder="Filter by sender..."
            value={(table.getColumn("sender")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("sender")?.setFilterValue(event.target.value)
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