import React, { useState } from 'react';
import { Search, ShieldAlert, AlertTriangle, ExternalLink, PhoneCall, ChevronDown, ChevronUp, Lock, Sparkles } from 'lucide-react';

const SCAM_TOPICS = [
  {
    id: 'phishing_kyc',
    iconGradient: 'from-blue-500 to-indigo-600',
    iconEmoji: '🏦',
    category: 'Banking & KYC Phishing',
    title: 'Bank Account Suspension & KYC Phishing',
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
    iconGradient: 'from-purple-500 to-pink-500',
    iconEmoji: '💼',
    category: 'Employment Scams',
    title: 'Work From Home & YouTube Task Frauds',
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
    iconGradient: 'from-amber-500 to-orange-500',
    iconEmoji: '💳',
    category: 'UPI & Payment Frauds',
    title: 'The QR Code Inversion & Fake Refund Trap',
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
    iconGradient: 'from-emerald-500 to-teal-500',
    iconEmoji: '📦',
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
    iconGradient: 'from-rose-500 to-red-600',
    iconEmoji: '🎁',
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
    iconGradient: 'from-slate-600 to-slate-800',
    iconEmoji: '⚖️',
    category: 'Law Enforcement Impersonation',
    title: 'Digital Arrest & CBI / Police Video Extortion',
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
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header (Apple Support Style) */}
      <div className="rounded-3xl apple-glass-card p-6 sm:p-10 text-center relative overflow-hidden">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.06] border border-white/[0.1] text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Security Knowledge Center</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
          Common Scam Blueprints
        </h1>
        <p className="text-sm sm:text-base text-slate-300 mt-2 max-w-2xl mx-auto leading-relaxed">
          Comprehensive forensics on social engineering tactics targeting digital citizens. Learn how attackers orchestrate psychological traps and how to respond.
        </p>

        {/* macOS Spotlight / iOS Style Search */}
        <div className="mt-8 max-w-xl mx-auto relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search scams (e.g. UPI, KYC, Telegram, courier, digital arrest)..."
            className="w-full pl-11 pr-4 py-3 rounded-full bg-black/50 border border-white/[0.12] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/80 focus:ring-1 focus:ring-cyan-400/50 transition-all shadow-inner"
          />
        </div>
      </div>

      {/* Topics Accordion */}
      <div className="space-y-4">
        {filteredTopics.map((topic) => {
          const isExpanded = expandedId === topic.id;
          return (
            <div
              key={topic.id}
              className={`rounded-3xl border transition-all duration-300 overflow-hidden ${
                isExpanded
                  ? 'apple-glass-card border-white/20 shadow-2xl'
                  : 'bg-white/[0.02] hover:bg-white/[0.04] border-white/[0.07]'
              }`}
            >
              <button
                onClick={() => setExpandedId(isExpanded ? null : topic.id)}
                className="w-full p-5 sm:p-6 text-left flex items-start justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  {/* Apple iOS Settings-style squircle icon */}
                  <div className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${topic.iconGradient} flex items-center justify-center text-xl shrink-0 shadow-lg shadow-black/40`}>
                    {topic.iconEmoji}
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
                      {topic.category}
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                      {topic.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                      {topic.summary}
                    </p>
                  </div>
                </div>

                <div className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center shrink-0 text-slate-400 mt-1">
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {isExpanded && (
                <div className="px-5 sm:px-6 pb-6 pt-2 border-t border-white/[0.08] space-y-4 text-xs sm:text-sm">
                  {/* Real World Example Card */}
                  <div className="bg-black/40 p-4 rounded-2xl border border-white/[0.08]">
                    <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider block mb-1">
                      Real-World Lure Pattern
                    </span>
                    <p className="font-mono text-xs text-amber-200/90 italic">
                      "{topic.example}"
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Tactics */}
                    <div className="bg-white/[0.02] p-4 rounded-2xl border border-white/[0.06]">
                      <h4 className="font-semibold text-rose-300 uppercase tracking-wider text-xs mb-2 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                        <span>Attacker Modus Operandi</span>
                      </h4>
                      <ul className="space-y-1.5 list-disc list-inside text-slate-300 text-xs leading-relaxed">
                        {topic.tactics.map((tac, i) => (
                          <li key={i}>{tac}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Red Flags */}
                    <div className="bg-white/[0.02] p-4 rounded-2xl border border-white/[0.06]">
                      <h4 className="font-semibold text-amber-300 uppercase tracking-wider text-xs mb-2 flex items-center gap-1.5">
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                        <span>Warning Signs (Red Flags)</span>
                      </h4>
                      <ul className="space-y-1.5 list-disc list-inside text-slate-300 text-xs leading-relaxed">
                        {topic.redFlags.map((rf, i) => (
                          <li key={i}>{rf}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Golden Rule Action */}
                  <div className="bg-emerald-950/20 border border-emerald-500/30 p-4 rounded-2xl text-emerald-200">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 block mb-0.5">
                      Defensive Protocol
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
    </div>
  );
}
