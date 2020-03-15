/**
 * Interface for the global persistent config object
 */
export interface IGlobalConfig {
    /**
     *ID field necessary for IndexDB
     */
    id: string;
    /**
     * Show finished tasks
     */
    showDone: boolean;
    /**
     * Show tasks with a start date in the future
     */
    showFutureStart: boolean;

    /**
     * if set, finished tasks, that are older than the given number
     * of days are cleaned from the storage
     */
    taskCleanupDays?: number;

    // Filters. If multiple filters (e.g. selectedContexts and selectedProjects) are set, tasks
    //  have to fulfill both filters. If individual filters have more than one entry (e.g. more
    //  than one context, tasks have to fulfill at least one of the entries)
    /**
     * Show only tasks whose due date is at most dueIn days away
     */
    dueIn?: number;
    /**
     * Show only tasks with these contexts (empty: show all tasks)
     */
    selectedContexts: string[];
    /**
     * Show only tasks with these projects (empty: show all tasks)
     */
    selectedProjects: string[];
    /**
     * Show only tasks with these tags (empty: show all tasks)
     */
    selectedTags: string[];
    /**
     * Show only tasks delegated to these people
     */
    selectedDelegates: string[];
}
