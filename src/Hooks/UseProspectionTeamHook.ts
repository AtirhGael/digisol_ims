import { useState } from "react";
import axios from "axios";
import { useUserStore } from '../Store/UserStore';

interface TeamMember {
  assignment_id: string;
  user_id: string;
  name: string;
  email: string;
  department: string | null;
  role_in_prospection: string | null;
  assigned_at: string;
}

interface AddTeamMemberRequest {
  user_id: string;
  role_in_prospection?: string;
}

const useProspectionTeam = (prospectionId: string) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  const fetchTeamMembers = async () => {
    setLoading(true);
    setError(null);
    try {
      const accessToken = useUserStore.getState().accessToken;
      const response = await axios.get(
        `${(import.meta as any).env.VITE_BASE_URL}/business-development/prospections/${prospectionId}/team-members`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      setTeamMembers(response.data.data);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch team members");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addTeamMember = async (data: AddTeamMemberRequest) => {
    setLoading(true);
    setError(null);
    try {
      const accessToken = useUserStore.getState().accessToken;
      const response = await axios.post(
        `${(import.meta as any).env.VITE_BASE_URL}/business-development/prospections/${prospectionId}/team-members`,
        data,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      await fetchTeamMembers(); // Refresh the list
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to add team member");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeTeamMember = async (memberId: string) => {
    setLoading(true);
    setError(null);
    try {
      const accessToken = useUserStore.getState().accessToken;
      const response = await axios.delete(
        `${(import.meta as any).env.VITE_BASE_URL}/business-development/prospections/${prospectionId}/team-members/${memberId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      await fetchTeamMembers(); // Refresh the list
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to remove team member");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { 
    teamMembers, 
    loading, 
    error, 
    fetchTeamMembers, 
    addTeamMember, 
    removeTeamMember 
  };
};

export default useProspectionTeam;