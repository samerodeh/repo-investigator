type investigatorState = {
    question: string;
    repoPath: string;
    searchQueries: string[];
    evidence: Evidence[];
    answer?: string;
}

type Evidence = {
    path: string;
    startLine: number;
    endLine: number;
    content: string;
    reason: string;
}

