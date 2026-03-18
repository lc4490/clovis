export interface Claim {
  id: string;
  provider: string;
  service: string;
  date: string;
  status: "PROCESSED" | "PARTIALLY_DENIED" | "PENDING" | "PRIOR_AUTH";
  billed?: number;
  planPaid?: number;
  memberOwes?: number;
  denialReason?: string;
  appealDeadline?: string;
  authApprovedThrough?: string;
  notes?: string;
}

export interface MockMember {
  name: string;
  dob: string; // "MM/DD/YYYY"
  memberId: string;
  ssnLast4: string;
  zip: string;
  plan: string;
  planId: string; // formulary plan ID (e.g. "004" for PPO Choice)
  planType: "PPO" | "HMO";
  stars: number;
  claims: Claim[];
  otcBalance: number;
  rewardsEarned: number;
  rewardsTotal: number;
  primaryCarePhysician: string;
}

export const MOCK_MEMBERS: MockMember[] = [
  {
    name: "Lyndon Chao",
    dob: "06/06/1964",
    memberId: "CLOV-1147-NJ",
    ssnLast4: "1111",
    zip: "07030",
    plan: "PPO Choice",
    planId: "004",
    planType: "PPO",
    stars: 4,
    otcBalance: 75.0,
    rewardsEarned: 125,
    rewardsTotal: 400,
    primaryCarePhysician: "Dr. Eliana Cristina Callejas",
    claims: [
      {
        id: "CLM-2026-0115",
        provider: "Clover Primary Care – Hoboken",
        service: "Primary care office visit",
        date: "01/15/2026",
        status: "PROCESSED",
        billed: 120,
        planPaid: 100,
        memberOwes: 20,
      },
      {
        id: "CLM-2025-1203",
        provider: "New Jersey Radiology Center",
        service: "Knee MRI",
        date: "12/03/2025",
        status: "PARTIALLY_DENIED",
        billed: 1400,
        planPaid: 0,
        memberOwes: 1400,
        denialReason:
          "Prior authorization was not obtained before the procedure",
        appealDeadline: "03/03/2026",
      },
      {
        id: "CLM-2026-0220",
        provider: "Garden State Physical Therapy",
        service: "Physical therapy (3 sessions)",
        date: "02/20/2026",
        status: "PENDING",
      },
      {
        id: "PA-2025-0901",
        provider: "Rheumatology Associates of NJ",
        service: "Humira (adalimumab) 40mg injection",
        date: "09/01/2025",
        status: "PRIOR_AUTH",
        authApprovedThrough: "06/30/2026",
        notes:
          "Approved for biweekly injections per Dr. Callejas's treatment plan.",
      },
    ],
  },
  {
    name: "Lillian Chu",
    dob: "05/13/1968",
    memberId: "CLOV-2356-NJ",
    ssnLast4: "2222",
    zip: "07302",
    plan: "HMO Classic",
    planId: "002",
    planType: "HMO",
    stars: 3,
    otcBalance: 150.0,
    rewardsEarned: 200,
    rewardsTotal: 400,
    primaryCarePhysician: "Dr. James Okafor",
    claims: [
      {
        id: "CLM-2026-0128",
        provider: "Heart Care Associates – Jersey City",
        service: "Cardiology consultation",
        date: "01/28/2026",
        status: "PROCESSED",
        billed: 250,
        planPaid: 200,
        memberOwes: 50,
      },
      {
        id: "CLM-2025-1115",
        provider: "LabCorp – out-of-network",
        service: "Comprehensive metabolic panel & CBC",
        date: "11/15/2025",
        status: "PARTIALLY_DENIED",
        billed: 320,
        planPaid: 96,
        memberOwes: 224,
        denialReason:
          "Lab work was performed at an out-of-network facility without a referral",
        appealDeadline: "02/15/2026",
      },
      {
        id: "CLM-2026-0225",
        provider: "Hackensack University Medical Center",
        service: "Emergency room visit",
        date: "02/25/2026",
        status: "PENDING",
      },
      {
        id: "PA-2026-0101",
        provider: "Garden State Pharmacy",
        service: "Eliquis (apixaban) 5mg",
        date: "01/01/2026",
        status: "PRIOR_AUTH",
        authApprovedThrough: "12/31/2026",
        notes: "Approved for atrial fibrillation management per Dr. Okafor.",
      },
    ],
  },
];

export function verifyMember(input: {
  name: string;
  dob: string;
  memberIdOrSsn: string;
}): MockMember | null {
  const { name, dob, memberIdOrSsn } = input;

  return (
    MOCK_MEMBERS.find((m) => {
      const nameMatch =
        m.name.trim().toLowerCase() === name.trim().toLowerCase();
      const dobMatch = m.dob === dob.trim();
      const idMatch =
        m.memberId.trim().toLowerCase() ===
          memberIdOrSsn.trim().toLowerCase() ||
        m.ssnLast4 === memberIdOrSsn.trim();
      return nameMatch && dobMatch && idMatch;
    }) ?? null
  );
}
