"""
5 pre-written emergency plan templates (English).
These are the deterministic spines — the LLM translates/adapts but NEVER invents steps.
Each template has ~6 steps with {step, why, how} structure.

Template keys match severity table output.
"""
from app.incidents.resources import OFFICIAL_RESOURCES


EMERGENCY_TEMPLATES = {
    # ─── Template 1: Money sent + recent (<1h) ─ CRITICAL ─────────────────────
    "money_sent_recent": {
        "severity": "critical",
        "title": "Emergency: Money Sent Recently",
        "title_bn": "জরুরি: সম্প্রতি টাকা পাঠানো হয়েছে",
        "title_hi": "आपातकाल: हाल ही में पैसे भेजे गए",
        "steps": [
            {
                "step_number": 1,
                "title": "Call your bank's fraud helpline NOW",
                "why": "Banks can freeze the receiving account within the first hour. Every minute counts — this is your best chance to recover the money.",
                "how": "Call your bank's 24/7 helpline immediately. Tell them: 'I have been a victim of online fraud. I need to block my account and report a fraudulent transaction.' Give them the transaction ID, amount, and time. Ask for a complaint reference number.",
                "is_urgent": True,
                "official_resource": None,  # Dynamic — depends on user's bank
            },
            {
                "step_number": 2,
                "title": "Call 1930 — National Cyber Crime Helpline",
                "why": "This is the government's dedicated fraud helpline. They can coordinate with the receiving bank to freeze funds. Filing here is required for police action.",
                "how": "Call 1930 (available 24/7). Provide your name, phone, bank details, transaction details, and the scammer's details (number, UPI ID if known). Note down the complaint number they give you.",
                "is_urgent": True,
                "official_resource": OFFICIAL_RESOURCES["cybercrime_helpline"]["phone"],
            },
            {
                "step_number": 3,
                "title": "File an online complaint on cybercrime.gov.in",
                "why": "The online portal creates a formal record that strengthens your case. Banks and police reference this complaint number for investigations.",
                "how": "Go to cybercrime.gov.in → 'File a Complaint' → Select 'Financial Fraud' → Fill in all transaction details, upload screenshots of the transaction, and any messages from the scammer. Save the acknowledgement number.",
                "is_urgent": False,
                "official_resource": OFFICIAL_RESOURCES["cybercrime_helpline"]["url"],
            },
            {
                "step_number": 4,
                "title": "Secure your accounts",
                "why": "If the scammer has any of your banking details, they may attempt more transactions. Securing now prevents further loss.",
                "how": "Change your UPI PIN immediately. Change your internet banking password. Enable transaction alerts if not already on. Review recent transactions for any other unauthorized activity.",
                "is_urgent": False,
                "official_resource": None,
            },
            {
                "step_number": 5,
                "title": "Preserve all evidence",
                "why": "Evidence helps police and banks investigate. Deleted messages cannot be recovered.",
                "how": "Screenshot all messages, call logs, and transaction receipts related to this scam. Do NOT delete any chats, even if the scammer asks you to. Note the scammer's phone number, UPI ID, and any names they used.",
                "is_urgent": False,
                "official_resource": None,
            },
            {
                "step_number": 6,
                "title": "Follow up within 24 hours",
                "why": "Persistent follow-up significantly increases the chance of fund recovery, especially within the first 24 hours.",
                "how": "Call your bank again tomorrow and reference your complaint number. Check cybercrime.gov.in for complaint status. If your bank doesn't respond within 30 days, escalate to RBI Ombudsman at 14448 or cms.rbi.org.in.",
                "is_urgent": False,
                "official_resource": OFFICIAL_RESOURCES["rbi_ombudsman"]["phone"],
            },
        ],
    },

    # ─── Template 2: Money sent + delayed (>1h) ─ HIGH ────────────────────────
    "money_sent_delayed": {
        "severity": "high",
        "title": "Money Sent — Delayed Report",
        "title_bn": "টাকা পাঠানো হয়েছে — বিলম্বিত রিপোর্ট",
        "title_hi": "पैसे भेजे गए — विलंबित रिपोर्ट",
        "steps": [
            {
                "step_number": 1,
                "title": "File an online complaint on cybercrime.gov.in immediately",
                "why": "Even though time has passed, formal complaints are essential. Banks are required to investigate and respond within 30 days of a registered complaint.",
                "how": "Go to cybercrime.gov.in → 'File a Complaint' → Select 'Financial Fraud' → Enter all details. Upload evidence screenshots. Save your acknowledgement number — you will need it for follow-ups.",
                "is_urgent": True,
                "official_resource": OFFICIAL_RESOURCES["cybercrime_helpline"]["url"],
            },
            {
                "step_number": 2,
                "title": "Call 1930 — National Cyber Crime Helpline",
                "why": "While the chances of immediate fund freeze reduce after the first hour, reporting is still important. The helpline can still initiate a trace on the receiving account.",
                "how": "Call 1930 and provide all transaction details. Be honest about the time elapsed — this helps them prioritize correctly. Note down the complaint number.",
                "is_urgent": True,
                "official_resource": OFFICIAL_RESOURCES["cybercrime_helpline"]["phone"],
            },
            {
                "step_number": 3,
                "title": "Contact your bank's fraud department",
                "why": "Your bank needs to flag the transaction for investigation. Even if the money has moved, a formal dispute record is necessary for any potential recovery.",
                "how": "Call your bank's helpline. Request to register a fraud complaint for the specific transaction. Ask them to share details with the receiving bank. Get a written complaint reference.",
                "is_urgent": False,
                "official_resource": None,
            },
            {
                "step_number": 4,
                "title": "Secure all your accounts",
                "why": "The scammer may have obtained other credentials during the interaction. Securing accounts prevents further damage.",
                "how": "Change UPI PIN, internet banking password, and email password. Review all linked accounts for suspicious activity. Enable two-factor authentication everywhere possible.",
                "is_urgent": False,
                "official_resource": None,
            },
            {
                "step_number": 5,
                "title": "Preserve and organize evidence",
                "why": "Organized evidence strengthens your complaint. Police and banks respond better to well-documented cases.",
                "how": "Screenshot all conversations, call logs, and transactions. Write a timeline of events (when the scammer first contacted you, what they said, when you sent money). Store everything in one folder.",
                "is_urgent": False,
                "official_resource": None,
            },
            {
                "step_number": 6,
                "title": "Important note about recovery timelines",
                "why": "Being realistic about outcomes helps you take the right steps without unnecessary stress.",
                "how": "Fund recovery chances decrease after the first hour, but are not zero. Many cases see recovery within 30-60 days through banking channels. Follow up weekly with your bank and check complaint status on cybercrime.gov.in. If no response in 30 days, escalate to RBI Ombudsman (14448).",
                "is_urgent": False,
                "official_resource": OFFICIAL_RESOURCES["rbi_ombudsman"]["phone"],
            },
        ],
    },

    # ─── Template 3: OTP / credentials shared ─ CRITICAL ──────────────────────
    "credentials_shared": {
        "severity": "critical",
        "title": "Emergency: OTP or Credentials Shared",
        "title_bn": "জরুরি: OTP বা পাসওয়ার্ড শেয়ার করা হয়েছে",
        "title_hi": "आपातकाल: OTP या पासवर्ड साझा किया गया",
        "steps": [
            {
                "step_number": 1,
                "title": "Change your passwords RIGHT NOW",
                "why": "If someone has your OTP or password, they can access your accounts immediately. Changing passwords locks them out.",
                "how": "Start with the account whose OTP/password you shared. Change the password to something completely new (not similar to the old one). Then change passwords for your email, banking apps, and any other account using the same password.",
                "is_urgent": True,
                "official_resource": None,
            },
            {
                "step_number": 2,
                "title": "Call your bank to block compromised accounts",
                "why": "Even if no money has been taken yet, the scammer may attempt transactions using the credentials you shared.",
                "how": "Call your bank's 24/7 helpline. Tell them your OTP/credentials were compromised. Request temporary blocking of your card and net banking. Ask them to flag any pending transactions for review.",
                "is_urgent": True,
                "official_resource": None,
            },
            {
                "step_number": 3,
                "title": "Check for unauthorized transactions",
                "why": "The scammer may have already used your credentials. Early detection means faster dispute.",
                "how": "Log into your banking app (with your new password). Check the last 24 hours of transactions carefully. If you see anything you didn't authorize, immediately inform your bank and note the transaction details.",
                "is_urgent": True,
                "official_resource": None,
            },
            {
                "step_number": 4,
                "title": "Report to Cyber Crime if money was taken",
                "why": "If any unauthorized transactions occurred, reporting to 1930 and cybercrime.gov.in starts the official recovery process.",
                "how": "Call 1930 and report the unauthorized transactions. File a complaint on cybercrime.gov.in with transaction details. If no money was taken, report the attempt on Chakshu (sancharsaathi.gov.in) instead.",
                "is_urgent": False,
                "official_resource": OFFICIAL_RESOURCES["cybercrime_helpline"]["phone"],
            },
            {
                "step_number": 5,
                "title": "Enable two-factor authentication everywhere",
                "why": "2FA adds a second layer of security so that a stolen password alone isn't enough to access your accounts.",
                "how": "Enable 2FA on your email (Gmail/Yahoo/Outlook), banking apps, UPI apps, and social media. Use app-based 2FA (like Google Authenticator) instead of SMS where possible.",
                "is_urgent": False,
                "official_resource": None,
            },
            {
                "step_number": 6,
                "title": "Monitor your accounts for the next 30 days",
                "why": "Scammers sometimes wait before using stolen credentials. Continued monitoring catches delayed attacks.",
                "how": "Enable SMS/email alerts for all transactions. Check your bank statements weekly. If you notice anything unusual, contact your bank immediately.",
                "is_urgent": False,
                "official_resource": None,
            },
        ],
    },

    # ─── Template 4: Remote access active ─ CRITICAL ──────────────────────────
    "remote_access": {
        "severity": "critical",
        "title": "EMERGENCY: Remote Access — Disconnect NOW",
        "title_bn": "জরুরি: রিমোট অ্যাক্সেস — এখনই সংযোগ বিচ্ছিন্ন করুন",
        "title_hi": "आपातकाल: रिमोट एक्सेस — अभी डिस्कनेक्ट करें",
        "steps": [
            {
                "step_number": 0,
                "title": "DISCONNECT YOUR INTERNET IMMEDIATELY",
                "why": "The scammer can see and control your screen RIGHT NOW. Every second connected gives them access to your banking apps, passwords, and files.",
                "how": "Turn OFF Wi-Fi on your phone/computer. Turn ON airplane mode. If you can't find the setting, simply turn the device OFF completely. Do this BEFORE anything else.",
                "is_urgent": True,
                "official_resource": None,
            },
            {
                "step_number": 1,
                "title": "Uninstall the remote access app",
                "why": "Apps like AnyDesk, TeamViewer, or QuickSupport let scammers reconnect even after you turn internet back on.",
                "how": "Go to Settings → Apps → Find and uninstall: AnyDesk, TeamViewer, QuickSupport, or any app the scammer told you to install. If unsure which app, uninstall any app you installed today that you don't recognize.",
                "is_urgent": True,
                "official_resource": None,
            },
            {
                "step_number": 2,
                "title": "Call your bank — block everything",
                "why": "The scammer may have seen your banking credentials, UPI PIN, or made transactions while controlling your screen.",
                "how": "Using a DIFFERENT phone (borrow from family), call your bank's helpline. Request: block all cards, freeze net banking, and flag all transactions from the last 2 hours for review. Get a complaint reference.",
                "is_urgent": True,
                "official_resource": None,
            },
            {
                "step_number": 3,
                "title": "Change ALL passwords from a safe device",
                "why": "The scammer saw your screen — they may have captured your passwords, PINs, and personal information.",
                "how": "Using a DIFFERENT, clean device (not the compromised one): change banking passwords, email password, UPI PIN, social media passwords. Use passwords the scammer could not have seen.",
                "is_urgent": True,
                "official_resource": None,
            },
            {
                "step_number": 4,
                "title": "Report to 1930 and cybercrime.gov.in",
                "why": "Remote access fraud is a serious cybercrime. Formal reporting enables investigation and potential recovery.",
                "how": "Call 1930 and report the remote access incident. File a detailed complaint on cybercrime.gov.in including: the app the scammer asked you to install, how long they had access, and any transactions you didn't authorize.",
                "is_urgent": False,
                "official_resource": OFFICIAL_RESOURCES["cybercrime_helpline"]["phone"],
            },
            {
                "step_number": 5,
                "title": "Get your device checked",
                "why": "The scammer may have installed additional malware or backdoor apps while they had access.",
                "how": "Run a full antivirus scan. Check Settings → Apps for any unfamiliar apps installed today. Consider factory-resetting the device if you're not sure it's clean. Before resetting, save your photos and contacts.",
                "is_urgent": False,
                "official_resource": None,
            },
        ],
    },

    # ─── Template 5: Details shared, no money lost ─ HIGH ─────────────────────
    "details_shared_no_loss": {
        "severity": "high",
        "title": "Personal Details Shared — Prevention Steps",
        "title_bn": "ব্যক্তিগত তথ্য শেয়ার করা হয়েছে — প্রতিরোধমূলক পদক্ষেপ",
        "title_hi": "व्यक्तिगत जानकारी साझा की गई — रोकथाम के कदम",
        "steps": [
            {
                "step_number": 1,
                "title": "Assess what was shared",
                "why": "Different details carry different risks. Understanding what was shared helps prioritize your next steps.",
                "how": "Make a list of exactly what you shared: Aadhaar number, PAN, bank account number, address, date of birth, photos of documents. This list will guide your protection steps.",
                "is_urgent": True,
                "official_resource": None,
            },
            {
                "step_number": 2,
                "title": "Lock your Aadhaar biometrics (if Aadhaar was shared)",
                "why": "Locking Aadhaar biometrics prevents anyone from using your Aadhaar for authentication without your knowledge.",
                "how": "Go to myaadhaar.uidai.gov.in → 'Lock/Unlock Biometrics' → Verify with OTP → Lock. You can unlock it temporarily whenever you need to use it.",
                "is_urgent": True,
                "official_resource": None,
            },
            {
                "step_number": 3,
                "title": "Report on Chakshu (Sanchar Saathi)",
                "why": "Chakshu is specifically designed for reporting suspicious communications where no money was lost. It helps authorities track scam networks.",
                "how": "Go to sancharsaathi.gov.in → Chakshu → Report the suspicious communication. Include the scammer's phone number and the nature of the interaction.",
                "is_urgent": False,
                "official_resource": OFFICIAL_RESOURCES["chakshu"]["url"],
            },
            {
                "step_number": 4,
                "title": "Set up fraud alerts with your bank",
                "why": "If your banking details were shared, scammers may attempt transactions later. Fraud alerts give you early warning.",
                "how": "Call your bank and inform them that your details may be compromised. Request enhanced transaction monitoring. Enable SMS alerts for all transactions, including small amounts.",
                "is_urgent": False,
                "official_resource": None,
            },
            {
                "step_number": 5,
                "title": "Monitor for identity misuse",
                "why": "Shared Aadhaar/PAN can be used to open fake accounts or take loans in your name.",
                "how": "Check your CIBIL score at cibil.com (free once a year). Over the next 3 months, watch for: unexpected OTPs, loan approval messages, or new account alerts you didn't initiate. If any appear, report to police and the institution immediately.",
                "is_urgent": False,
                "official_resource": None,
            },
            {
                "step_number": 6,
                "title": "Be alert for follow-up scams",
                "why": "Scammers often target the same victim again, sometimes pretending to help recover losses or posing as police/bank officials.",
                "how": "Block the scammer's number. No legitimate authority will ever call you asking for OTP, PIN, or money to 'process your complaint.' If someone calls claiming to be from CBI/police about your complaint, hang up and call the official number directly.",
                "is_urgent": False,
                "official_resource": None,
            },
        ],
    },

    # ─── Default: Not sure / safe default ─ MEDIUM ────────────────────────────
    "default_safe": {
        "severity": "medium",
        "title": "Safety Check — Precautionary Steps",
        "title_bn": "নিরাপত্তা পরীক্ষা — সতর্কতামূলক পদক্ষেপ",
        "title_hi": "सुरक्षा जांच — एहतियाती कदम",
        "steps": [
            {
                "step_number": 1,
                "title": "Take a breath — you're doing the right thing by checking",
                "why": "Seeking help is the first and most important step. Let's figure out what happened and what you need to do.",
                "how": "We'll go through some precautionary steps based on what you've told us. These are safe to follow even if it turns out not to be a scam.",
                "is_urgent": False,
                "official_resource": None,
            },
            {
                "step_number": 2,
                "title": "Do NOT respond to the suspicious contact",
                "why": "Engaging further gives scammers more opportunities to pressure or trick you.",
                "how": "Do not reply to messages, return calls, or click any links from the suspicious contact. If they call again, do not pick up. Block the number.",
                "is_urgent": True,
                "official_resource": None,
            },
            {
                "step_number": 3,
                "title": "Check if any money or credentials were compromised",
                "why": "Sometimes people share information without realizing its significance. A quick review ensures nothing was missed.",
                "how": "Review the conversation: Did you share any OTP, PIN, password, or bank details? Did you click any links and enter information? Did you install any apps they suggested? If yes to any, come back to this tool and tell us — we'll give you a more specific plan.",
                "is_urgent": False,
                "official_resource": None,
            },
            {
                "step_number": 4,
                "title": "Report the suspicious communication",
                "why": "Even if no harm was done, reporting helps authorities identify and stop scam operations.",
                "how": "Report on Chakshu (sancharsaathi.gov.in) — this is the government portal specifically for suspicious communications where no money was lost.",
                "is_urgent": False,
                "official_resource": OFFICIAL_RESOURCES["chakshu"]["url"],
            },
            {
                "step_number": 5,
                "title": "Share this incident with a trusted family member",
                "why": "A second perspective helps identify scams you might miss. Family awareness also protects other members from the same scam.",
                "how": "Tell a trusted family member about the suspicious contact. If you've linked a guardian on Scam Shield, they've been notified. Show them the messages if you're comfortable.",
                "is_urgent": False,
                "official_resource": None,
            },
            {
                "step_number": 6,
                "title": "Remember: no legitimate organization asks for OTP or PIN",
                "why": "This is the single most important rule that prevents most scams.",
                "how": "Banks, government agencies, and delivery services will NEVER call or message asking for your OTP, PIN, password, or to install a screen-sharing app. If anyone does, it is a scam — every single time, without exception.",
                "is_urgent": False,
                "official_resource": None,
            },
        ],
    },
}


def get_template(key: str) -> dict:
    """Get a template by key, falling back to default."""
    return EMERGENCY_TEMPLATES.get(key, EMERGENCY_TEMPLATES["default_safe"])


def get_all_template_keys() -> list[str]:
    """Get all template keys."""
    return list(EMERGENCY_TEMPLATES.keys())
