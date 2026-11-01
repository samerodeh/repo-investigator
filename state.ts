export type InvestigatorState = {
    question: string;
    repoPath: string;
    searchQueries: string[];
    evidence: Evidence[];
    answer?: string;
};

export type Evidence = {
    path: string;
    startLine: number;
    endLine: number;
    content: string;
    reason: string;
};
