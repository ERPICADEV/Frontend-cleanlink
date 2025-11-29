import { Search, Filter, SortAsc, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ReportsFilter } from "@/types/admin";

interface ReportsFiltersProps {
  filters: ReportsFilter;
  onFiltersChange: (filters: ReportsFilter) => void;
  onReset: () => void;
}

export function ReportsFilters({ filters, onFiltersChange, onReset }: ReportsFiltersProps) {
  const updateFilter = <K extends keyof ReportsFilter>(key: K, value: ReportsFilter[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <div className="bg-muted/50 rounded-xl p-4 mb-6">
      <div className="flex flex-col lg:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by title or report ID..."
            value={filters.search}
            onChange={(e) => updateFilter("search", e.target.value)}
            className="pl-9 filter-input"
          />
        </div>

        {/* Status */}
        <Select
          value={filters.status}
          onValueChange={(value) => updateFilter("status", value as ReportsFilter["status"])}
        >
          <SelectTrigger className="w-full lg:w-40 filter-input">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="assigned">Assigned</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="flagged">Flagged</SelectItem>
            <SelectItem value="duplicate">Duplicate</SelectItem>
            <SelectItem value="invalid">Invalid</SelectItem>
          </SelectContent>
        </Select>

        {/* Category */}
        <Select
          value={filters.category}
          onValueChange={(value) => updateFilter("category", value as ReportsFilter["category"])}
        >
          <SelectTrigger className="w-full lg:w-44 filter-input">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="pothole">Pothole</SelectItem>
            <SelectItem value="garbage">Garbage</SelectItem>
            <SelectItem value="flooding">Flooding</SelectItem>
            <SelectItem value="street_maintenance">Street Maintenance</SelectItem>
            <SelectItem value="traffic">Traffic</SelectItem>
            <SelectItem value="others">Others</SelectItem>
          </SelectContent>
        </Select>

        {/* Region */}
        <Select
          value={filters.region}
          onValueChange={(value) => updateFilter("region", value)}
        >
          <SelectTrigger className="w-full lg:w-36 filter-input">
            <SelectValue placeholder="Region" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Regions</SelectItem>
            <SelectItem value="delhi">Delhi</SelectItem>
            <SelectItem value="mumbai">Mumbai</SelectItem>
            <SelectItem value="bangalore">Bangalore</SelectItem>
            <SelectItem value="chennai">Chennai</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort By */}
        <Select
          value={filters.sortBy}
          onValueChange={(value) => updateFilter("sortBy", value as ReportsFilter["sortBy"])}
        >
          <SelectTrigger className="w-full lg:w-40 filter-input">
            <SortAsc className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="priority_high">Priority (High→Low)</SelectItem>
            <SelectItem value="priority_low">Priority (Low→High)</SelectItem>
          </SelectContent>
        </Select>

        {/* Reset */}
        <Button variant="ghost" onClick={onReset} className="lg:ml-auto">
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>
      </div>
    </div>
  );
}
