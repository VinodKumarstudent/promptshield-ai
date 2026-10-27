import React, { useState } from 'react';
import { Search, ShieldAlert, AlertTriangle, ExternalLink, PhoneCall, ChevronDown, ChevronUp, Lock, Sparkles } from 'lucide-react';

const SCAM_TOPICS = [
  {
    id: 'phishing_kyc',
    iconGradient: 'from-blue-500 via-indigo-600 to-cyan-500',
    borderColor: 'border-blue-500/30',
    iconEmoji: '🏦',
    category: 'Banking & KYC Phishing',
    title: 'Bank Account Suspension & Fake KYC Updates',
    summary: 'SMS claiming your SBI/HDFC/ICICI NetBanking will be blocked in 24 hours unless you click a link to update PAN/Aadhaar.',
    tactics: [
      'Spoofed domain names mimicking official portals',
      'Artificial countdown timer (12 to 24 hours urgency)',
      'Threat of immediate financial disruption or account blocking',
    ],
    redFlags: [
      'SMS comes from a 10-digit personal mobile number instead of an official bank sender ID',
      'Links hosted on non-official TLDs like .xyz, .top, .live',
      'Asks for full NetBanking password, debit card PIN, or CVV',
    ],
    safeAction: 'Banks never send web links to unblock accounts or update KYC. Visit your bank branch or use the official verified app only.'
  },
  {
    id: 'job_task',
    iconGradient: 'from-indigo-600 via-blue-600 to-cyan-500',
    borderColor: 'border-indigo-500/30',
    iconEmoji: '💼',
    category: 'Employment Scams',
    title: 'Work From Home & YouTube Task Frauds',
    summary: 'WhatsApp/Telegram message offering Rs 3,000 - Rs 8,000 per day for liking YouTube videos or writing Google Reviews.',
    tactics: [
      'Impersonation of Amazon HR, Meesho, or international marketing firms',
      'Initial small payout to build false trust',
      'Shifting victims to Telegram "VIP Investment Groups" where they must deposit large funds to withdraw their balance',
    ],
    redFlags: [
      'Unsolicited job offer via WhatsApp from foreign country codes (+62, +84, +234, etc.)',
      'Excessively high daily wages for zero-skill work',
      'Requirement to pay "security deposit" or "prepaid task balance"',
    ],
    safeAction: 'Legitimate companies never recruit employees over unsolicited WhatsApp messages nor do they charge money for job assignments.'
  },
  {
    id: 'upi_refund',
    iconGradient: 'from-amber-500 via-orange-500 to-yellow-400',
    borderColor: 'border-amber-500/30',
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
    safeAction: 'GOLDEN RULE OF UPI: You NEVER need to enter your UPI PIN or scan a QR code to receive money. PIN is strictly for DEBITING money.'
  },
  {
    id: 'delivery_smishing',
    iconGradient: 'from-cyan-500 via-teal-500 to-emerald-400',
    borderColor: 'border-cyan-500/30',
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
    safeAction: 'Track parcels exclusively on official courier sites using your tracking number. Never click SMS redirect links.'
  },
  {
    id: 'ibomma_piracy_malware',
    iconGradient: 'from-red-600 via-rose-600 to-orange-500',
    borderColor: 'border-rose-500/40',
    iconEmoji: '🎬',
    category: 'Prohibited Piracy & Malware APKs',
    title: 'iBomma / Pirated Movie Links & Trojan APK Droppers',
    summary: 'Links claiming to offer latest free HD movie streams on iBomma, MovieRulz, or TamilMV, prompting users to install a player APK.',
    tactics: [
      'Copyright-prohibited piracy portals blocked under Indian IT Act (Section 69A)',
      'Drive-by download prompts instructing users to download untrusted .APK files',
      'Bundled Trojan spyware that monitors SMS, steals banking OTPs, and accesses private photos',
    ],
    redFlags: [
      'Offers newly released theater movies for "100% free streaming"',
      'Prompts you to disable Android installation security ("Allow Unknown Sources")',
      'Aggressive pop-up redirects leading to betting, adult, or fake antivirus sites',
    ],
    safeAction: 'Never sideload APKs from pirated movie sites. Use legitimate streaming services like Netflix, Hotstar, and Prime Video.'
  },
  {
    id: 'sextortion_blackmail',
    iconGradient: 'from-fuchsia-600 via-purple-700 to-rose-700',
    borderColor: 'border-fuchsia-500/40',
    iconEmoji: '🔞',
    category: 'Prohibited Adult & Sextortion',
    title: 'Adult Site Webcam Blackmail & Sextortion Traps',
    summary: 'Emails or messages threatening to leak compromising webcam footage of you visiting adult sites unless cryptocurrency is paid.',
    tactics: [
      'Mass automated spam targeting leaked email databases with generic bluff scripts',
      'Exploiting personal shame, fear of social humiliation, and reputational dread',
      'Demanding untraceable cryptocurrency payments (Bitcoin / Monero) within 24 to 48 hours',
    ],
    redFlags: [
      'The sender cannot provide actual proof or screenshots of you',
      'Urgent extortion ultimatum demanding Bitcoin transfer',
      'Links directing you to adult verification portals or unknown chatrooms',
    ],
    safeAction: 'Do not pay any money. Attackers send these mass bluff emails indiscriminately. Block the sender and report to 1930.'
  },
  {
    id: 'lottery_advance_fee',
    iconGradient: 'from-rose-500 via-pink-600 to-red-600',
    borderColor: 'border-rose-500/30',
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
    safeAction: 'There is no such thing as an unentered WhatsApp lottery. Delete the message and block the sender immediately.'
  },
  {
    id: 'digital_arrest',
    iconGradient: 'from-indigo-600 via-purple-700 to-slate-800',
    borderColor: 'border-indigo-500/30',
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
    safeAction: 'Hang up immediately. No police agency in India arrests citizens over video calls. Report to 1930 immediately.'
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
      {/* Header */}
      <div className="rounded-2xl cyber-panel p-6 sm:p-10 text-center relative overflow-hidden border border-cyan-500/30">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-cyan-950/60 border border-cyan-500/30 text-xs font-mono font-bold uppercase tracking-wider text-cyan-300 mb-3.5">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Security Threat Knowledge Center</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
          Common Scam Blueprints
        </h1>
        <p className="text-sm sm:text-base text-slate-300 mt-2.5 max-w-2xl mx-auto leading-relaxed font-medium">
          Comprehensive forensics on social engineering tactics targeting digital citizens — from banking frauds and pirated movie APK droppers to sextortion and digital arrests.
        </p>

        {/* Search */}
        <div className="mt-8 max-w-xl mx-auto relative">
          <Search className="w-4 h-4 text-cyan-300 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search scams by category, keyword, or modus operandi..."
            className="w-full pl-11 pr-4 py-3 rounded-full bg-black/60 border border-cyan-400/30 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all shadow-inner"
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
              className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                isExpanded
                  ? `cyber-panel ${topic.borderColor} shadow-xl shadow-cyan-950/20`
                  : 'cyber-panel hover:border-slate-700'
              }`}
            >
              <button
                onClick={() => setExpandedId(isExpanded ? null : topic.id)}
                className="w-full p-5 sm:p-6 text-left flex items-start justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${topic.iconGradient} flex items-center justify-center text-2xl shrink-0 shadow-lg shadow-black/50 border border-white/20`}>
                    {topic.iconEmoji}
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-extrabold tracking-wider text-cyan-300 block mb-1">
                      {topic.category}
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                      {topic.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed font-normal">
                      {topic.summary}
                    </p>
                  </div>
                </div>

                <div className="w-8 h-8 rounded-full bg-white/[0.08] flex items-center justify-center shrink-0 text-slate-300 mt-1">
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {isExpanded && (
                <div className="px-5 sm:px-6 pb-6 pt-4 border-t border-white/10 space-y-4 text-xs sm:text-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Tactics */}
                    <div className="bg-white/[0.03] p-4 rounded-2xl border border-white/10">
                      <h4 className="font-bold text-rose-300 uppercase tracking-wider text-xs mb-2 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                        <span>Attacker Modus Operandi</span>
                      </h4>
                      <ul className="space-y-1.5 list-disc list-inside text-slate-200 text-xs leading-relaxed">
                        {topic.tactics.map((tac, i) => (
                          <li key={`tac-${topic.id}-${i}`}>{tac}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Red Flags */}
                    <div className="bg-white/[0.03] p-4 rounded-2xl border border-white/10">
                      <h4 className="font-bold text-amber-300 uppercase tracking-wider text-xs mb-2 flex items-center gap-1.5">
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                        <span>Warning Signs (Red Flags)</span>
                      </h4>
                      <ul className="space-y-1.5 list-disc list-inside text-slate-200 text-xs leading-relaxed">
                        {topic.redFlags.map((rf, i) => (
                          <li key={`rf-${topic.id}-${i}`}>{rf}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Golden Rule Action */}
                  <div className="bg-emerald-950/30 border border-emerald-500/40 p-4 rounded-2xl text-emerald-200">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-300 block mb-0.5">
                      Defensive Protocol
                    </span>
                    <p className="leading-relaxed font-medium">
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
