export interface ApiResponse {
    context: number[];
    created_at: string;
    done: boolean;
    done_reason: number;
    eval_count: number;
    eval_duration: number;
    load_duration: number;
    model: string;
    promp_eval_count: number;
    promp_eval_duration: number;
    response: string;   
    total_duration: number;
}