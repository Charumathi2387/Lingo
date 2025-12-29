
export interface Scheme {
  id: string;
  name: string;
  year: string;
  category: 'Agriculture' | 'Health' | 'Education' | 'Housing' | 'Finance' | 'Business' | 'Social Welfare';
  ministry: string;
  objective: string;
  explanation: string;
  eligibility: string;
  checklist: string[];
}

export interface Message {
  role: 'user' | 'lingo';
  text: string;
  schemeId?: string;
}

export enum AudioState {
  IDLE = 'IDLE',
  LISTENING = 'LISTENING',
  SPEAKING = 'SPEAKING',
  CONNECTING = 'CONNECTING',
  ERROR = 'ERROR'
}
