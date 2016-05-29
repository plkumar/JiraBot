declare module luis {

    export interface Value {
        entity: string;
        type: string;
        score: number;
    }

    export interface Parameter {
        name: string;
        required: boolean;
        value: Value[];
    }

    export interface Action {
        triggered: boolean;
        name: string;
        parameters: Parameter[];
    }

    export interface Intent {
        intent: string;
        score: number;
        actions: Action[];
    }

    export interface Entity {
        entity: string;
        type: string;
        startIndex: number;
        endIndex: number;
        score: number;
    }

    export interface LUISResponse {
        query: string;
        intents: Intent[];
        entities: Entity[];
    }

    export interface TopScoringIntent {
        intent: string;
        score: number;
        actions: Action[];
    }

    export interface LUISPreviewResponse {
        query: string;
        topScoringIntent: TopScoringIntent;
        entities: Entity[];
    }
}
