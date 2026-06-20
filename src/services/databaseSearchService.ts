import { supabaseClient } from '../db/supabaseClient';
import { IntentClassification } from '../types/query';

export async function getActiveCampaigns() {
  const { data, error } = await supabaseClient
    .from('campaigns')
    .select('*')
    .eq('status', 'active');

  if (error) throw error;
  return data || [];
}

export async function getHighInterestLeads() {
  const { data, error } = await supabaseClient
    .from('leads')
    .select('*')
    .in('interest_level', ['high', 'medium']);

  if (error) throw error;
  return data || [];
}

export async function getLeadsNeedingFollowUp() {
  const { data, error } = await supabaseClient
    .from('leads')
    .select('*')
    .in('status', ['qualified', 'proposal_sent']);

  if (error) throw error;
  return data || [];
}

export async function getCallsByAgentName(agentName: string) {
  const { data: agents, error: agentError } = await supabaseClient
    .from('agents')
    .select('id')
    .ilike('name', `%${agentName}%`);

  if (agentError) throw agentError;

  if (!agents || agents.length === 0) {
    return [];
  }

  const agentIds = agents.map((a: Record<string, unknown>) => a.id);

  const { data: calls, error: callError } = await supabaseClient
    .from('calls')
    .select('*')
    .in('agent_id', agentIds);

  if (callError) throw callError;
  return calls || [];
}

export async function getScheduledFollowUpCalls() {
  const { data, error } = await supabaseClient
    .from('calls')
    .select('*')
    .eq('status', 'scheduled_follow_up');

  if (error) throw error;
  return data || [];
}

export async function searchDatabase(classification: IntentClassification) {
  const results: Record<string, unknown>[] = [];

  try {
    if (classification.entities.campaignStatus === 'active') {
      const campaigns = await getActiveCampaigns();
      results.push(...campaigns);
    }

    if (
      classification.entities.interestLevel === 'high' ||
      classification.entities.interestLevel === 'medium'
    ) {
      const leads = await getHighInterestLeads();
      results.push(...leads);
    }

    if (
      classification.entities.leadStatus === 'qualified' ||
      classification.entities.leadStatus === 'proposal_sent'
    ) {
      const leads = await getLeadsNeedingFollowUp();
      results.push(...leads);
    }

    if (classification.entities.agentName) {
      const calls = await getCallsByAgentName(classification.entities.agentName);
      results.push(...calls);
    }

    if (classification.source === 'database') {
      const followUpCalls = await getScheduledFollowUpCalls();
      results.push(...followUpCalls);
    }

    return results;
  } catch (error) {
    console.error('Database search error:', error);
    throw error;
  }
}
