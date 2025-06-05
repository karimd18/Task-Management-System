import { API_BASE_URL, jsonHeaders } from './config'
import type { PaginatedResponse, Team, TeamCreateDTO, TeamUpdateDTO, Member, MemberUpdateDTO, MemberInviteDTO, MemberDTO_GET } from './types'

export const teamsApi = {
  list: async (page: number = 1, pageSize: number = 10): Promise<PaginatedResponse<Team>> => {
    const url = new URL(`${API_BASE_URL}/api/teams`)
    url.searchParams.set('page', page.toString())
    url.searchParams.set('pageSize', pageSize.toString())

    const res = await fetch(url.toString(), {
      headers: {
        ...authHeader(),
        Accept: 'application/json',
      },
    })

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.message || 'Failed to fetch teams')
    }

    return {
      data: await res.json(),
      total: parseInt(res.headers.get('X-Total-Count') || '0'),
      page,
      pageSize,
    }
  },

  create: async (data: TeamCreateDTO): Promise<Team> => {
    const res = await fetch(`${API_BASE_URL}/api/teams`, {
      method: 'POST',
      headers: {
        ...jsonHeaders,
        ...authHeader(),
      },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const error = await res.json()
      const message = error.errors ? 
        Object.values(error.errors).flat().join('\n') : 
        error.message
      throw new Error(message || 'Failed to create team')
    }

    return res.json()
  },

  update: async (id: string, data: TeamUpdateDTO): Promise<Team> => {
    const res = await fetch(`${API_BASE_URL}/api/teams/${id}`, {
      method: 'PUT',
      headers: {
        ...jsonHeaders,
        ...authHeader(),
      },
      body: JSON.stringify(data),
    })

    if (res.status === 409) {
      throw new Error('Team name already exists')
    }

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.message || 'Failed to update team')
    }

    return res.json()
  },

  delete: async (id: string): Promise<void> => {
    const res = await fetch(`${API_BASE_URL}/api/teams/${id}`, {
      method: 'DELETE',
      headers: authHeader(),
    })

    if (res.status === 400) {
      const error = await res.json()
      throw new Error(error.message || 'Cannot delete team with active members')
    }

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.message || 'Failed to delete team')
    }
  },

  sendInvite: async (teamId: string, dto: MemberInviteDTO): Promise<void> => {
    const res = await fetch(`${API_BASE_URL}/api/teams/invite`, {
      method: 'POST',
      headers: {
        ...jsonHeaders,
        ...authHeader(),
      },
      body: JSON.stringify({
        teamId,
        identifier: dto.identifier,
        role: dto.role
      }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to send invitation');
    }
  },

  removeMember: async (teamId: string, userId: string): Promise<void> => {
    const res = await fetch(`${API_BASE_URL}/api/teams/${teamId}/members/${userId}`, {
      method: 'DELETE',
      headers: authHeader(),
    })

    if (res.status === 400) {
      const error = await res.json()
      throw new Error(error.message || 'Cannot remove last admin')
    }

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.message || 'Failed to remove member')
    }
  },

  updateMemberRole: async (teamId: string, userId: string, role: MemberUpdateDTO): Promise<Member> => {
    const res = await fetch(`${API_BASE_URL}/api/teams/${teamId}/members/${userId}`, {
      method: 'PUT',
      headers: {
        ...jsonHeaders,
        ...authHeader(),
      },
      body: JSON.stringify(role),
    })

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.message || 'Failed to update role')
    }

    return res.json()
  },

  getMembers: async (
    teamId: string,
    page = 1,
    pageSize = 20
  ): Promise<PaginatedResponse<MemberDTO_GET>> => {
    const url = new URL(`${API_BASE_URL}/api/teams/${teamId}/members`);
    url.searchParams.set("page", page.toString());
    url.searchParams.set("pageSize", pageSize.toString());
  
    const res = await fetch(url.toString(), { headers: authHeader() });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Failed to fetch members");
    }
  
    const data = (await res.json()) as MemberDTO_GET[];
    const total = parseInt(res.headers.get("X-Total-Count") ?? "0", 10);
  
    return { data, total, page, pageSize };
  }
  ,
  
  isTeamAdmin: async (teamId: string, userId: string): Promise<boolean> => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/teams/${teamId}/members/${userId}/is-admin`,
        {
          method: 'GET',
          headers: {
            ...authHeader(),
            'Content-Type': 'application/json',
          },
        }
      );
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to check admin status');
      }
  
      const isAdmin = await res.json() as boolean;
      console.log('Admin status:', isAdmin);
      return isAdmin;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  },

  isTeamMember: async (teamId: string, userId: string): Promise<boolean> => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/teams/${teamId}/members/${userId}/is-member`,
        {
          method: 'GET',
          headers: {
            ...authHeader(),
            'Content-Type': 'application/json',
          },
        }
      );
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to check member status');
      }
  
      const isMember = await res.json() as boolean;
      console.log('Member status:', isMember);
      return isMember;
    } catch (error) {
      console.error('Error checking member status:', error);
      return false;
    }
  }
  
}

function authHeader(): HeadersInit {
  const token = localStorage.getItem('token')
  if (!token) throw new Error('Not authenticated')
  return { Authorization: `Bearer ${token}` }
}