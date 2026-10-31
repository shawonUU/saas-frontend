
export type Language = "en" | "bn";

export type PermissionAction =
    | "can_view"
    | "can_create"
    | "can_update"
    | "can_delete";

export type PermissionFlags = {
    can_view: boolean;
    can_create: boolean;
    can_update: boolean;
    can_delete: boolean;
};

export type TeamMember = {
    id: number;
    user_id: number;
    business_id: number;
    name: string;
    email: string;
    role: string;
    status: string;
    can_manage: boolean;
    created_at: string;
};

export type TeamData = {
    business: {
        id: number;
        name: string;
    };
    current_member_id: number;
    can_assign_admin: boolean;
    roles: string[];
    members: TeamMember[];
};

export type PermissionChild = {
    id: number;
    name: string;
    slug: string;
    permissions: PermissionFlags;
};

export type PermissionMenu = {
    id: number;
    name: string;
    slug: string;
    permissions: PermissionFlags;
    children: PermissionChild[];
};

export type PermissionModule = {
    id: number;
    name: string;
    slug: string;
    icon: string | null;
    permissions: PermissionFlags;
    menus: PermissionMenu[];
};

export type PermissionData = {
    member: {
        id: number;
        role: string;
        status: string;
    };
    modules: PermissionModule[];
};
