'use client';
import { ServiceType } from "@/prisma/generated/client";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { investment_advisory_services } from "@/constant/service_categorized";

// All possible types
const ALL_SERVICE_TYPES = [
  { value: ServiceType.RESEARCH_ADVISORY, label: "Research Advisory" },
  { value: ServiceType.MUTUAL_FUNDS, label: "Mutual Funds" },
  { value: ServiceType.PLATINA_WEALTH, label: "Platina Wealth" },
  { value: ServiceType.PORTFOLIO_REVIEW, label: "Portfolio Review" },
  { value: ServiceType.SMALLCASE, label: "Smallcase" },
  { value: ServiceType.COMBO, label: "Combo" }
];

export function ServicesSearchBar({q, type}: {q?: string, type?: string}) {
  const ALL_TYPES = "ALL";
  const pathname = usePathname();


  // Filter service types based on pathname
  const SERVICE_TYPE = useMemo(() => {
    if (pathname === "/ia-services") {
      // Only include IA services
      return [
        { value: ALL_TYPES, label: "All Types" },
        ...ALL_SERVICE_TYPES.filter(type =>
          investment_advisory_services.includes(type.value as ServiceType)
        ),
      ];
    } else if (pathname === "/ra-services") {
      // Exclude IA services
      return [
        { value: ALL_TYPES, label: "All Types" },
        ...ALL_SERVICE_TYPES.filter(type =>
          !investment_advisory_services.includes(type.value as ServiceType)
        ),
      ];
    }
    // Default: show all
    return [
      { value: ALL_TYPES, label: "All Types" },
      ...ALL_SERVICE_TYPES
    ];
  }, [pathname]);
  
  const router = useRouter();
  const [search, setSearch] = useState(q || "");
  const [selectedType, setSelectedType] = useState<string>(type || ALL_TYPES);

  const handleTypeChange = (value: string) => {
    setSelectedType(value);
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (value !== ALL_TYPES) params.set("type", value);
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (selectedType !== ALL_TYPES) params.set("type", selectedType);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="w-full mx-auto py-6 px-2 sm:px-4 border border-legacisPurple/20 dark:border-neutral-600 shadow-S shadow-legacisPurple/20 dark:shadow-neutral-600 sm:rounded-2xl">
      <form
        onSubmit={handleSearchSubmit}
        className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4"
      >
        <Input
          type="text"
          placeholder="Search services..."
          value={search}
          onChange={handleSearchChange}
          className="w-full md:w-auto flex-1"
        />
        <Select onValueChange={handleTypeChange} value={selectedType}>
          <SelectTrigger className="w-full md:w-56">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            {SERVICE_TYPE.map((type) => (
               <SelectItem key={type.value} value={type.value}>
               {type.label}
               </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex flex-col gap-2 w-full md:w-auto md:flex-row">
          <Button type="submit" className="w-full md:w-auto">
            Search
          </Button>
          <Button
            className="w-full md:w-auto"
            variant="outline"
            type="button"
            onClick={() => {
              setSearch("");
              setSelectedType(ALL_TYPES);
              router.push(pathname);
            }}
          >
            Clear
          </Button>
        </div>
      </form>
    </div>
  );
}