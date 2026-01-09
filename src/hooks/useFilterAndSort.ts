import { useState, useMemo, useCallback } from "react";
import type { Task, Priority, SortOptions } from "../types";

export interface FilterState {
  search: string;
  priority: Priority | "ALL";
  assignee: string | "ALL";
  dueDate: "overdue" | "today" | "week" | "month" | "ALL";
  tags: string[];
  hasAttachments: boolean | null;
  hasComments: boolean | null;
}

export interface SortState {
  field: SortOptions["field"];
  direction: SortOptions["direction"];
}

const DEFAULT_FILTER: FilterState = {
  search: "",
  priority: "ALL",
  assignee: "ALL",
  dueDate: "ALL",
  tags: [],
  hasAttachments: null,
  hasComments: null,
};

const DEFAULT_SORT: SortState = {
  field: "createdAt",
  direction: "desc",
};

export const useFilterAndSort = (tasks: Task[]) => {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTER);
  const [sort, setSort] = useState<SortState>(DEFAULT_SORT);
  const [savedFilters, setSavedFilters] = useState<Record<string, FilterState>>({});

  // Filter functions
  const applySearchFilter = useCallback((tasks: Task[], search: string) => {
    if (!search.trim()) return tasks;

    const searchLower = search.toLowerCase();
    return tasks.filter(task =>
      task.title.toLowerCase().includes(searchLower) ||
      task.description?.toLowerCase().includes(searchLower) ||
      task.tags?.some(tag => tag.toLowerCase().includes(searchLower))
    );
  }, []);

  const applyPriorityFilter = useCallback((tasks: Task[], priority: Priority | "ALL") => {
    if (priority === "ALL") return tasks;
    return tasks.filter(task => task.priority === priority);
  }, []);

  const applyAssigneeFilter = useCallback((tasks: Task[], assignee: string | "ALL") => {
    if (assignee === "ALL") return tasks;
    return tasks.filter(task => task.assigneeId === assignee);
  }, []);

  const applyDueDateFilter = useCallback((tasks: Task[], dueDate: FilterState["dueDate"]) => {
    if (dueDate === "ALL") return tasks;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const monthFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    return tasks.filter(task => {
      if (!task.dueDate) return false;

      const taskDueDate = new Date(task.dueDate);

      switch (dueDate) {
        case "overdue":
          return taskDueDate < today;
        case "today":
          return taskDueDate >= today && taskDueDate < tomorrow;
        case "week":
          return taskDueDate >= today && taskDueDate <= weekFromNow;
        case "month":
          return taskDueDate >= today && taskDueDate <= monthFromNow;
        default:
          return true;
      }
    });
  }, []);

  const applyTagsFilter = useCallback((tasks: Task[], tags: string[]) => {
    if (tags.length === 0) return tasks;
    return tasks.filter(task =>
      tags.every(tag => task.tags?.includes(tag))
    );
  }, []);

  const applyAttachmentsFilter = useCallback((tasks: Task[], hasAttachments: boolean | null) => {
    if (hasAttachments === null) return tasks;
    return tasks.filter(task =>
      hasAttachments ? (task.attachments?.length || 0) > 0 : (task.attachments?.length || 0) === 0
    );
  }, []);

  const applyCommentsFilter = useCallback((tasks: Task[], hasComments: boolean | null) => {
    if (hasComments === null) return tasks;
    return tasks.filter(task =>
      hasComments ? (task.comments?.length || 0) > 0 : (task.comments?.length || 0) === 0
    );
  }, []);

  // Sort function
  const applySorting = useCallback((tasks: Task[], sortOptions: SortState) => {
    return [...tasks].sort((a, b) => {
      let comparison = 0;

      switch (sortOptions.field) {
        case "title":
          comparison = (a.title || "").localeCompare(b.title || "");
          break;
        case "priority":
          const priorityOrder: Record<string, number> = { HIGH: 3, MEDIUM: 2, LOW: 1 };
          const pA = priorityOrder[a.priority || "LOW"] || 1;
          const pB = priorityOrder[b.priority || "LOW"] || 1;
          comparison = pA - pB;
          break;
        case "dueDate":
          const aDueDate = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
          const bDueDate = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
          comparison = aDueDate - bDueDate;
          break;
        case "createdAt":
          const aCreated = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bCreated = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          comparison = aCreated - bCreated;
          break;
        case "updatedAt":
          const aUpdated = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
          const bUpdated = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
          comparison = aUpdated - bUpdated;
          break;
        default:
          comparison = 0;
      }

      return sortOptions.direction === "asc" ? comparison : -comparison;
    });
  }, []);

  // Main filtered and sorted tasks
  const filteredAndSortedTasks = useMemo(() => {
    let result = tasks;

    // Apply all filters
    result = applySearchFilter(result, filters.search);
    result = applyPriorityFilter(result, filters.priority);
    result = applyAssigneeFilter(result, filters.assignee);
    result = applyDueDateFilter(result, filters.dueDate);
    result = applyTagsFilter(result, filters.tags);
    result = applyAttachmentsFilter(result, filters.hasAttachments);
    result = applyCommentsFilter(result, filters.hasComments);

    // Apply sorting
    result = applySorting(result, sort);

    return result;
  }, [
    tasks, filters, sort,
    applySearchFilter, applyPriorityFilter, applyAssigneeFilter,
    applyDueDateFilter, applyTagsFilter, applyAttachmentsFilter,
    applyCommentsFilter, applySorting
  ]);

  // Filter update functions
  const updateFilter = useCallback(<K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const updateSort = useCallback((field: SortOptions["field"], direction?: SortOptions["direction"]) => {
    setSort(prev => ({
      field,
      direction: direction || (prev.field === field && prev.direction === "asc" ? "desc" : "asc")
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTER);
  }, []);

  const resetSort = useCallback(() => {
    setSort(DEFAULT_SORT);
  }, []);

  const clearAll = useCallback(() => {
    clearFilters();
    resetSort();
  }, [clearFilters, resetSort]);

  // Saved filters
  const saveFilter = useCallback((name: string, filterState?: FilterState) => {
    setSavedFilters(prev => ({
      ...prev,
      [name]: filterState || filters
    }));
  }, [filters]);

  const loadFilter = useCallback((name: string) => {
    const savedFilter = savedFilters[name];
    if (savedFilter) {
      setFilters(savedFilter);
    }
  }, [savedFilters]);

  const deleteSavedFilter = useCallback((name: string) => {
    setSavedFilters(prev => {
      const { [name]: deleted, ...rest } = prev;
      return rest;
    });
  }, []);

  // Quick filters
  const quickFilters = useMemo(() => ({
    myTasks: (userId: string) => updateFilter("assignee", userId),
    highPriority: () => updateFilter("priority", "HIGH"),
    overdue: () => updateFilter("dueDate", "overdue"),
    dueToday: () => updateFilter("dueDate", "today"),
    dueThisWeek: () => updateFilter("dueDate", "week"),
    withAttachments: () => updateFilter("hasAttachments", true),
    withComments: () => updateFilter("hasComments", true),
  }), [updateFilter]);

  // Statistics
  const filterStats = useMemo(() => {
    const total = tasks.length;
    const filtered = filteredAndSortedTasks.length;
    const activeFilters = Object.entries(filters).filter(([key, value]) => {
      if (key === "search") return value.trim() !== "";
      if (key === "priority" || key === "assignee" || key === "dueDate") return value !== "ALL";
      if (key === "tags") return (value as string[]).length > 0;
      if (key === "hasAttachments" || key === "hasComments") return value !== null;
      return false;
    }).length;

    return {
      total,
      filtered,
      hidden: total - filtered,
      activeFilters,
      hasActiveFilters: activeFilters > 0,
    };
  }, [tasks.length, filteredAndSortedTasks.length, filters]);

  return {
    // State
    filters,
    sort,
    savedFilters,
    filteredTasks: filteredAndSortedTasks,
    filterStats,

    // Filter actions
    updateFilter,
    setSearch: (search: string) => updateFilter("search", search),
    setPriority: (priority: Priority | "ALL") => updateFilter("priority", priority),
    setAssignee: (assignee: string | "ALL") => updateFilter("assignee", assignee),
    setDueDate: (dueDate: FilterState["dueDate"]) => updateFilter("dueDate", dueDate),
    setTags: (tags: string[]) => updateFilter("tags", tags),
    addTag: (tag: string) => updateFilter("tags", [...filters.tags, tag]),
    removeTag: (tag: string) => updateFilter("tags", filters.tags.filter(t => t !== tag)),
    setHasAttachments: (hasAttachments: boolean | null) => updateFilter("hasAttachments", hasAttachments),
    setHasComments: (hasComments: boolean | null) => updateFilter("hasComments", hasComments),

    // Sort actions
    updateSort,
    setSortField: (field: SortOptions["field"]) => updateSort(field),
    setSortDirection: (direction: SortOptions["direction"]) =>
      setSort(prev => ({ ...prev, direction })),

    // Reset actions
    clearFilters,
    resetSort,
    clearAll,

    // Saved filters
    saveFilter,
    loadFilter,
    deleteSavedFilter,

    // Quick filters
    quickFilters,

    // Utilities
    isFiltered: filterStats.hasActiveFilters,
    isEmpty: filteredAndSortedTasks.length === 0,
    getAvailableTags: useCallback(() => {
      const allTags = tasks.flatMap(task => task.tags || []);
      return [...new Set(allTags)].sort();
    }, [tasks]),
  };
};