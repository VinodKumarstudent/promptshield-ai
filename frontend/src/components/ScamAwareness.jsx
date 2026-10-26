import React, { useState } from 'react';
import { Search, ShieldAlert, AlertTriangle, HelpCircle, ExternalLink, PhoneCall, ChevronDown, ChevronUp, Lock } from 'lucide-react';

const SCAM_TOPICS = [
  {
    id: 'phishing_kyc',
    category: 'Banking & KYC Phishing',
    title: 'Fake Bank Account Suspension & KYC Expiry',
    summary: 'SMS claiming your SBI/HDFC/ICICI NetBanking will be blocked in 24 hours unless you click a link to update PAN/Aadhaar.',
    tactics: [
      'Spoofed domain names (e.g. sbi-kyc-update.xyz or netbanking-verify.top)',
      'Artificial countdown timer (12 to 24 hours urgency)',
      'Threat of immediate financial disruption or account blocking',
    ],
    redFlags: [
      'SMS comes from a 10-digit mobile number instead of an official bank sender ID (e.g. VK-SBIINB)',
      'Links hosted on non-official TLDs like .xyz, .top, .live',
      'Asks for full NetBanking password, debit card PIN, or CVV',
    ],
    safeAction: 'Banks never send web links to unblock accounts or update KYC. Visit your bank branch or use the official verified app only.',
    example: 'Dear customer, your SBI account is blocked. Update PAN card immediately: http://sbi-kyc-update.xyz'
  },
  {
    id: 'job_task',
    category: 'Employment Scams',
    title: 'Part-Time Work From Home & YouTube Like Task Scams',
    summary: 'WhatsApp/Telegram message offering Rs 3,000 - Rs 8,000 per day for liking YouTube videos or writing Google Reviews.',
    tactics: [
      'Impersonation of Amazon HR, Meesho, or international marketing firms',
      'Initial small payout (e.g. Rs 150) to build false trust',
      'Shifting victims to Telegram "VIP Investment Groups" where they must deposit large funds to withdraw their balance',
    ],
    redFlags: [
      'Unsolicited job offer via WhatsApp from foreign country codes (+62, +84, +234, etc.)',
      'Excessively high daily wages for zero-skill work',
      'Requirement to pay "security deposit" or "prepaid task balance"',
    ],
    safeAction: 'Legitimate companies never recruit employees over unsolicited WhatsApp messages nor do they charge money for job assignments.',
    example: 'Amazon HR: Earn Rs 5,000 daily working 1 hour from home. Like 3 YouTube videos. Contact @AmazonTaskRecruiter on Telegram.'
  },
  {
    id: 'upi_refund',
    category: 'UPI & Payment Frauds',
    title: 'Fake Refunds & The QR Code Trap',
    summary: 'Scammers claim to send you a refund, cashback, or OLX buyer payment by asking you to scan a QR code and enter your UPI PIN.',
    tactics: [
      'QR Code Inversion: Exploiting confusion between sending and receiving money',
      'Fake transaction screenshots showing money pending approval',
      'Urging user to "Enter PIN to verify and accept payment"',
    ],
    redFlags: [
      'Claiming that scanning a QR code is needed to receive money',
      'Any prompt asking you to enter your 4 or 6-digit UPI PIN for a refund',
      'Caller saying "Just press accept on PhonePe/GooglePay"',
    ],
    safeAction: 'GOLDEN RULE OF UPI: You NEVER need to enter your UPI PIN or scan a QR code to receive money. PIN is strictly for DEBITING money.',
    example: 'Your PhonePe refund of Rs 14,999 is approved. Scan this QR code and enter UPI PIN to receive funds.'
  },
  {
    id: 'delivery_smishing',
    category: 'Courier & Smishing',
    title: 'India Post / Courier Redirection Fee Scam',
    summary: 'SMS claiming a package cannot be delivered due to an incorrect address and asks for a token ₹48 redelivery charge.',
    tactics: [
      'Shortened URL links (bit.ly, tinyurl) masking spoofed phishing portals',
      'Very low token fee (₹20 to ₹50) so victims lower their guard',
      'Payment portal steals credit card credentials and triggers massive unauthorized debits',
    ],
    redFlags: [
      'SMS sent from regular individual phone numbers',
      'Shortened or obscured URL instead of indiapost.gov.in',
      'Urgent 12-hour warning to prevent return of parcel',
    ],
    safeAction: 'Track parcels exclusively on official courier sites using your tracking number. Never click SMS redirect links.',
    example: 'India Post: Your package could not be delivered due to incomplete address. Pay Rs 48 redelivery fee within 12 hours.'
  },
  {
    id: 'lottery_advance_fee',
    category: 'Lottery & Sweepstakes',
    title: 'KBC & WhatsApp Lucky Draw Frauds',
    summary: 'Messages or audio recordings announcing a multi-lakh lottery prize and requiring upfront "customs tax" or "file processing" fees.',
    tactics: [
      'Using Amitabh Bachchan or KBC logos and fake official stamps',
      'Demanding advance payments under the pretext of RBI clearance or government taxes',
      'Promising instant transfer once the fee is paid',
    ],
    redFlags: [
      'You never bought a ticket or entered any contest',
      'The prize money requires upfront payment to an individual UPI address',
      'Scammer insists you do not discuss this with family or bank staff',
    ],
    safeAction: 'There is no such thing as an unentered WhatsApp lottery. Delete the message and block the sender immediately.',
    example: 'CONGRATULATIONS! Your mobile number won Rs 25,00,000 in KBC Lucky Draw. Transfer Rs 4,500 customs fee to claim.'
  },
  {
    id: 'digital_arrest',
    category: 'Law Enforcement Impersonation',
    title: 'Digital Arrest & CBI / Police Video Call Extortion',
    summary: 'Calls claiming your phone or Aadhaar is linked to illegal narcotics or money laundering and putting you under "digital arrest".',
    tactics: [
      'Impersonating CBI, NCB, Cyber Police, or Mumbai Police',
      'Coercing victims to stay on Skype or WhatsApp video call 24x7 with fake police backdrop',
      'Demanding you transfer your savings to "RBI Verification Accounts" to prove innocence',
    ],
    redFlags: [
      'There is NO legal concept of "Digital Arrest" under Indian Law',
      'Police or courts NEVER conduct interrogations or issue warrants via WhatsApp or Skype',
      'Law enforcement NEVER instructs citizens to transfer money to personal bank accounts',
    ],
    safeAction: 'Hang up immediately. No police agency in India arrests citizens over video calls. Report to 1930 immediately.',
    example: 'This is Crime Branch Mumbai. A package containing illegal drugs was booked using your Aadhaar. Connect on Skype for Digital Arrest.'
  }
];

export default function ScamAwareness() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState('phishing_kyc');

  const filteredTopics = SCAM_TOPICS.filter((t) =>
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-950/40 via-slate-900 to-indigo-950/40 border border-blue-500/30 rounded-2xl p-6 sm:p-8 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20">
              Citizen Digital Defense
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-2 tracking-tight">
              Scam Awareness Knowledge Base
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Equip yourself against the most prevalent social engineering schemes targeting citizens across India and globally.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://cybercrime.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm flex items-center gap-1.5 transition shadow-lg shadow-blue-600/30"
            >
              <ExternalLink className="w-4 h-4" />
              <span>National Cybercrime Portal</span>
            </a>
          </div>
        </div>

        {/* Search */}
        <div className="mt-6 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search scam types (e.g. UPI, KYC, Telegram job, courier, digital arrest)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700/80 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>
      </div>

      {/* Scam Topics List */}
      <div className="space-y-4">
        {filteredTopics.map((topic) => {
          const isExpanded = expandedId === topic.id;
          return (
            <div
              key={topic.id}
              className={`rounded-2xl border transition-all ${
                isExpanded
                  ? 'bg-slate-900/90 border-blue-500/40 shadow-lg shadow-blue-500/5'
                  : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
              }`}
            >
              <button
                onClick={() => setExpandedId(isExpanded ? null : topic.id)}
                className="w-full p-5 text-left flex items-start justify-between gap-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-500/10 text-cyan-400 border border-blue-500/20">
                      {topic.category}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                    {topic.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed">
                    {topic.summary}
                  </p>
                </div>

                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center shrink-0 text-slate-400">
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {isExpanded && (
                <div className="px-5 pb-5 pt-2 border-t border-slate-800/80 space-y-4 text-xs sm:text-sm">
                  {/* Real World Example */}
                  <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider block mb-1">
                      Real-World Lure Example
                    </span>
                    <p className="font-mono text-xs text-amber-200/90 italic">
                      "{topic.example}"
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Tactics */}
                    <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/80">
                      <h4 className="font-semibold text-rose-300 uppercase tracking-wider text-xs mb-2 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                        <span>Attacker Modus Operandi</span>
                      </h4>
                      <ul className="space-y-1.5 list-disc list-inside text-slate-300 text-xs">
                        {topic.tactics.map((tac, i) => (
                          <li key={i}>{tac}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Red Flags */}
                    <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/80">
                      <h4 className="font-semibold text-amber-300 uppercase tracking-wider text-xs mb-2 flex items-center gap-1.5">
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                        <span>Warning Signs (Red Flags)</span>
                      </h4>
                      <ul className="space-y-1.5 list-disc list-inside text-slate-300 text-xs">
                        {topic.redFlags.map((rf, i) => (
                          <li key={i}>{rf}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Golden Rule Action */}
                  <div className="bg-emerald-950/20 border border-emerald-500/30 p-3.5 rounded-xl text-emerald-200">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 block mb-0.5">
                      Recommended Defensive Protocol
                    </span>
                    <p className="leading-relaxed">
                      {topic.safeAction}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Emergency Resources Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-white text-sm">Targeted by a cyber scammer? Act within the Golden Hour!</h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Call national helpline 1930 immediately to freeze financial transactions before scammers siphon funds.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <a
            href="tel:1930"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Call 1930 (Toll Free)</span>
          </a>
        </div>
      </div>
    </div>
  );
}
