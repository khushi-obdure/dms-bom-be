import { Request } from "express";

export interface CustomApproveRequest extends Request {
    query: { approvalId: string };
}
