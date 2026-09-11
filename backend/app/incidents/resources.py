"""
Official resources — verified government helplines, portals, and bank hotlines.
These are the ONLY phone numbers and URLs that may appear in emergency plans.
The validator (response/validator.py) enforces this constraint.
"""

# ─── Government Resources ────────────────────────────────────────────────────

OFFICIAL_RESOURCES = {
    # Primary emergency lines
    "cybercrime_helpline": {
        "name": "National Cyber Crime Helpline",
        "phone": "1930",
        "url": "https://cybercrime.gov.in",
        "when": "money_lost",
        "description": "Call immediately if you have lost money to a scam. Available 24/7.",
        "description_bn": "আপনি যদি প্রতারণায় টাকা হারিয়ে থাকেন তাহলে এখনই কল করুন। ২৪/৭ উপলব্ধ।",
        "description_hi": "यदि आपने धोखाधड़ी में पैसे खोए हैं तो तुरंत कॉल करें। 24/7 उपलब्ध।",
    },
    "chakshu": {
        "name": "Chakshu (Sanchar Saathi)",
        "phone": None,
        "url": "https://sancharsaathi.gov.in/sfc/Home/sfc-complaint.jsp",
        "when": "suspicious_no_loss",
        "description": "Report suspicious communications when no money has been lost yet.",
        "description_bn": "সন্দেহজনক যোগাযোগের রিপোর্ট করুন যখন এখনও টাকা হারাননি।",
        "description_hi": "संदिग्ध संचार की रिपोर्ट करें जब अभी तक पैसे नहीं खोए हैं।",
    },
    "police": {
        "name": "Police Emergency",
        "phone": "112",
        "url": None,
        "when": "any_emergency",
        "description": "Call police if you feel physically threatened or unsafe.",
        "description_bn": "শারীরিকভাবে হুমকি বা অনিরাপদ মনে হলে পুলিশকে কল করুন।",
        "description_hi": "शारीरिक रूप से खतरा या असुरक्षित महसूस करने पर पुलिस को कॉल करें।",
    },

    # Bank hotlines (major banks)
    "sbi": {
        "name": "State Bank of India",
        "phone": "1800-111-111",
        "url": "https://sbi.co.in",
        "when": "bank_freeze",
        "description": "SBI toll-free helpline for blocking cards and accounts.",
    },
    "hdfc": {
        "name": "HDFC Bank",
        "phone": "1800-1600",
        "url": "https://hdfcbank.com",
        "when": "bank_freeze",
        "description": "HDFC toll-free helpline for blocking cards and accounts.",
    },
    "icici": {
        "name": "ICICI Bank",
        "phone": "1800-1080",
        "url": "https://icicibank.com",
        "when": "bank_freeze",
        "description": "ICICI toll-free helpline for blocking cards and accounts.",
    },
    "axis": {
        "name": "Axis Bank",
        "phone": "1800-419-5555",
        "url": "https://axisbank.com",
        "when": "bank_freeze",
        "description": "Axis Bank toll-free helpline for blocking cards and accounts.",
    },
    "pnb": {
        "name": "Punjab National Bank",
        "phone": "1800-180-2222",
        "url": "https://pnbindia.in",
        "when": "bank_freeze",
        "description": "PNB toll-free helpline for blocking cards and accounts.",
    },
    "bob": {
        "name": "Bank of Baroda",
        "phone": "1800-5700",
        "url": "https://bankofbaroda.in",
        "when": "bank_freeze",
        "description": "Bank of Baroda toll-free helpline.",
    },

    # UPI
    "npci_upi": {
        "name": "NPCI UPI Helpline",
        "phone": "1800-120-1740",
        "url": "https://npci.org.in",
        "when": "upi_fraud",
        "description": "NPCI helpline for UPI-related fraud disputes.",
    },

    # RBI
    "rbi_ombudsman": {
        "name": "RBI Integrated Ombudsman",
        "phone": "14448",
        "url": "https://cms.rbi.org.in",
        "when": "bank_dispute",
        "description": "RBI Ombudsman for banking complaints if bank doesn't help within 30 days.",
    },
}


def get_all_official_phones() -> set[str]:
    """Return all official phone numbers for validation."""
    phones = set()
    for resource in OFFICIAL_RESOURCES.values():
        if resource.get("phone"):
            phones.add(resource["phone"])
    return phones


def get_all_official_urls() -> set[str]:
    """Return all official URLs for validation."""
    urls = set()
    for resource in OFFICIAL_RESOURCES.values():
        if resource.get("url"):
            urls.add(resource["url"])
    return urls


def get_resource_for_situation(situation: str) -> list[dict]:
    """Get relevant resources for a given situation."""
    return [
        resource for resource in OFFICIAL_RESOURCES.values()
        if resource.get("when") == situation
    ]


# Routing logic from the blueprint:
# money lost → 1930 / cybercrime.gov.in
# suspicious comms, no loss → Chakshu (Sanchar Saathi)
def route_resources(money_lost: bool) -> list[dict]:
    """Route to correct resource based on whether money was lost."""
    if money_lost:
        return [
            OFFICIAL_RESOURCES["cybercrime_helpline"],
            OFFICIAL_RESOURCES["npci_upi"],
        ]
    else:
        return [
            OFFICIAL_RESOURCES["chakshu"],
        ]
