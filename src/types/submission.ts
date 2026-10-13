export type SubmissionType = 'github' | 'zip' | 'pdf' | 'gdrive' | 'url';

export type SubmissionStatus =
    | 'PENDING'
    | 'PROCESSING'
    | 'EVALUATING'
    | 'COMPLETED'
    | 'FAILED';

export interface SubmissionPayload {
    studentId: string;
    assignmentId: string;
    type: SubmissionType;
    sourceUrl: string;
    notes?: string | undefined;
}

export interface Submission {
    id: string;
    studentId: string;
    assignmentId: string;
    type: SubmissionType;
    sourceUrl: string;
    notes?: string | undefined;
    status: SubmissionStatus;
    createdAt: string;
    updatedAt: string;
}
