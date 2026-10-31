import api from "../../../api/axios";
import type {
    TeamData,
    PermissionData,
    PermissionModule
} from "./types";

type CreateUserPayload = {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    role: string;
};

type AddMemberPayload = {
    email: string;
    role: string;
};

type UpdateMemberPayload = {
    role: string;
    status: string;
};

const baseUrl = (businessId: number) =>
    `/businesses/${businessId}/team`;

const unwrap = <T,>(response: { data: unknown }): T => {
    const body = response.data as {
        data?: T;
    };

    return (body?.data ?? body) as T;
};

export const teamApi = {
    async list(businessId: number): Promise<TeamData> {
        const response = await api.get(baseUrl(businessId));
        return unwrap<TeamData>(response);
    },

    async createUser(
        businessId: number,
        payload: CreateUserPayload
    ): Promise<unknown> {
        const response = await api.post(
            `${baseUrl(businessId)}/create-user`,
            {
                name: payload.name.trim(),
                email: payload.email.trim().toLowerCase(),
                password: payload.password,
                password_confirmation: payload.password_confirmation,
                role: payload.role
            }
        );

        return unwrap(response);
    },

    async add(
        businessId: number,
        payload: AddMemberPayload
    ): Promise<unknown> {
        const response = await api.post(baseUrl(businessId), {
            email: payload.email.trim().toLowerCase(),
            role: payload.role
        });

        return unwrap(response);
    },

    async update(
        businessId: number,
        memberId: number,
        payload: UpdateMemberPayload
    ): Promise<unknown> {
        const response = await api.put(
            `${baseUrl(businessId)}/${memberId}`,
            payload
        );

        return unwrap(response);
    },

    async disable(
        businessId: number,
        memberId: number
    ): Promise<unknown> {
        const response = await api.delete(
            `${baseUrl(businessId)}/${memberId}`
        );

        return unwrap(response);
    },

    async permissions(
        businessId: number,
        memberId: number
    ): Promise<PermissionData> {
        const response = await api.get(
            `${baseUrl(businessId)}/${memberId}/permissions`
        );

        return unwrap<PermissionData>(response);
    },

    async savePermissions(
        businessId: number,
        memberId: number,
        modules: PermissionModule[]
    ): Promise<unknown> {
        const response = await api.put(
            `${baseUrl(businessId)}/${memberId}/permissions`,
            { modules }
        );

        return unwrap(response);
    }
};