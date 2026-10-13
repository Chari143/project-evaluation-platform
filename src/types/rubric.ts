export interface RubricCriterionPayload {
    dimension: string;
    weight: number;
    description: string;
}

export interface RubricCriterion extends RubricCriterionPayload {
    id: string;
    rubricId: string;
    createdAt: string;
}

export interface CreateRubricPayload {
    assignmentId: string;
    name: string;
    description?: string | undefined;
    criteria: RubricCriterionPayload[];
}

export interface Rubric {
    id: string;
    assignmentId: string;
    name: string;
    description?: string | undefined;
    criteria: RubricCriterion[];
    createdAt: string;
    updatedAt: string;
}
